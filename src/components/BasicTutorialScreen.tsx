
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Play, Target, Clock, Trophy } from 'lucide-react';

interface BasicTutorialScreenProps {
  onBack: () => void;
}

const BasicTutorialScreen = ({ onBack }: BasicTutorialScreenProps) => {
  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-green-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-green-800 ml-3">Como Jogar - Básico</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Play className="w-5 h-5 text-blue-500" />
              Objetivo do Jogo
            </h3>
          </div>
          <div className="p-4">
            <p className="text-gray-700">
              Encontre o maior número de palavras possível no tabuleiro de letras. 
              Arraste o dedo conectando letras para formar palavras válidas em qualquer direção.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-500" />
              Como Formar Palavras
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">1</div>
              <p className="text-gray-700">Toque na primeira letra da palavra</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">2</div>
              <p className="text-gray-700">Arraste o dedo conectando as letras adjacentes</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold">3</div>
              <p className="text-gray-700">Solte o dedo para formar a palavra</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
              <p className="text-sm text-blue-800">
                💡 <strong>Dica:</strong> Palavras podem ser formadas em todas as direções: horizontal, vertical e diagonal!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-500" />
              Sistema de Tempo
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <p className="text-gray-700">• Cada nível tem 3 minutos</p>
              <p className="text-gray-700">• Total de 20 níveis por desafio</p>
              <p className="text-gray-700">• Use anúncios para ganhar +30 segundos extras</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Sistema de Pontuação
            </h3>
          </div>
          <div className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">3 letras:</span>
                <span className="font-bold text-green-600">1 ponto</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">4 letras:</span>
                <span className="font-bold text-green-600">2 pontos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">5 letras:</span>
                <span className="font-bold text-green-600">3 pontos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">6+ letras:</span>
                <span className="font-bold text-green-600">5+ pontos</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Palavras raras:</span>
                <span className="font-bold text-purple-600">+2 a +10 pontos</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicTutorialScreen;
