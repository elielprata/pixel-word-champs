
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm = ({ onSwitchToRegister }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    logger.info('Tentativa de login iniciada', { email }, 'LOGIN_FORM');

    try {
      const result = await signIn(email, password);
      
      if (result.error) {
        logger.error('Erro no login', { error: result.error }, 'LOGIN_FORM');
        toast({
          title: "Erro no login",
          description: result.error,
          variant: "destructive",
        });
      } else {
        logger.info('Login realizado com sucesso', { email }, 'LOGIN_FORM');
        toast({
          title: "Sucesso!",
          description: "Login realizado com sucesso",
        });
      }
    } catch (error) {
      logger.error('Erro inesperado no login', { error }, 'LOGIN_FORM');
      toast({
        title: "Erro",
        description: "Erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-purple-800">
          Entrar
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder="Senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            onClick={onSwitchToRegister}
            className="text-purple-600"
          >
            Não tem conta? Cadastre-se
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoginForm;
