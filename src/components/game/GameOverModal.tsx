
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Home, Trophy } from 'lucide-react';

interface GameOverModalProps {
  isOpen: boolean;
  score: number;
  wordsFound: number;
  totalWords: number;
  onRevive: () => void;
  onGoHome: () => void;
  canRevive: boolean;
}

const GameOverModal = ({ 
  isOpen, 
  score, 
  wordsFound, 
  totalWords, 
  onRevive, 
  onGoHome,
  canRevive 
}: GameOverModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-80 m-4">
        <CardContent className="p-6 text-center">
          <div className="mb-4">
            <Trophy className="w-16 h-16 mx-auto text-amber-500 mb-2" />
            <h2 className="text-xl font-bold text-gray-800">Tempo Esgotado!</h2>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Pontuação:</span>
              <span className="font-bold text-purple-600">{score}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Palavras:</span>
              <span className="font-bold text-green-600">{wordsFound}/{totalWords}</span>
            </div>
          </div>
          
          <div className="space-y-3">
            {canRevive && (
              <Button 
                onClick={onRevive}
                className="w-full bg-green-500 hover:bg-green-600 text-white"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reviver (+30s) - Assistir Anúncio
              </Button>
            )}
            
            <Button 
              onClick={onGoHome}
              variant="outline"
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Voltar ao Menu
            </Button>
          </div>
          
          {!canRevive && (
            <p className="text-sm text-gray-500 mt-2">
              Você já usou seu revive neste nível
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverModal;
