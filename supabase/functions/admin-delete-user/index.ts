
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId, adminPassword, adminId } = await req.json()

    console.log('🗑️ Iniciando exclusão completa do usuário:', { userId, adminId })

    if (!userId || !adminPassword || !adminId) {
      throw new Error('Parâmetros obrigatórios: userId, adminPassword, adminId')
    }

    // Validar se o admin existe e tem permissões
    const { data: adminProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', adminId)
      .single()

    if (!adminProfile) {
      throw new Error('Admin não encontrado')
    }

    // Verificar se o admin tem role de admin
    const { data: adminRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminId)
      .eq('role', 'admin')
      .single()

    if (!adminRoles) {
      throw new Error('Usuário não tem permissões de administrador')
    }

    // Validar senha do admin usando auth
    const { data: authUser } = await supabase.auth.admin.getUserById(adminId)
    if (!authUser.user?.email) {
      throw new Error('Email do administrador não encontrado')
    }

    // Tentar fazer login para validar a senha
    const { error: passwordError } = await supabase.auth.signInWithPassword({
      email: authUser.user.email,
      password: adminPassword
    })

    if (passwordError) {
      throw new Error('Senha de administrador incorreta')
    }

    console.log('✅ Credenciais do admin validadas')

    // Verificar se não é o próprio admin tentando se deletar
    if (adminId === userId) {
      throw new Error('Você não pode excluir sua própria conta')
    }

    // Buscar dados do usuário para logs
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    console.log('🧹 Iniciando limpeza de dados relacionados')

    // 1. Histórico de palavras
    await supabase.from('user_word_history').delete().eq('user_id', userId)
    
    // 2. Palavras encontradas (via sessões)
    const { data: userSessions } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('user_id', userId)

    if (userSessions && userSessions.length > 0) {
      const sessionIds = userSessions.map(s => s.id)
      await supabase.from('words_found').delete().in('session_id', sessionIds)
    }

    // 3. Sessões de jogo
    await supabase.from('game_sessions').delete().eq('user_id', userId)
    
    // 4. Participações em competições
    await supabase.from('competition_participations').delete().eq('user_id', userId)
    
    // 5. Rankings semanais
    await supabase.from('weekly_rankings').delete().eq('user_id', userId)
    
    // 6. Histórico de pagamentos
    await supabase.from('payment_history').delete().eq('user_id', userId)
    
    // 7. Distribuições de prêmios
    await supabase.from('prize_distributions').delete().eq('user_id', userId)
    
    // 8. Convites relacionados
    await supabase.from('invite_rewards').delete().or(`user_id.eq.${userId},invited_user_id.eq.${userId}`)
    await supabase.from('invites').delete().or(`invited_by.eq.${userId},used_by.eq.${userId}`)
    
    // 9. Relatórios de usuário
    await supabase.from('user_reports').delete().eq('user_id', userId)
    
    // 10. Progresso em desafios
    await supabase.from('challenge_progress').delete().eq('user_id', userId)
    
    // 11. Histórico de competições
    await supabase.from('competition_history').delete().eq('user_id', userId)
    
    // 12. Roles do usuário
    await supabase.from('user_roles').delete().eq('user_id', userId)

    // 13. CRITICAL: Deletar registros de admin_actions que referenciam este usuário
    // tanto como admin quanto como target_user
    await supabase.from('admin_actions').delete().eq('admin_id', userId)
    await supabase.from('admin_actions').delete().eq('target_user_id', userId)

    console.log('✅ Limpeza de dados relacionados concluída')

    // 14. Registrar ação administrativa ANTES de deletar (agora é seguro)
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        target_user_id: userId,
        action_type: 'delete_user',
        details: { 
          timestamp: new Date().toISOString(),
          username: userProfile?.username || 'Usuário não encontrado'
        }
      })

    if (logError) {
      console.warn('⚠️ Erro ao registrar log:', logError.message)
    }

    // 15. Deletar o perfil do usuário
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      throw new Error(`Erro ao excluir perfil: ${deleteProfileError.message}`)
    }

    console.log('✅ Perfil do usuário excluído')

    // 16. Deletar o usuário do auth system com service_role
    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    
    if (deleteAuthError) {
      console.error('❌ Erro ao deletar usuário do auth:', deleteAuthError.message)
      throw new Error(`Erro ao deletar usuário do sistema de autenticação: ${deleteAuthError.message}`)
    }

    console.log('✅ Usuário completamente removido do sistema de autenticação')

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário excluído completamente do sistema',
        deletedUserId: userId,
        deletedUsername: userProfile?.username
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Erro na exclusão:', error.message)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
