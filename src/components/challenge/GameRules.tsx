
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Info } from 'lucide-react';

const GameRules = () => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
        <CardTitle className="flex items-center gap-3 text-blue-900">
          <div className="bg-blue-500 p-2 rounded-lg">
            <Info className="w-5 h-5 text-white" />
          </div>
          Como Jogar
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-3">📝 Mecânica do Jogo</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <div>
                  <p className="font-medium text-green-800">Arraste para selecionar</p>
                  <p className="text-sm text-green-600">Toque e arraste o dedo conectando letras adjacentes</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <div>
                  <p className="font-medium text-blue-800">Qualquer direção</p>
                  <p className="text-sm text-blue-600">Horizontal, vertical e diagonal são válidas</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <div>
                  <p className="font-medium text-purple-800">Solte para confirmar</p>
                  <p className="text-sm text-purple-600">Levante o dedo para formar a palavra</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 mb-3">🏆 Sistema de Pontuação</h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">3 letras</span>
                <Badge className="bg-green-100 text-green-700 border-green-200">1 ponto</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">4 letras</span>
                <Badge className="bg-blue-100 text-blue-700 border-blue-200">2 pontos</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">5 letras</span>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">3 pontos</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">6+ letras</span>
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">5+ pontos</Badge>
              </div>
              <div className="flex justify-between items-center p-2 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                <span className="text-sm font-medium">⭐ Palavras raras</span>
                <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">Bônus!</Badge>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameRules;
