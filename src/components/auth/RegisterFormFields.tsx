
import React from 'react';
import { Input } from "@/components/ui/input";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { AvailabilityIndicator } from './AvailabilityIndicator';
import { UseFormReturn } from 'react-hook-form';
import { RegisterForm as RegisterFormType } from '@/types';

interface RegisterFormFieldsProps {
  form: UseFormReturn<RegisterFormType>;
  watchedUsername: string;
  watchedEmail: string;
  usernameCheck: {
    checking: boolean;
    available: boolean;
    exists: boolean;
  };
  emailCheck: {
    checking: boolean;
    available: boolean;
    exists: boolean;
  };
}

export const RegisterFormFields = ({
  form,
  watchedUsername,
  watchedEmail,
  usernameCheck,
  emailCheck
}: RegisterFormFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="username"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Nome de usuário</FormLabel>
            <FormControl>
              <Input 
                placeholder="meu_username" 
                {...field}
                className={
                  watchedUsername && usernameCheck.exists 
                    ? 'border-red-300 bg-red-50' 
                    : watchedUsername && usernameCheck.available 
                    ? 'border-green-300 bg-green-50' 
                    : ''
                }
              />
            </FormControl>
            <AvailabilityIndicator
              checking={usernameCheck.checking}
              available={usernameCheck.available}
              exists={usernameCheck.exists}
              type="username"
              value={watchedUsername}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input 
                placeholder="seu@email.com" 
                type="email"
                {...field}
                className={
                  watchedEmail && emailCheck.exists 
                    ? 'border-red-300 bg-red-50' 
                    : watchedEmail && emailCheck.available 
                    ? 'border-green-300 bg-green-50' 
                    : ''
                }
              />
            </FormControl>
            <AvailabilityIndicator
              checking={emailCheck.checking}
              available={emailCheck.available}
              exists={emailCheck.exists}
              type="email"
              value={watchedEmail}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="password"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Senha</FormLabel>
            <FormControl>
              <Input 
                placeholder="••••••••" 
                type="password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="confirmPassword"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Confirmar senha</FormLabel>
            <FormControl>
              <Input 
                placeholder="••••••••" 
                type="password"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="inviteCode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Código de convite (opcional)</FormLabel>
            <FormControl>
              <Input 
                placeholder="ABC123" 
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
