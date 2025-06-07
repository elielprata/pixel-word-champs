
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, ArrowRight } from 'lucide-react';

interface LevelCompleteModalProps {
  isOpen: boolean;
  level: number;
  score: number;
  onAdvance: () => void;
  onStay: () => void;
}

const LevelCompleteModal = ({ 
  isOpen, 
  level, 
  score, 
  onAdvance, 
  onStay 
}: LevelCompleteModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-80 m-4">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-2" />
            <h2 className="text-xl font-bold text-gray-800">Nível {level} Completado!</h2>
            <p className="text-gray-600 mt-2">Excelente trabalho! Você demonstrou grande habilidade neste nível.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-center items-center">
              <span className="text-gray-600 mr-2">Pontuação:</span>
              <span className="font-bold text-purple-600 text-lg">{score}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={onAdvance}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <ArrowRight className="w-4 h-4 mr-2" />
              Iniciar
            </Button>
            
            <Button 
              onClick={onStay}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              Quero Parar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LevelCompleteModal;
