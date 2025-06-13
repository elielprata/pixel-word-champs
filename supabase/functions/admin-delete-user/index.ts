
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

    if (!userId || !adminId) {
      throw new Error('Parâmetros obrigatórios: userId, adminId')
    }

    // Validar se o admin existe e tem permissões
    console.log('🔍 Verificando se admin existe...')
    const { data: adminProfile, error: adminProfileError } = await supabase
      .from('profiles')
      .select('id, username')
      .eq('id', adminId)
      .single()

    if (adminProfileError || !adminProfile) {
      console.error('❌ Admin não encontrado:', adminProfileError?.message)
      throw new Error('Admin não encontrado')
    }

    console.log('✅ Admin encontrado:', adminProfile.username)

    // Verificar se o admin tem role de admin
    console.log('🔍 Verificando permissões de admin...')
    const { data: adminRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', adminId)
      .eq('role', 'admin')
      .single()

    if (rolesError || !adminRoles) {
      console.error('❌ Usuário não tem permissões de administrador:', rolesError?.message)
      throw new Error('Usuário não tem permissões de administrador')
    }

    console.log('✅ Permissões de admin validadas')

    // Verificar se não é o próprio admin tentando se deletar
    if (adminId === userId) {
      throw new Error('Você não pode excluir sua própria conta')
    }

    // Buscar dados do usuário para logs
    console.log('🔍 Buscando dados do usuário a ser excluído...')
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()

    console.log('🧹 Iniciando limpeza de dados relacionados')

    // 1. CRITICAL: Deletar registros de admin_actions que referenciam este usuário PRIMEIRO
    console.log('🧹 Limpando admin_actions...')
    await supabase.from('admin_actions').delete().eq('admin_id', userId)
    await supabase.from('admin_actions').delete().eq('target_user_id', userId)

    // 2. Histórico de palavras
    console.log('🧹 Limpando user_word_history...')
    await supabase.from('user_word_history').delete().eq('user_id', userId)
    
    // 3. Palavras encontradas (via sessões)
    console.log('🧹 Limpando words_found...')
    const { data: userSessions } = await supabase
      .from('game_sessions')
      .select('id')
      .eq('user_id', userId)

    if (userSessions && userSessions.length > 0) {
      const sessionIds = userSessions.map(s => s.id)
      await supabase.from('words_found').delete().in('session_id', sessionIds)
    }

    // 4. Sessões de jogo
    console.log('🧹 Limpando game_sessions...')
    await supabase.from('game_sessions').delete().eq('user_id', userId)
    
    // 5. Participações em competições
    console.log('🧹 Limpando competition_participations...')
    await supabase.from('competition_participations').delete().eq('user_id', userId)
    
    // 6. Rankings semanais
    console.log('🧹 Limpando weekly_rankings...')
    await supabase.from('weekly_rankings').delete().eq('user_id', userId)
    
    // 7. Histórico de pagamentos
    console.log('🧹 Limpando payment_history...')
    await supabase.from('payment_history').delete().eq('user_id', userId)
    
    // 8. Distribuições de prêmios
    console.log('🧹 Limpando prize_distributions...')
    await supabase.from('prize_distributions').delete().eq('user_id', userId)
    
    // 9. Convites relacionados
    console.log('🧹 Limpando invite_rewards e invites...')
    await supabase.from('invite_rewards').delete().or(`user_id.eq.${userId},invited_user_id.eq.${userId}`)
    await supabase.from('invites').delete().or(`invited_by.eq.${userId},used_by.eq.${userId}`)
    
    // 10. Relatórios de usuário
    console.log('🧹 Limpando user_reports...')
    await supabase.from('user_reports').delete().eq('user_id', userId)
    
    // 11. Progresso em desafios
    console.log('🧹 Limpando challenge_progress...')
    await supabase.from('challenge_progress').delete().eq('user_id', userId)
    
    // 12. Histórico de competições
    console.log('🧹 Limpando competition_history...')
    await supabase.from('competition_history').delete().eq('user_id', userId)
    
    // 13. Roles do usuário
    console.log('🧹 Limpando user_roles...')
    await supabase.from('user_roles').delete().eq('user_id', userId)

    console.log('✅ Limpeza de dados relacionados concluída')

    // 14. Registrar ação administrativa ANTES de deletar o perfil
    console.log('📝 Registrando ação administrativa...')
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
    } else {
      console.log('✅ Log registrado com sucesso')
    }

    // 15. Deletar o perfil do usuário
    console.log('🗑️ Deletando perfil do usuário...')
    const { error: deleteProfileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId)

    if (deleteProfileError) {
      console.error('❌ Erro ao excluir perfil:', deleteProfileError.message)
      throw new Error(`Erro ao excluir perfil: ${deleteProfileError.message}`)
    }

    console.log('✅ Perfil do usuário excluído')

    // 16. Deletar o usuário do auth system com service_role
    console.log('🗑️ Deletando usuário do sistema de autenticação...')
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
