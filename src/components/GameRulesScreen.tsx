
import React from 'react';
import { Button } from '@/components/ui/button';
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

        <div className="space-y-4">
          {/* Objetivo */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Objetivo</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Encontre o maior número de palavras possível conectando letras adjacentes no tabuleiro. 
              Arraste o dedo para formar palavras em qualquer direção.
            </p>
          </div>

          {/* Como jogar */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Zap className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Como Formar Palavras</h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3">
                <span className="bg-slate-100 text-slate-600 text-sm font-medium px-2 py-1 rounded">1</span>
                <p className="text-slate-600">Toque na primeira letra</p>
              </div>
              <div className="flex gap-3">
                <span className="bg-slate-100 text-slate-600 text-sm font-medium px-2 py-1 rounded">2</span>
                <p className="text-slate-600">Arraste conectando letras adjacentes</p>
              </div>
              <div className="flex gap-3">
                <span className="bg-slate-100 text-slate-600 text-sm font-medium px-2 py-1 rounded">3</span>
                <p className="text-slate-600">Solte para formar a palavra</p>
              </div>
            </div>
          </div>

          {/* Tempo */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Timer className="w-5 h-5 text-orange-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Sistema de Tempo</h2>
            </div>
            <div className="space-y-2 text-slate-600">
              <p>• 3 minutos por nível</p>
              <p>• 20 níveis por desafio</p>
              <p>• Use anúncios para +30s extras</p>
            </div>
          </div>

          {/* Pontuação */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Trophy className="w-5 h-5 text-yellow-600" />
              </div>
              <h2 className="text-lg font-semibold text-slate-800">Pontuação</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>3 letras:</span>
                <span className="font-medium text-green-600">1 ponto</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>4 letras:</span>
                <span className="font-medium text-green-600">2 pontos</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>5+ letras:</span>
                <span className="font-medium text-green-600">3+ pontos</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de ação */}
        <div className="mt-8 pb-6">
          <Button onClick={onStartGame} className="w-full h-12 text-base font-medium">
            <Star className="w-5 h-5 mr-2" />
            Começar a Jogar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GameRulesScreen;
