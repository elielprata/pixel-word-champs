
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Target, Lightbulb, Star, Play, Info } from 'lucide-react';
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
        {/* Header */}
        <div className="bg-white border-b border-slate-200 shadow-sm">
          <div className="flex items-center justify-between p-4">
            <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
            <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
              {challengeData.theme}
            </Badge>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Hero Section */}
          <div className={`bg-gradient-to-r ${challengeData.color} rounded-2xl p-8 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl mb-4 backdrop-blur-sm">
                <Target className="w-8 h-8" />
              </div>
              <h1 className="text-3xl font-bold mb-2">{challengeData.title}</h1>
              <p className="text-lg opacity-90 mb-6">{challengeData.description}</p>
              
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">20</div>
                  <div className="text-sm opacity-80">Níveis</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">3:00</div>
                  <div className="text-sm opacity-80">Por nível</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <div className="text-2xl font-bold">1</div>
                  <div className="text-sm opacity-80">Dica grátis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Regras Compactas */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
                Como Jogar & Pontuação
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">🎮 Mecânica</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
                      <span>Arraste para conectar letras adjacentes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
                      <span>Qualquer direção (horizontal, vertical, diagonal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
                      <span>Solte para confirmar a palavra</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">🏆 Pontuação</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span>3-4 letras</span>
                      <Badge className="bg-green-100 text-green-700">1-2 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>5-6 letras</span>
                      <Badge className="bg-blue-100 text-blue-700">3-5 pts</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span>7+ letras</span>
                      <Badge className="bg-purple-100 text-purple-700">8+ pts</Badge>
                    </div>
                    <div className="flex justify-between items-center text-sm border-t pt-2">
                      <span>⭐ Palavras raras</span>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Bônus!</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Power-ups Compactos */}
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <h4 className="font-semibold text-purple-900 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5" />
                Power-ups Disponíveis
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Lightbulb className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
                  <h5 className="font-medium text-yellow-800">Dica Grátis</h5>
                  <p className="text-xs text-yellow-600">1 por nível</p>
                </div>
                <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <Clock className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <h5 className="font-medium text-blue-800">Tempo Extra</h5>
                  <p className="text-xs text-blue-600">+30s com anúncio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Iniciar */}
          <div className="text-center">
            <Button 
              onClick={startGame} 
              size="lg" 
              className={`bg-gradient-to-r ${challengeData.color} hover:opacity-90 text-white px-12 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}
            >
              <Play className="w-6 h-6 mr-3" />
              Iniciar Desafio
            </Button>
            <p className="text-sm text-gray-500 mt-3">
              Boa sorte! Encontre o máximo de palavras possível 🎯
            </p>
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
              <Star className="w-4 h-4 text-purple-600" />
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
