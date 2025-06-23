
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, Mail, User, Lock } from 'lucide-react';
import { type AdminFormData } from '@/types/admin';

interface CreateAdminFormFieldsProps {
  form: UseFormReturn<AdminFormData>;
  isSubmitting: boolean;
}

export const CreateAdminFormFields = ({ form, isSubmitting }: CreateAdminFormFieldsProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center gap-2 text-slate-700">
              <Mail className="h-4 w-4 text-blue-600" />
              Email
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="email"
                placeholder="admin@exemplo.com"
                disabled={isSubmitting}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
            <FormLabel className="flex items-center gap-2 text-slate-700">
              <User className="h-4 w-4 text-blue-600" />
              Nome de Usuário
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                placeholder="admin_usuario"
                disabled={isSubmitting}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
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
            <FormLabel className="flex items-center gap-2 text-slate-700">
              <Lock className="h-4 w-4 text-blue-600" />
              Senha
            </FormLabel>
            <FormControl>
              <Input
                {...field}
                type="password"
                placeholder="••••••••"
                disabled={isSubmitting}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
