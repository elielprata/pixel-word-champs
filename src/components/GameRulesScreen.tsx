
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Trophy, Target, Zap, Star, Award, Timer } from 'lucide-react';

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

        {/* Hero Card */}
        <Card className="mb-6 overflow-hidden border-0 bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-xl">
          <CardContent className="p-6 text-center relative">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="20" height="20" xmlns="http://www.w3.org/2000/svg"%3E%3Cdefs%3E%3Cpattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse"%3E%3Cpath d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="1"/%3E%3C/pattern%3E%3C/defs%3E%3Crect width="100%" height="100%" fill="url(%23grid)" /%3E%3C/svg%3E')] opacity-30"></div>
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-2 mb-3">
                <Trophy className="w-8 h-8" />
                <Star className="w-6 h-6" />
                <Award className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Caça-Palavras</h2>
              <p className="text-violet-100 text-sm">20 níveis de pura diversão</p>
            </div>
          </CardContent>
        </Card>

        {/* Rules em cards compactos */}
        <div className="space-y-4 mb-8">
          {/* Objetivo */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Encontre as Palavras</h3>
                  <p className="text-sm text-slate-600">
                    Selecione palavras em qualquer direção: horizontal, vertical ou diagonal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tempo */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">3 Minutos por Nível</h3>
                  <p className="text-sm text-slate-600">
                    Seja rápido! Use o tempo com sabedoria para avançar.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Power-ups */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Zap className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">Dicas & Revive</h3>
                  <p className="text-sm text-slate-600">
                    Use dicas para destacar palavras ou revive para +30 segundos.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progressão */}
          <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">20 Níveis Desafiadores</h3>
                  <p className="text-sm text-slate-600">
                    Tabuleiros maiores e mais palavras a cada nível.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas visuais */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <Card className="border-0 bg-gradient-to-br from-emerald-50 to-emerald-100 text-center">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-emerald-700">20</div>
              <div className="text-xs text-emerald-600">Níveis</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-blue-50 to-blue-100 text-center">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-blue-700">3</div>
              <div className="text-xs text-blue-600">Minutos</div>
            </CardContent>
          </Card>
          <Card className="border-0 bg-gradient-to-br from-purple-50 to-purple-100 text-center">
            <CardContent className="p-3">
              <div className="text-xl font-bold text-purple-700">∞</div>
              <div className="text-xs text-purple-600">Diversão</div>
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
