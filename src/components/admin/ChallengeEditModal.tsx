
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface Challenge {
  id: number;
  title: string;
  status: string;
  players: number;
}

interface ChallengeEditModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (challengeId: number, updatedChallenge: Omit<Challenge, 'id'>) => void;
}

export const ChallengeEditModal = ({ challenge, isOpen, onClose, onSave }: ChallengeEditModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    status: 'Agendado',
    description: ''
  });

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        status: challenge.status,
        description: ''
      });
    }
  }, [challenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenge || !formData.title.trim()) return;

    const updatedChallenge = {
      title: formData.title,
      status: formData.status,
      players: challenge.players // Manter o número atual de jogadores
    };

    onSave(challenge.id, updatedChallenge);
    onClose();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Desafio</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título do Desafio</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Ex: Animais do Brasil"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Descreva o tema do desafio..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Agendado">Agendado</SelectItem>
                <SelectItem value="Ativo">Ativo</SelectItem>
                <SelectItem value="Finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="bg-gray-50 p-3 rounded-lg">
            <span className="text-sm text-gray-600">
              Jogadores atuais: <strong>{challenge.players}</strong>
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
