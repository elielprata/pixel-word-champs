
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Clock, CheckCircle } from 'lucide-react';
import { Competition } from '@/types';

interface CompetitionCardButtonProps {
  competition: Competition;
  onStartChallenge: () => void;
  isActive: boolean;
  isScheduled: boolean;
  isCompleted: boolean;
}

const CompetitionCardButton = ({
  competition,
  onStartChallenge,
  isActive,
  isScheduled,
  isCompleted
}: CompetitionCardButtonProps) => {
  if (isActive) {
    return (
      <Button
        onClick={onStartChallenge}
        size="sm"
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 hover-glow safe-interactive"
      >
        <Play className="w-4 h-4 mr-2" />
        Jogar Agora
      </Button>
    );
  }

  if (isScheduled) {
    return (
      <Button
        disabled
        size="sm"
        variant="outline"
        className="border-orange-300 text-orange-700 bg-orange-50 cursor-not-allowed safe-interactive"
      >
        <Clock className="w-4 h-4 mr-2" />
        Em Breve
      </Button>
    );
  }

  if (isCompleted) {
    return (
      <Button
        disabled
        size="sm"
        variant="outline"
        className="border-green-300 text-green-700 bg-green-50 cursor-not-allowed safe-interactive"
      >
        <CheckCircle className="w-4 h-4 mr-2" />
        Finalizado
      </Button>
    );
  }

  return (
    <Button
      disabled
      size="sm"
      variant="outline"
      className="opacity-50 cursor-not-allowed safe-interactive"
    >
      Indisponível
    </Button>
  );
};

export default CompetitionCardButton;
