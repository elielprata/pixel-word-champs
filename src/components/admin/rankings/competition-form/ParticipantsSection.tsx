
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Users } from 'lucide-react';

interface ParticipantsSectionProps {
  maxParticipants: number;
  onMaxParticipantsChange: (maxParticipants: number) => void;
}

export const ParticipantsSection = ({ maxParticipants, onMaxParticipantsChange }: ParticipantsSectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="maxParticipants" className="flex items-center gap-2 text-sm font-medium">
        <Users className="h-3 w-3" />
        Máximo de Participantes
      </Label>
      <Input
        id="maxParticipants"
        type="number"
        min="1"
        value={maxParticipants}
        onChange={(e) => onMaxParticipantsChange(parseInt(e.target.value) || 1000)}
        placeholder="1000"
        className="h-9"
      />
    </div>
  );
};
