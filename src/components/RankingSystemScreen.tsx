import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Trophy, Medal, Crown, Gift } from 'lucide-react';

interface RankingSystemScreenProps {
  onBack: () => void;
}

const RankingSystemScreen = ({ onBack }: RankingSystemScreenProps) => {
  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-amber-50 to-yellow-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-amber-800 ml-3">Sistema de Ranking</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Tipos de Ranking
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Medal className="w-5 h-5 text-blue-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-800">Ranking Local</h4>
                <p className="text-sm text-gray-600">Posição específica em cada desafio jogado</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-purple-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-800">Ranking Global Diário</h4>
                <p className="text-sm text-gray-600">Soma de pontos de todos os desafios do dia</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Crown className="w-5 h-5 text-yellow-500 mt-1" />
              <div>
                <h4 className="font-medium text-gray-800">Ranking Global Semanal</h4>
                <p className="text-sm text-gray-600">Soma de pontos da semana toda</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-green-500" />
              Sistema de Premiação
            </h2>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <h4 className="font-medium text-yellow-800 mb-2">🥇 1º Lugar Semanal</h4>
              <p className="text-sm text-yellow-700">R$ 50,00 via Pix</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <h4 className="font-medium text-gray-800 mb-2">🥈 2º Lugar Semanal</h4>
              <p className="text-sm text-gray-700">R$ 30,00 via Pix</p>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
              <h4 className="font-medium text-orange-800 mb-2">🥉 3º Lugar Semanal</h4>
              <p className="text-sm text-orange-700">R$ 20,00 via Pix</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <h4 className="font-medium text-blue-800 mb-2">🏆 Premiações Estendidas</h4>
              <p className="text-sm text-blue-700">Alguns torneios especiais podem oferecer premiações até a <strong>100ª posição</strong>!</p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Como Funciona a Pontuação</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Ranking Local (por desafio):</h4>
              <p className="text-sm text-gray-600">Sua pontuação específica naquele desafio determina sua posição entre todos que jogaram</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Ranking Global:</h4>
              <p className="text-sm text-gray-600">Soma de TODOS os pontos de TODOS os desafios que você jogou</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                💡 <strong>Estratégia:</strong> Para subir no ranking global, jogue o máximo de desafios possível!
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Regras Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <p className="text-sm text-gray-700">Cada desafio só pode ser jogado uma vez</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <p className="text-sm text-gray-700">Rankings são atualizados em tempo real</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <p className="text-sm text-gray-700">Prêmios são pagos toda segunda-feira</p>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-red-500">•</span>
              <p className="text-sm text-gray-700">Sistema antifraude monitora todas as pontuações</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RankingSystemScreen;
