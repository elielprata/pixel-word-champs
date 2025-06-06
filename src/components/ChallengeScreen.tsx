
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Target, Play, Trophy, Lightbulb } from 'lucide-react';
import GameBoard from './GameBoard';

interface ChallengeScreenProps {
  challengeId: number;
  onBack: () => void;
}

const ChallengeScreen = ({ challengeId, onBack }: ChallengeScreenProps) => {
  const [currentLevel, setCurrentLevel] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(180);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);
  const [score, setScore] = useState(0);

  const challengeData = {
    1: { 
      title: "Desafio Matinal", 
      description: "Palavras relacionadas ao café da manhã",
      theme: "🌅 Manhã",
      color: "from-amber-400 to-orange-500"
    },
    2: { 
      title: "Animais Selvagens", 
      description: "Encontre os animais escondidos",
      theme: "🦁 Fauna",
      color: "from-green-400 to-emerald-500"
    },
    3: { 
      title: "Cidades do Brasil", 
      description: "Conheça as cidades brasileiras",
      theme: "🇧🇷 Geografia",
      color: "from-blue-400 to-cyan-500"
    },
  }[challengeId] || { 
    title: "Desafio", 
    description: "Encontre as palavras escondidas",
    theme: "🎯 Geral",
    color: "from-purple-400 to-pink-500"
  };

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

  const handleWordFound = (word: string, points: number) => {
    setScore(prev => prev + points);
  };

  const handleTimeUp = () => {
    console.log('Tempo esgotado!');
  };

  if (showInstructions) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        {/* Compact Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
              {challengeData.theme}
            </Badge>
          </div>
        </div>

        <div className="max-w-3xl mx-auto p-4 space-y-4">
          {/* Compact Hero Section */}
          <div className={`bg-gradient-to-r ${challengeData.color} rounded-xl p-6 text-white text-center`}>
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-3 backdrop-blur-sm">
              <Target className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold mb-2">{challengeData.title}</h1>
            <p className="opacity-90 mb-4">{challengeData.description}</p>
            
            <div className="flex justify-center gap-4 text-sm">
              <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="font-bold">20 Níveis</div>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="font-bold">3:00 cada</div>
              </div>
              <div className="bg-white/20 rounded-lg px-3 py-2 backdrop-blur-sm">
                <div className="font-bold">1 Dica grátis</div>
              </div>
            </div>
          </div>

          {/* Compact Rules */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <Lightbulb className="w-5 h-5" />
                Como Jogar
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3 p-2 bg-blue-50 rounded-lg">
                  <div className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-medium text-blue-800">Arraste para selecionar letras</p>
                    <p className="text-blue-600">Conecte letras adjacentes em qualquer direção</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-2 bg-green-50 rounded-lg">
                  <div className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-medium text-green-800">Pontuação por tamanho</p>
                    <p className="text-green-600">3 letras = 1pt | 4+ letras = mais pontos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Start Button */}
          <div className="text-center">
            <Button 
              onClick={startGame} 
              size="lg" 
              className={`bg-gradient-to-r ${challengeData.color} hover:opacity-90 text-white px-10 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200`}
            >
              <Play className="w-5 h-5 mr-2" />
              Iniciar Desafio
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Game Header */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Sair</span>
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-3 py-1">
              <Target className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-700">Nível {currentLevel}/20</span>
            </div>
            
            <div className={`flex items-center gap-2 rounded-lg px-3 py-1 ${timeRemaining < 60 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              <Clock className="w-4 h-4" />
              <span className="text-sm font-bold">
                {formatTime(timeRemaining)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 bg-purple-100 rounded-lg px-3 py-1">
              <Trophy className="w-4 h-4 text-purple-600" />
              <span className="text-sm font-bold text-purple-700">{score} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Content */}
      <div className="p-4">
        <GameBoard 
          level={currentLevel} 
          timeLeft={timeRemaining}
          onWordFound={handleWordFound}
          onTimeUp={handleTimeUp}
        />
      </div>
    </div>
  );
};

export default ChallengeScreen;
