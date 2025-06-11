
import React from 'react';
import { Label } from "@/components/ui/label";
import { Users, Infinity } from 'lucide-react';

interface ParticipantsSectionProps {
  maxParticipants: number;
  onMaxParticipantsChange: (maxParticipants: number) => void;
}

export const ParticipantsSection = ({ maxParticipants, onMaxParticipantsChange }: ParticipantsSectionProps) => {
  // Sempre definindo como 0 (ilimitado) e ignorando as mudanças
  React.useEffect(() => {
    if (maxParticipants !== 0) {
      onMaxParticipantsChange(0);
    }
  }, [maxParticipants, onMaxParticipantsChange]);

  return (
    <div className="space-y-2">
      <Label htmlFor="maxParticipants" className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-3 w-3" />
        Participação
      </Label>
      <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-center gap-2">
        <Infinity className="h-4 w-4 text-green-600" />
        <div>
          <p className="text-sm font-semibold text-green-700">PARTICIPAÇÃO LIVRE</p>
          <p className="text-xs text-green-600">Todos os usuários podem participar sem limite</p>
        </div>
      </div>
    </div>
  );
};
