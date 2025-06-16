
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from 'lucide-react';

interface GameBackButtonProps {
  onBack: () => void;
}

const GameBackButton = ({ onBack }: GameBackButtonProps) => {
  return (
    <div className="absolute top-4 left-4 z-20">
      <Button
        variant="outline"
        size="sm"
        onClick={onBack}
        className="
          bg-white/95 backdrop-blur-md border-2 border-white/40 
          hover:bg-white hover:border-white/60 
          shadow-lg hover:shadow-xl 
          transition-all duration-300 
          transform hover:scale-105 active:scale-95
          rounded-xl px-3 py-2
        "
      >
        <ArrowLeft className="w-4 h-4 text-gray-700" />
        <span className="text-gray-700 font-medium ml-1">Voltar</span>
      </Button>
    </div>
  );
};

export default GameBackButton;
