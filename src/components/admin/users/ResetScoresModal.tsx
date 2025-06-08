
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

    try {
      await onConfirm(password);
      setPassword('');
      onClose();
    } catch (error: any) {
      console.error('Erro no modal:', error);
      setError(error.message || 'Erro ao zerar pontuações');
    }
  };

  const handleClose = () => {
    if (!isResetting) {
      setPassword('');
      setError('');
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Zerar Pontuação Geral
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p className="text-slate-600">
              Esta ação irá zerar a pontuação total de <strong>todos os usuários</strong> do sistema.
            </p>
            <p className="text-red-600 font-medium">
              ⚠️ Esta operação é irreversível!
            </p>
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>O que será resetado:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
              <li>Pontuação total de todos os usuários</li>
              <li>Número de jogos jogados</li>
              <li>Melhores posições diárias e semanais</li>
              <li>Rankings atuais</li>
            </ul>
          </AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-password">Senha de Administrador</Label>
            <Input
              id="admin-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha de admin"
              disabled={isResetting}
              className={error ? 'border-red-500' : ''}
            />
            <p className="text-xs text-slate-500">
              Senha padrão: admin123
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
            >
              {isResetting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Zerando...
                </>
              ) : (
                'Confirmar Reset'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
