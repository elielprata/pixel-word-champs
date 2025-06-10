
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lightbulb, Star, Zap, Brain } from 'lucide-react';

interface AdvancedStrategiesScreenProps {
  onBack: () => void;
}

const AdvancedStrategiesScreen = ({ onBack }: AdvancedStrategiesScreenProps) => {
  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-yellow-50 to-orange-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-yellow-800 ml-3">Estratégias Avançadas</h1>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-500" />
              Maximização de Pontos
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Priorize palavras longas:</h4>
              <p className="text-sm text-gray-600">Uma palavra de 6 letras vale mais que duas de 3 letras (5 vs 2 pontos)</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Procure por sufixos e prefixos:</h4>
              <p className="text-sm text-gray-600">-MENTE, -AÇÃO, RE-, PRE- podem formar palavras valiosas</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Explore palavras raras:</h4>
              <p className="text-sm text-gray-600">Termos técnicos ou menos comuns dão pontos extras</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              Técnicas de Busca
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Varredura sistemática:</h4>
              <p className="text-sm text-gray-600">Examine cada letra como ponto de partida para palavras</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Padrões diagonais:</h4>
              <p className="text-sm text-gray-600">Muitos jogadores esquecem das diagonais - explore todas as direções</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Letras centrais:</h4>
              <p className="text-sm text-gray-600">Letras no centro têm mais conexões possíveis</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-red-500" />
              Gestão de Tempo
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Primeiros 30 segundos:</h4>
              <p className="text-sm text-gray-600">Foque nas palavras óbvias e mais longas primeiro</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Meio do jogo:</h4>
              <p className="text-sm text-gray-600">Busque palavras de 4-5 letras sistematicamente</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-800">Últimos 30 segundos:</h4>
              <p className="text-sm text-gray-600">Capture qualquer palavra de 3 letras que encontrar</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-500" />
              Dicas dos Mestres
            </h3>
          </div>
          <div className="p-4 space-y-3">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                🏆 <strong>Dica Pro:</strong> Memorize palavras de 3 letras comuns (THE, AND, etc.) para capturas rápidas
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <p className="text-sm text-green-800">
                💡 <strong>Estratégia:</strong> Use dicas apenas quando estiver travado completamente, não no início
              </p>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
              <p className="text-sm text-purple-800">
                ⚡ <strong>Eficiência:</strong> Pratique movimentos de dedo fluidos para economizar tempo
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedStrategiesScreen;
