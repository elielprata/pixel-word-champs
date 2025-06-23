
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus } from 'lucide-react';
import { CreateAdminFormFields } from './CreateAdminFormFields';
import { logger } from '@/utils/logger';
import { adminSchema, type AdminFormData } from '@/types/admin';

export const CreateAdminForm = () => {
  const { toast } = useToast();
  
  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      username: '',
      password: ''
    }
  });

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

  const verifyProfileCreation = async (userId: string, maxAttempts = 5): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      logger.debug(`Verificando criação do perfil - tentativa ${attempt}`, { userId }, 'CREATE_ADMIN_FORM');
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (!error && profile) {
        logger.info('Perfil criado com sucesso', { userId }, 'CREATE_ADMIN_FORM');
        return true;
      }

      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }

    logger.warn('Perfil não foi criado após múltiplas tentativas', { userId }, 'CREATE_ADMIN_FORM');
    return false;
  };

  const handleSubmit = async (data: AdminFormData) => {
    try {
      logger.info('Iniciando criação de usuário admin', { 
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

      // 3. Verificar se o perfil foi criado pelo trigger
      const profileCreated = await verifyProfileCreation(authData.user.id);
      
      if (!profileCreated) {
        logger.warn('Perfil não foi criado automaticamente, tentando criar manualmente', { userId: authData.user.id }, 'CREATE_ADMIN_FORM');
        
        // Tentar criar perfil manualmente se necessário
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
        description: `Usuário admin ${data.email} criado com sucesso`,
      });

      // Limpar formulário
      form.reset();

    } catch (error: any) {
      logger.error('Erro geral na criação de admin', { error: error.message }, 'CREATE_ADMIN_FORM');
      
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
    }
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="bg-blue-100 p-2 rounded-lg">
            <UserPlus className="h-4 w-4 text-blue-600" />
          </div>
          <span>Novo Administrador</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
            <CreateAdminFormFields 
              form={form} 
              isSubmitting={form.formState.isSubmitting} 
            />

            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
              disabled={form.formState.isSubmitting}
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
