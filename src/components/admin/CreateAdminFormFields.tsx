
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Mail, User, Key } from 'lucide-react';

interface AdminFormData {
  email: string;
  username: string;
  password: string;
}

interface CreateAdminFormFieldsProps {
  form: UseFormReturn<AdminFormData>;
  isSubmitting: boolean;
}

export const CreateAdminFormFields = ({ form, isSubmitting }: CreateAdminFormFieldsProps) => {
  return (
    <>
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
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
                disabled={isSubmitting}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
