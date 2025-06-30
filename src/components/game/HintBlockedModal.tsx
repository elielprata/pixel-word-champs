
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, HelpCircle, Star } from 'lucide-react';

interface HintBlockedModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HintBlockedModal = ({ isOpen, onClose }: HintBlockedModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <Card className="w-80 mx-4 animate-scale-in">
        <CardContent className="p-6 text-center">
          {/* Ícones decorativos */}
          <div className="flex justify-center items-center mb-4 space-x-2">
            <div className="relative">
              <Lightbulb className="w-10 h-10 text-yellow-500" />
              <div className="absolute -top-1 -right-1 bg-red-500 rounded-full p-1">
                <HelpCircle className="w-4 h-4 text-white" />
              </div>
            </div>
            <Star className="w-8 h-8 text-amber-500 animate-pulse" />
          </div>
          
          {/* Título */}
          <h3 className="text-lg font-bold mb-3 text-gray-800">
            Dica Não Disponível
          </h3>
          
          {/* Explicação */}
          <div className="text-gray-600 mb-4 space-y-2">
            <p className="text-sm">
              Esta é a <span className="font-semibold text-amber-600">Palavra de Desafio Extra</span>!
            </p>
            <p className="text-xs">
              Encontre-a sem dicas para ganhar <span className="font-semibold text-green-600">pontos extras</span> 🎯
            </p>
          </div>
          
          {/* Dica visual */}
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-center space-x-2">
              <Star className="w-4 h-4 text-amber-500" />
              <span className="text-xs text-amber-700 font-medium">
                Maior pontuação = Maior desafio
              </span>
              <Star className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          
          {/* Botão de ação */}
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
          >
            Entendi! Vou procurar 🔍
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default HintBlockedModal;
