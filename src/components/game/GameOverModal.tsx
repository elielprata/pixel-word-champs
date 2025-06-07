
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StopCircle, Trophy, Play } from 'lucide-react';

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
  const [isWatchingAd, setIsWatchingAd] = useState(false);

  if (!isOpen) return null;

  const handleReviveClick = () => {
    console.log('Iniciando anúncio para revive...');
    setIsWatchingAd(true);
    
    // Simular anúncio de 30 segundos
    setTimeout(() => {
      console.log('Anúncio concluído - ativando revive');
      setIsWatchingAd(false);
      onRevive();
    }, 3000); // 3 segundos para demo, seria 30s real
  };

  if (isWatchingAd) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Card className="w-80 m-4">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold mb-2 text-white">Anúncio em Exibição</h3>
            <p className="text-gray-300">Aguarde para receber +30 segundos...</p>
            <div className="mt-4 bg-gray-800 rounded-lg p-3">
              <p className="text-sm text-gray-400">O anúncio será fechado automaticamente</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            <Button 
              onClick={handleReviveClick}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Reviver (+30s) - Assistir Anúncio
            </Button>
            
            <Button 
              onClick={onGoHome}
              className="w-full bg-red-500 hover:bg-red-600 text-white"
            >
              <StopCircle className="w-4 h-4 mr-2" />
              Quero Parar
            </Button>
          </div>
          
          <p className="text-sm text-green-600 mt-2">
            💡 Você pode usar o revive quantas vezes quiser!
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GameOverModal;
