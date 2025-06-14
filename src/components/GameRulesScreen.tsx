
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Clock, Trophy, Target, Zap, Star, Award, Timer, Gamepad2 } from 'lucide-react';

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
      <div className="max-w-2xl mx-auto">
        {/* Header com navegação */}
        <div className="flex items-center justify-between mb-6 pt-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack} 
            className="rounded-full h-12 w-12 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white hover:shadow-xl transition-all duration-200"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">Como Jogar</h1>
            <p className="text-sm text-slate-600">Guia completo do jogo</p>
          </div>
          <div className="w-12"></div>
        </div>

        {/* Hero Card - Design mais impactante */}
        <Card className="mb-8 overflow-hidden border-0 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white shadow-2xl">
          <CardContent className="p-8 text-center relative">
            <div className="absolute inset-0 opacity-20">
              <div className="w-full h-full bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.3),transparent_70%)]"></div>
            </div>
            <div className="relative z-10">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="p-3 bg-white/20 rounded-full">
                  <Gamepad2 className="w-8 h-8" />
                </div>
                <Star className="w-6 h-6 animate-pulse" />
                <div className="p-3 bg-white/20 rounded-full">
                  <Trophy className="w-8 h-8" />
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-3">Caça-Palavras</h2>
              <p className="text-violet-100 text-lg mb-4">Desafio de 20 níveis épicos</p>
              <div className="flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>1 min/nível</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>20 níveis</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seção de regras principais - Layout em grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Objetivo */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center">
                  <Target className="w-7 h-7 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-2 text-lg">Encontre as Palavras</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Selecione palavras em qualquer direção: horizontal, vertical ou diagonal. 
                    Arraste o dedo ou mouse sobre as letras para formar palavras.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tempo */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-7 h-7 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-2 text-lg">1 Minuto por Nível</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Seja rápido e estratégico! Você tem apenas 1 minuto para encontrar 
                    todas as palavras de cada nível.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Power-ups */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-yellow-100 rounded-2xl flex items-center justify-center">
                  <Zap className="w-7 h-7 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-2 text-lg">Dicas & Revive</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Use dicas para destacar palavras difíceis ou ative o revive 
                    para ganhar +30 segundos extras.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Progressão */}
          <Card className="border-0 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <Trophy className="w-7 h-7 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 mb-2 text-lg">20 Níveis Desafiadores</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Tabuleiros progressivamente maiores e mais palavras para encontrar. 
                    A dificuldade aumenta gradualmente.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Estatísticas em destaque - Layout horizontal */}
        <Card className="mb-8 border-0 bg-gradient-to-r from-slate-100 to-slate-50 shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-center text-slate-700 font-semibold mb-4">Estatísticas do Jogo</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-emerald-600 mb-1">20</div>
                <div className="text-xs text-slate-600 font-medium">Níveis Únicos</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-blue-600 mb-1">1</div>
                <div className="text-xs text-slate-600 font-medium">Minuto/Nível</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-sm">
                <div className="text-2xl font-bold text-purple-600 mb-1">∞</div>
                <div className="text-xs text-slate-600 font-medium">Diversão</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Botão de ação principal - Mais chamativo */}
        <div className="space-y-4">
          <Button 
            onClick={onStartGame} 
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-bold text-lg py-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border-0 transform hover:scale-105"
          >
            <div className="flex items-center justify-center gap-3">
              <Timer className="w-6 h-6" />
              <span>COMEÇAR DESAFIO</span>
              <Star className="w-5 h-5" />
            </div>
          </Button>
          
          <p className="text-center text-sm text-slate-500">
            Prepare-se para o desafio! Boa sorte encontrando todas as palavras! 🎯
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameRulesScreen;
