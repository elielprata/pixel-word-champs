
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Clock, Target, Lightbulb } from 'lucide-react';
import GameBoard from './GameBoard';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutos
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  const challengeData = {
    1: { title: "Desafio Matinal", description: "Palavras relacionadas ao café da manhã" },
    2: { title: "Animais Selvagens", description: "Encontre os animais escondidos" },
    3: { title: "Cidades do Brasil", description: "Conheça as cidades brasileiras" },
  }[challengeId] || { title: "Desafio", description: "Encontre as palavras escondidas" };

  useEffect(() => {
    if (isGameStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isGameStarted, timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const startGame = () => {
    setShowInstructions(false);
    setIsGameStarted(true);
  };

  if (showInstructions) {
    return (
      <div className="p-4 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-purple-800 ml-3">{challengeData.title}</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Como Jogar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">{challengeData.description}</p>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p className="text-sm">Arraste o dedo para selecionar palavras</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p className="text-sm">Palavras podem estar em qualquer direção</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p className="text-sm">Você tem 3 minutos por nível</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="text-center">
                <Clock className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-sm text-gray-600">Tempo</p>
                <p className="font-bold">3:00</p>
              </div>
              <div className="text-center">
                <Target className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-sm text-gray-600">Nível</p>
                <p className="font-bold">1/20</p>
              </div>
              <div className="text-center">
                <Lightbulb className="w-6 h-6 mx-auto mb-1 text-purple-600" />
                <p className="text-sm text-gray-600">Dicas</p>
                <p className="font-bold">1</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={startGame} size="lg" className="w-full">
          Iniciar Desafio
        </Button>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium">Nível {currentLevel}/20</span>
          <span className={`font-bold ${timeRemaining < 60 ? 'text-red-600' : 'text-purple-600'}`}>
            {formatTime(timeRemaining)}
          </span>
        </div>
      </div>

      <GameBoard level={currentLevel} />
    </div>
  );
};

export default ChallengeScreen;
