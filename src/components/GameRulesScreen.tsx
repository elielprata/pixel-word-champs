
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Trophy, Target, Zap, Star, Award, Timer } from 'lucide-react';

interface GameRulesScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const GameRulesScreen = ({
  onBack,
  onStartGame
}: GameRulesScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md mx-auto">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="rounded-full h-9 w-9 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-lg font-bold text-slate-800">Como Jogar</h1>
          <div className="w-9"></div>
        </div>

        {/* Hero Card compacto */}
        <Card className="mb-5 overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg">
          <CardContent className="p-4 text-center relative">
            <div className="absolute inset-0 opacity-20 bg-gradient-to-br from-white/10 to-transparent"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-1 mb-2">
                <Trophy className="w-6 h-6" />
                <Star className="w-5 h-5" />
                <Award className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold mb-1">Caça-Palavras</h2>
              <p className="text-violet-100 text-xs">20 níveis de pura diversão</p>
            </div>
          </CardContent>
        </Card>

        {/* Grid de regras 2x2 */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {/* Objetivo */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">Encontre Palavras</h3>
                <p className="text-xs text-slate-600">
                  Em qualquer direção: horizontal, vertical ou diagonal
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Tempo */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">1 Minuto</h3>
                <p className="text-xs text-slate-600">
                  Por nível. Seja rápido e estratégico!
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Power-ups */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">Dicas & Revive</h3>
                <p className="text-xs text-slate-600">
                  Destaque palavras ou ganhe +30s
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Progressão */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3">
              <div className="text-center">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Trophy className="w-4 h-4 text-purple-600" />
                </div>
                <h3 className="font-semibold text-slate-800 text-sm mb-1">20 Níveis</h3>
                <p className="text-xs text-slate-600">
                  Dificuldade crescente a cada fase
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas compactas */}
        <div className="grid grid-cols-3 gap-2 mb-5">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
            <CardContent className="p-2">
              <div className="text-lg font-bold text-emerald-700">20</div>
              <div className="text-xs text-emerald-600">Níveis</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 text-center">
            <CardContent className="p-2">
              <div className="text-lg font-bold text-blue-700">1</div>
              <div className="text-xs text-blue-600">Minuto</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 text-center">
            <CardContent className="p-2">
              <div className="text-lg font-bold text-purple-700">∞</div>
              <div className="text-xs text-purple-600">Diversão</div>
            </CardContent>
          </Card>
        </div>

        {/* Botão de ação principal */}
        <Button 
          onClick={onStartGame} 
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-base py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
        >
          <div className="flex items-center justify-center gap-2">
            <Timer className="w-5 h-5" />
            COMEÇAR AGORA
          </div>
        </Button>
        
        <p className="text-center text-xs text-slate-500 mt-3">
          Boa sorte no desafio! 🎯
        </p>
      </div>
    </div>
  );
};

export default GameRulesScreen;
