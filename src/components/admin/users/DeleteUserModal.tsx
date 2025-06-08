
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAllUsers } from '@/hooks/useAllUsers';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const DeleteUserModal = ({ isOpen, onClose, user }: DeleteUserModalProps) => {
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmUsername, setConfirmUsername] = useState('');
  const { deleteUser, isDeletingUser } = useAllUsers();

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminPassword) {
      alert('Digite a senha de administrador');
      return;
    }
    
    if (confirmUsername !== user.username) {
      alert('Confirmação do nome de usuário incorreta');
      return;
    }
    
    deleteUser({
      userId: user.id,
      adminPassword
    });
    onClose();
  };

  const handleClose = () => {
    setAdminPassword('');
    setConfirmUsername('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Excluir Usuário
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>ATENÇÃO:</strong> Esta ação é irreversível! O usuário "{user.username}" e todos os seus dados serão excluídos permanentemente do sistema, incluindo:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Dados do perfil</li>
                <li>Histórico de jogos</li>
                <li>Pontuações e rankings</li>
                <li>Todas as sessões de jogo</li>
              </ul>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmUsername">
              Confirme digitando o nome do usuário: <strong>{user.username}</strong>
            </Label>
            <Input
              id="confirmUsername"
              placeholder={`Digite "${user.username}" para confirmar`}
              value={confirmUsername}
              onChange={(e) => setConfirmUsername(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Senha de administrador *</Label>
            <Input
              id="adminPassword"
              type="password"
              placeholder="Digite sua senha de administrador"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
            />
            <p className="text-xs text-slate-500">
              A senha padrão é: admin123
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isDeletingUser || confirmUsername !== user.username}
            >
              {isDeletingUser ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Excluindo...
                </div>
              ) : (
                'Excluir Permanentemente'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
