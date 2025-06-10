
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Trophy, Target, Zap, Timer } from 'lucide-react';

interface GameRulesScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const GameRulesScreen = ({ onBack, onStartGame }: GameRulesScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-lg mx-auto">
        {/* Header minimalista */}
        <div className="flex items-center justify-between mb-8 pt-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="rounded-full h-10 w-10 bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-xl font-bold text-slate-800">Como Jogar</h1>
          <div className="w-10"></div>
        </div>

        {/* Hero Card Compacto */}
        <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl">
          <CardContent className="p-4 text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <Trophy className="w-6 h-6" />
              <h2 className="text-xl font-bold">Caça-Palavras</h2>
            </div>
            <p className="text-violet-100 text-sm">20 níveis • 3 minutos • Diversão infinita</p>
          </CardContent>
        </Card>

        {/* Regras compactas em grid */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Target className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Encontre Palavras</h3>
              <p className="text-xs text-slate-600">
                Horizontal, vertical ou diagonal
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Clock className="w-4 h-4 text-orange-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">3 Minutos</h3>
              <p className="text-xs text-slate-600">
                Seja rápido e estratégico
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Zap className="w-4 h-4 text-yellow-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">Dicas & Revive</h3>
              <p className="text-xs text-slate-600">
                Destaque palavras ou +30s
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-3 text-center">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <Trophy className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-slate-800 text-sm mb-1">20 Níveis</h3>
              <p className="text-xs text-slate-600">
                Dificuldade crescente
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Botão de ação principal */}
        <Button 
          onClick={onStartGame} 
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-base py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0"
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
