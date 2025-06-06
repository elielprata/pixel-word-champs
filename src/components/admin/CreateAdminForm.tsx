
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { Loader2, UserPlus, Mail, User, Key } from 'lucide-react';

export const CreateAdminForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !username) {
      toast({
        title: "Erro",
        description: "Todos os campos são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Erro",
        description: "A senha deve ter pelo menos 6 caracteres",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔧 Iniciando criação de usuário admin:', { email, username });

      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      });

      if (authError) {
        console.error('❌ Erro ao criar usuário:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Usuário não foi criado');
      }

      console.log('✅ Usuário criado no Auth:', authData.user.id);

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
        console.error('❌ Erro ao adicionar role admin:', roleError);
        toast({
          title: "Aviso",
          description: "Usuário criado, mas erro ao definir como admin. Defina manualmente.",
          variant: "destructive",
        });
      } else {
        console.log('✅ Role admin adicionada com sucesso');
      }

      toast({
        title: "Sucesso!",
        description: `Usuário admin ${email} criado com sucesso`,
      });

      // Limpar formulário
      setEmail('');
      setPassword('');
      setUsername('');

    } catch (error: any) {
      console.error('❌ Erro geral:', error);
      
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
    } finally {
      setIsLoading(false);
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
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-500" />
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@exemplo.com"
              disabled={isLoading}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <User className="h-4 w-4 text-slate-500" />
              Nome de Usuário
            </Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="nomedousuario"
              disabled={isLoading}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-slate-700 flex items-center gap-2">
              <Key className="h-4 w-4 text-slate-500" />
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              minLength={6}
              className="border-slate-300 focus:border-blue-500 focus:ring-blue-200"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-sm" 
            disabled={isLoading}
            size="lg"
          >
            {isLoading ? (
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
      </CardContent>
    </Card>
  );
};
