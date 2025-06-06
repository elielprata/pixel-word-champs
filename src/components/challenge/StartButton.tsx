
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play } from 'lucide-react';

interface StartButtonProps {
  onStart: () => void;
  color: string;
}

const StartButton = ({ onStart, color }: StartButtonProps) => {
  return (
    <div className="text-center">
      <Button 
        onClick={onStart} 
        size="lg" 
        className={`bg-gradient-to-r ${color} hover:opacity-90 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
      >
        <Play className="w-6 h-6 mr-3" />
        Iniciar Desafio
      </Button>
      <p className="text-sm text-gray-500 mt-3">
        Boa sorte! Encontre o máximo de palavras possível 🎯
      </p>
    </div>
  );
};

export default StartButton;
