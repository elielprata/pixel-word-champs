
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.10'
import { corsHeaders } from '../_shared/cors.ts'

// Inicializar cliente Supabase com configurações específicas para operações administrativas
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    global: {
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''}`
      }
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

    console.log('🗑️ Iniciando exclusão SIMPLIFICADA do usuário:', { userId, adminId })

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

    console.log('🧹 Iniciando exclusão OTIMIZADA com CASCADE')

    // IMPORTANTE: Registrar ação administrativa ANTES da exclusão
    // Isso permite rastrear quem fez a exclusão
    console.log('📝 Registrando ação administrativa...')
    const { error: logError } = await supabase
      .from('admin_actions')
      .insert({
        admin_id: adminId,
        target_user_id: null, // Não referenciar o usuário que será deletado
        action_type: 'delete_user',
        details: { 
          timestamp: new Date().toISOString(),
          deleted_user_id: userId,
          username: userProfile?.username || 'Usuário não encontrado'
        }
      })

    if (logError) {
      console.warn('⚠️ Erro ao registrar log:', logError.message)
    } else {
      console.log('✅ Log registrado com sucesso')
    }

    // Agora deletar o usuário do auth system
    // As foreign keys CASCADE farão toda a limpeza automaticamente
    console.log('🗑️ Deletando usuário do sistema de autenticação...')
    console.log('🔧 Configuração do cliente:', {
      url: Deno.env.get('SUPABASE_URL') ? 'SET' : 'NOT_SET',
      serviceKey: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ? 'SET' : 'NOT_SET',
      serviceKeyLength: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.length || 0
    })

    try {
      const { data: deleteAuthData, error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
      
      if (deleteAuthError) {
        console.error('❌ Erro detalhado ao deletar usuário do auth:', {
          message: deleteAuthError.message,
          code: deleteAuthError.code || 'NO_CODE',
          status: deleteAuthError.status || 'NO_STATUS',
          details: deleteAuthError
        })
        throw new Error(`Erro ao deletar usuário do sistema de autenticação: ${deleteAuthError.message}`)
      }

      console.log('✅ Resposta da API de auth:', deleteAuthData)
      console.log('✅ Usuário completamente removido do sistema')
      console.log('🧹 Todas as tabelas relacionadas foram limpas automaticamente via CASCADE')

    } catch (authDeleteError) {
      console.error('❌ Exceção capturada ao deletar do auth:', {
        message: authDeleteError.message,
        name: authDeleteError.name,
        stack: authDeleteError.stack
      })
      throw new Error(`Erro crítico ao deletar usuário do sistema de autenticação: ${authDeleteError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Usuário excluído completamente do sistema',
        deletedUserId: userId,
        deletedUsername: userProfile?.username,
        method: 'CASCADE_DELETE'
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
