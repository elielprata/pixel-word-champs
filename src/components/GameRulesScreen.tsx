
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Target, Clock, Trophy, Zap } from 'lucide-react';

interface GameRulesScreenProps {
  onBack: () => void;
  onStartGame: () => void;
}

const GameRulesScreen = ({ onBack, onStartGame }: GameRulesScreenProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-2xl font-bold text-purple-800 ml-3">Regras do Jogo</h1>
        </div>

        {/* Welcome Card */}
        <Card className="mb-6 bg-gradient-to-r from-purple-500 to-blue-600 text-white border-0">
          <CardContent className="p-6 text-center">
            <Trophy className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Bem-vindo ao Desafio!</h2>
            <p className="text-purple-100">Prepare-se para 20 níveis emocionantes de caça-palavras</p>
          </CardContent>
        </Card>

        {/* Rules Cards */}
        <div className="space-y-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-purple-600" />
                Objetivo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Encontre todas as palavras escondidas no tabuleiro. Use o dedo ou mouse para selecionar as palavras em qualquer direção: horizontal, vertical ou diagonal.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="w-5 h-5 text-orange-600" />
                Tempo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">
                Você tem <strong>3 minutos por nível</strong> para encontrar todas as palavras. O tempo é crucial - seja rápido e eficiente!
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="w-5 h-5 text-yellow-600" />
                Dicas e Revive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p>• <strong>Dicas:</strong> Use com moderação para destacar uma palavra no tabuleiro</p>
                <p>• <strong>Revive:</strong> Se o tempo acabar, você pode assistir um anúncio para ganhar mais 30 segundos</p>
                <p>• <strong>Pontuação:</strong> Palavras maiores valem mais pontos!</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="w-5 h-5 text-emerald-600" />
                Progressão
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-gray-700">
                <p>• <strong>20 Níveis:</strong> Cada nível fica progressivamente mais desafiador</p>
                <p>• <strong>Tabuleiros maiores:</strong> Conforme avança, os tabuleiros ficam maiores</p>
                <p>• <strong>Mais palavras:</strong> Níveis avançados têm mais palavras para encontrar</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Start Game Button */}
        <div className="text-center">
          <Button 
            onClick={onStartGame}
            className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-lg py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            🎯 INICIAR JOGO
          </Button>
          <p className="text-sm text-gray-600 mt-2">
            Boa sorte na competição!
          </p>
        </div>
      </div>
    </div>
  );
};

export default GameRulesScreen;
