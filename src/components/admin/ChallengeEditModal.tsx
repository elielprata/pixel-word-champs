
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    description: '',
    startDate: '',
    endDate: ''
  });

  const getStatusFromDates = (startDate: string, endDate: string) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'Agendado';
    } else if (now >= start && now <= end) {
      return 'Ativo';
    } else {
      return 'Finalizado';
    }
  };

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title,
        description: '',
        startDate: '',
        endDate: ''
      });
    }
  }, [challenge]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!challenge || !formData.title.trim() || !formData.startDate || !formData.endDate) return;

    const status = getStatusFromDates(formData.startDate, formData.endDate);

    const updatedChallenge = {
      title: formData.title,
      status: status,
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit-startDate">Data de Início</Label>
              <Input
                id="edit-startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-endDate">Data de Fim</Label>
              <Input
                id="edit-endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                required
              />
            </div>
          </div>

          {formData.startDate && formData.endDate && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-600">
                Status calculado: <strong>{getStatusFromDates(formData.startDate, formData.endDate)}</strong>
              </p>
            </div>
          )}

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
