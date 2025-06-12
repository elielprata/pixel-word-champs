
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Mail, User, Key } from 'lucide-react';
import { logger } from '@/utils/logger';

const adminSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
  username: z.string().min(3, 'Nome de usuário deve ter pelo menos 3 caracteres'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres')
});

type AdminFormData = z.infer<typeof adminSchema>;

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

  const handleSubmit = async (data: AdminFormData) => {
    try {
      logger.info('Iniciando criação de usuário admin', { 
        email: data.email, 
        username: data.username 
      }, 'CREATE_ADMIN_FORM');

      // 1. Criar usuário no Supabase Auth
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

      // 2. Aguardar um momento para o trigger criar o perfil
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 3. Adicionar role de admin
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
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-slate-500" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="admin@exemplo.com"
                      type="email"
                      disabled={form.formState.isSubmitting}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-500" />
                    Nome de Usuário
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="nomedousuario"
                      disabled={form.formState.isSubmitting}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <Key className="h-4 w-4 text-slate-500" />
                    Senha
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="••••••••"
                      type="password"
                      disabled={form.formState.isSubmitting}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
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
