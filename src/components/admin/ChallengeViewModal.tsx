
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Trophy } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  status: string;
  players: number;
}

interface ChallengeViewModalProps {
  challenge: Challenge | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ChallengeViewModal = ({ challenge, isOpen, onClose }: ChallengeViewModalProps) => {
  if (!challenge) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Detalhes do Desafio</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold">{challenge.title}</h2>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3">
              <Trophy className="h-5 w-5 text-blue-600" />
              <div>
                <span className="font-medium">Status:</span>
                <Badge 
                  variant={
                    challenge.status === 'Ativo' ? 'default' :
                    challenge.status === 'Agendado' ? 'secondary' : 'outline'
                  }
                  className="ml-2"
                >
                  {challenge.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-green-600" />
              <span><span className="font-medium">Jogadores:</span> {challenge.players}</span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-600" />
              <span><span className="font-medium">ID:</span> #{challenge.id}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Descrição</h3>
            <p className="text-gray-600">
              Este é um desafio interativo onde os jogadores podem testar seus conhecimentos 
              e competir por pontuações altas.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
