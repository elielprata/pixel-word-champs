
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Target, Lightbulb, Star, Zap, Trophy, Play, Info } from 'lucide-react';
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
          {/* Hero Section - Compacted */}
          <div className={`bg-gradient-to-r ${challengeData.color} rounded-xl p-4 text-white relative overflow-hidden`}>
            <div className="absolute inset-0 bg-black/5 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-2 backdrop-blur-sm">
                <Target className="w-6 h-6" />
              </div>
              <h1 className="text-2xl font-bold mb-1">{challengeData.title}</h1>
              <p className="text-sm opacity-90 mb-3">{challengeData.description}</p>
              
              <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <div className="text-lg font-bold">20</div>
                  <div className="text-xs opacity-80">Níveis</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <div className="text-lg font-bold">3:00</div>
                  <div className="text-xs opacity-80">Por nível</div>
                </div>
                <div className="bg-white/20 rounded-lg p-2 backdrop-blur-sm">
                  <div className="text-lg font-bold">1</div>
                  <div className="text-xs opacity-80">Dica grátis</div>
                </div>
              </div>
            </div>
          </div>

          {/* Regras do Jogo */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-3 text-blue-900">
                <div className="bg-blue-500 p-2 rounded-lg">
                  <Info className="w-5 h-5 text-white" />
                </div>
                Como Jogar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-3">📝 Mecânica do Jogo</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                      <div>
                        <p className="font-medium text-green-800">Arraste para selecionar</p>
                        <p className="text-sm text-green-600">Toque e arraste o dedo conectando letras adjacentes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                      <div>
                        <p className="font-medium text-blue-800">Qualquer direção</p>
                        <p className="text-sm text-blue-600">Horizontal, vertical e diagonal são válidas</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                      <div>
                        <p className="font-medium text-purple-800">Solte para confirmar</p>
                        <p className="text-sm text-purple-600">Levante o dedo para formar a palavra</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-semibold text-gray-800 mb-3">🏆 Sistema de Pontuação</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">3 letras</span>
                      <Badge className="bg-green-100 text-green-700 border-green-200">1 ponto</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">4 letras</span>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">2 pontos</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">5 letras</span>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">3 pontos</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium">6+ letras</span>
                      <Badge className="bg-amber-100 text-amber-700 border-amber-200">5+ pontos</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                      <span className="text-sm font-medium">⭐ Palavras raras</span>
                      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Bônus!</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Power-ups e Dicas */}
          <Card className="border-0 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardTitle className="flex items-center gap-3 text-purple-900">
                <div className="bg-purple-500 p-2 rounded-lg">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                Power-ups Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                  <div className="bg-yellow-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Lightbulb className="w-6 h-6 text-yellow-600" />
                  </div>
                  <h4 className="font-semibold text-yellow-800 mb-1">Dica Grátis</h4>
                  <p className="text-sm text-yellow-600">1 dica por nível</p>
                </div>
                
                <div className="text-center p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-blue-800 mb-1">Tempo Extra</h4>
                  <p className="text-sm text-blue-600">+30s com anúncio</p>
                </div>
                
                <div className="text-center p-4 bg-green-50 rounded-xl border border-green-200">
                  <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-green-800 mb-1">Palavra Bônus</h4>
                  <p className="text-sm text-green-600">Pontos dobrados</p>
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
