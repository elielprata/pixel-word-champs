
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Loader2, Shield } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { logger } from '@/utils/logger';

interface ResetScoresModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>;
  isResetting: boolean;
}

export const ResetScoresModal = ({ isOpen, onClose, onConfirm, isResetting }: ResetScoresModalProps) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Senha é obrigatória');
      return;
    }

    logger.info('Enviando formulário de reset de pontuações', undefined, 'RESET_SCORES_MODAL');
    
    try {
      await onConfirm(password);
      logger.info('Reset de pontuações realizado com sucesso', undefined, 'RESET_SCORES_MODAL');
      setPassword('');
      onClose();
    } catch (error: any) {
      logger.error('Erro no reset de pontuações', { error: error.message }, 'RESET_SCORES_MODAL');
      setError(error.message || 'Erro ao zerar pontuações');
    }
  };

  const handleClose = () => {
    logger.debug('Fechando modal de reset de pontuações', undefined, 'RESET_SCORES_MODAL');
    setPassword('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Shield className="h-5 w-5" />
            Confirmação de Segurança
          </DialogTitle>
          <DialogDescription className="space-y-3">
            <div className="text-slate-600">
              <p>Esta ação irá zerar a pontuação total de <strong>todos os usuários</strong> do sistema.</p>
            </div>
            
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>OPERAÇÃO IRREVERSÍVEL!</strong><br />
                Para sua segurança, confirme sua senha atual de login.
              </AlertDescription>
            </Alert>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Sua Senha de Login
            </Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite sua senha atual"
              disabled={isResetting}
              className="border-slate-300 focus:border-red-500"
            />
            <p className="text-xs text-slate-500">
              Esta é a mesma senha que você usa para fazer login no sistema
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isResetting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isResetting || !password.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Executando Reset...
                </>
              ) : (
                <>
                  <Shield className="h-4 w-4 mr-2" />
                  Confirmar e Executar
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
