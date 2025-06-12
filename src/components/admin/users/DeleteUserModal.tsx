
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trash2, AlertTriangle } from 'lucide-react';
import { useUserMutations } from '@/hooks/useUserMutations';

interface DeleteUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export const DeleteUserModal = ({ isOpen, onClose, user }: DeleteUserModalProps) => {
  const [confirmUsername, setConfirmUsername] = useState('');
  const { deleteUser, isDeletingUser } = useUserMutations();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (confirmUsername !== user.username) {
      alert('Confirmação do nome de usuário incorreta');
      return;
    }

    try {
      console.log('🗑️ Iniciando exclusão do usuário:', user.username);
      
      await deleteUser({
        userId: user.id
      });
      
      // Reset form e fechar modal
      setConfirmUsername('');
      onClose();
      
    } catch (error) {
      console.error('❌ Erro na exclusão:', error);
      // Não resetar o form se der erro, para o usuário tentar novamente
    }
  };

  const handleClose = () => {
    if (!isDeletingUser) {
      setConfirmUsername('');
      onClose();
    }
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
                <li>Participações em competições</li>
                <li>Convites e recompensas</li>
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
              disabled={isDeletingUser}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isDeletingUser}
            >
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
