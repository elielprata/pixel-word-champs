
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, UserPlus, AlertTriangle } from 'lucide-react';
import { CreateAdminFormFields } from './CreateAdminFormFields';
import { useEmailVerification } from '@/hooks/useEmailVerification';
import { useCreateAdmin } from '@/hooks/useCreateAdmin';
import { adminSchema, type AdminFormData } from '@/types/admin';

export const CreateAdminForm = () => {
  const form = useForm<AdminFormData>({
    resolver: zodResolver(adminSchema),
    defaultValues: {
      email: '',
      username: '',
      password: ''
    }
  });

  const email = form.watch('email');
  const emailCheck = useEmailVerification(email);
  const { createAdmin, isEmailLocked } = useCreateAdmin();

  const handleSubmit = async (data: AdminFormData) => {
    const success = await createAdmin(data);
    if (success) {
      form.reset();
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
