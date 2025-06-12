
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';

interface BanUserModalProps {
  userId: string;
  username: string;
  isOpen: boolean;
  onClose: () => void;
  onBanUser: (params: { userId: string; reason: string; adminId: string; }) => Promise<void>;
}

export const BanUserModal = ({ userId, username, isOpen, onClose, onBanUser }: BanUserModalProps) => {
  const { user } = useAuth();
  const [banReason, setBanReason] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setIsSubmitting(true);
    try {
      await onBanUser({
        userId,
        reason: banReason,
        adminId: user.id,
      });
      onClose();
    } catch (error) {
      console.error('Error banning user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-destructive">Banir Usuário</DialogTitle>
          <DialogDescription>
            Você está prestes a banir o usuário <span className="font-semibold">{username}</span>. Esta ação é permanente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ban-reason">Motivo do Banimento</Label>
            <Textarea
              id="ban-reason"
              placeholder="Descreva o motivo para o banimento..."
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              required
              className="min-h-[100px]"
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
              disabled={isSubmitting || !banReason}
            >
              {isSubmitting ? 'Banindo...' : 'Banir Usuário'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
