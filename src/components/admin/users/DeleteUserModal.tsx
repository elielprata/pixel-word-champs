
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { deleteUser, isDeletingUser } = useAllUsers();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!adminPassword.trim()) {
      alert('Digite sua senha de administrador');
      return;
    }
    
    if (confirmUsername !== user.username) {
      alert('Confirmação do nome de usuário incorreta');
      return;
    }

    try {
      setIsSubmitting(true);
      console.log('🗑️ Iniciando exclusão do usuário:', user.username);
      
      await deleteUser(user.id);
      
      // Reset form e fechar modal
      setAdminPassword('');
      setConfirmUsername('');
      onClose();
      
    } catch (error) {
      console.error('❌ Erro na exclusão:', error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isDeletingUser) {
      setAdminPassword('');
      setConfirmUsername('');
      onClose();
    }
  };

  const isLoading = isDeletingUser || isSubmitting;

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
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="adminPassword">Sua senha de administrador *</Label>
            <Input
              id="adminPassword"
              type="password"
              placeholder="Digite sua senha de administrador"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-slate-500">
              Digite sua senha atual para confirmar esta ação
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={isLoading || confirmUsername !== user.username || !adminPassword.trim()}
            >
              {isLoading ? (
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
