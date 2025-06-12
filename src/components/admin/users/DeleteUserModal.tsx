
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface DeleteUserModalProps {
  userId: string;
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onDeleteUser: (params: { userId: string; adminId: string; }) => Promise<void>;
}

export const DeleteUserModal = ({ userId, username, isOpen, onClose, onDeleteUser }: DeleteUserModalProps) => {
  const { user } = useAuth();
  const [confirmation, setConfirmation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await onDeleteUser({
        userId,
        adminId: user.id
      });
      onClose();
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isConfirmationValid = confirmation.toLowerCase() === username.toLowerCase();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Excluir Usuário</DialogTitle>
          <DialogDescription>
            Você está prestes a excluir o usuário <span className="font-semibold">{username}</span>. Esta ação é permanente e não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="confirmation">
              Digite <span className="font-semibold">{username}</span> para confirmar
            </Label>
            <Input 
              id="confirmation"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder={username}
              required
            />
          </div>

          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="destructive"
              disabled={isSubmitting || !isConfirmationValid}
            >
              {isSubmitting ? 'Excluindo...' : 'Excluir Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
