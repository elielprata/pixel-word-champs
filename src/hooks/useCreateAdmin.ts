
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAdminCreationLock } from '@/hooks/useAdminCreationLock';
import { useProfileVerification } from '@/hooks/useProfileVerification';
import { logger } from '@/utils/logger';
import { type AdminFormData } from '@/types/admin';

export const useCreateAdmin = () => {
  const { toast } = useToast();
  const { lockAdmin, unlockAdmin, isEmailLocked } = useAdminCreationLock();
  const { verifyProfileCreation } = useProfileVerification();

  const validateAdminPermissions = async () => {
    try {
      const { data: isAdmin } = await supabase.rpc('is_admin');
      if (!isAdmin) {
        throw new Error('Usuário atual não tem permissão de administrador');
      }
      return true;
    } catch (error: any) {
      logger.error('Erro na validação de permissões admin', { error: error.message }, 'CREATE_ADMIN_FORM');
      throw error;
    }
  };

  const createAdmin = async (data: AdminFormData) => {
    // Verificar se email já está sendo processado
    if (isEmailLocked(data.email)) {
      toast({
        title: "Processamento em andamento",
        description: "Este email já está sendo processado. Aguarde.",
        variant: "destructive",
      });
      return false;
    }

    // Adquirir lock para este email
    const lockAcquired = await lockAdmin(data.email);
    if (!lockAcquired) {
      toast({
        title: "Erro de concorrência",
        description: "Não foi possível processar este email no momento. Tente novamente.",
        variant: "destructive",
      });
      return false;
    }

    try {
      logger.info('Iniciando criação otimizada de usuário admin', { 
        email: data.email, 
        username: data.username 
      }, 'CREATE_ADMIN_FORM');

      // 1. Validar permissões do admin atual
      await validateAdminPermissions();

      // 2. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            username: data.username
          }
        }
      });

      if (authError) {
        logger.error('Erro ao criar usuário', { error: authError.message }, 'CREATE_ADMIN_FORM');
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      logger.info('Usuário criado no Auth', { userId: authData.user.id }, 'CREATE_ADMIN_FORM');

      // 3. Verificar criação do perfil com verificação inteligente
      const verificationResult = await verifyProfileCreation(authData.user.id);
      
      if (!verificationResult.success) {
        logger.warn('Perfil não foi criado automaticamente, tentando criar manualmente', { 
          userId: authData.user.id,
          verificationResult 
        }, 'CREATE_ADMIN_FORM');
        
        // Tentar criar perfil manualmente
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            username: data.username
          });

        if (profileError) {
          logger.error('Erro ao criar perfil manualmente', { error: profileError.message }, 'CREATE_ADMIN_FORM');
        }
      }

      // 4. Adicionar role de admin
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: authData.user.id,
          role: 'admin'
        });

      if (roleError) {
        logger.error('Erro ao adicionar role admin', { error: roleError.message }, 'CREATE_ADMIN_FORM');
        toast({
          title: "Aviso",
          description: "Usuário criado, mas erro ao definir como admin. Defina manualmente.",
          variant: "destructive",
        });
      } else {
        logger.info('Role admin adicionada com sucesso', { userId: authData.user.id }, 'CREATE_ADMIN_FORM');
      }

      toast({
        title: "Sucesso!",
        description: `Usuário admin ${data.email} criado em ${verificationResult.duration}ms (${verificationResult.attempts} tentativas)`,
      });

      return true;

    } catch (error: any) {
      logger.error('Erro geral na criação otimizada de admin', { error: error.message }, 'CREATE_ADMIN_FORM');
      
      let errorMessage = "Erro ao criar usuário admin";
      
      if (error.message?.includes('already registered')) {
        errorMessage = "Este email já está registrado";
      } else if (error.message?.includes('invalid email')) {
        errorMessage = "Email inválido";
      } else if (error.message?.includes('não tem permissão')) {
        errorMessage = "Você não tem permissão para criar administradores";
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    } finally {
      // Sempre liberar o lock
      unlockAdmin(data.email);
    }
  };

  return {
    createAdmin,
    isEmailLocked
  };
};
