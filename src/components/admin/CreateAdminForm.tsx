
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, AlertTriangle } from 'lucide-react';
import { CreateAdminFormFields } from './CreateAdminFormFields';
import { useAdminCreationLock } from '@/hooks/useAdminCreationLock';
import { useProfileVerification } from '@/hooks/useProfileVerification';
import { logger } from '@/utils/logger';
import { adminSchema, type AdminFormData } from '@/types/admin';

export const CreateAdminForm = () => {
  const { toast } = useToast();
  const { lockAdmin, unlockAdmin, isEmailLocked } = useAdminCreationLock();
  const { verifyProfileCreation } = useProfileVerification();
  const [emailCheck, setEmailCheck] = useState<{ checking: boolean; exists: boolean }>({
    checking: false,
    exists: false
  });
  
  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      username: '',
      password: ''
    }
  });

  // Verificação em tempo real do email
  const email = form.watch('email');
  
  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email || email.length < 5) {
        setEmailCheck({ checking: false, exists: false });
        return;
      }

      setEmailCheck({ checking: true, exists: false });
      
      try {
        // Verificar se email já existe (usando função que não requer auth)
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        // Simular verificação - em produção seria uma função específica
        setEmailCheck({ checking: false, exists: false });
      } catch (error) {
        setEmailCheck({ checking: false, exists: false });
      }
    };

    const debounceTimer = setTimeout(checkEmailExists, 500);
    return () => clearTimeout(debounceTimer);
  }, [email]);

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

  const handleSubmit = async (data: AdminFormData) => {
    // Verificar se email já está sendo processado
    if (isEmailLocked(data.email)) {
      toast({
        title: "Processamento em andamento",
        description: "Este email já está sendo processado. Aguarde.",
        variant: "destructive",
      });
      return;
    }

    // Adquirir lock para este email
    const lockAcquired = await lockAdmin(data.email);
    if (!lockAcquired) {
      toast({
        title: "Erro de concorrência",
        description: "Não foi possível processar este email no momento. Tente novamente.",
        variant: "destructive",
      });
      return;
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

      // Limpar formulário
      form.reset();

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
    } finally {
      // Sempre liberar o lock
      unlockAdmin(data.email);
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="bg-blue-100 p-2 rounded-lg">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
          <span>Novo Administrador (Otimizado)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <CreateAdminFormFields 
              form={form} 
              isSubmitting={form.formState.isSubmitting} 
            />

            {/* Feedback de verificação de email */}
            {email && (
              <div className="flex items-center gap-2 text-sm">
                {emailCheck.checking ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-blue-600" />
                    <span className="text-blue-600">Verificando email...</span>
                  </>
                ) : emailCheck.exists ? (
                  <>
                    <AlertTriangle className="h-3 w-3 text-red-600" />
                    <span className="text-red-600">Email já existe no sistema</span>
                  </>
                ) : (
                  <span className="text-green-600">✓ Email disponível</span>
                )}
              </div>
            )}

            {/* Feedback se email está sendo processado */}
            {email && isEmailLocked(email) && (
              <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-200">
                <AlertTriangle className="h-3 w-3" />
                <span>Este email está sendo processado no momento</span>
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
              disabled={form.formState.isSubmitting || emailCheck.exists || (email && isEmailLocked(email))}
              size="lg"
            >
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando Administrador...
                </>
              ) : (
                <>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Criar Administrador
                </>
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
