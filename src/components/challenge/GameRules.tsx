
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
      <CardContent className="p-3">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-50 rounded-lg border border-green-200">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-1">1</div>
            <h4 className="font-semibold text-green-800 mb-0.5 text-sm">Arraste</h4>
            <p className="text-xs text-green-600">Conecte letras adjacentes</p>
          </div>
          
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-1">2</div>
            <h4 className="font-semibold text-blue-800 mb-0.5 text-sm">Direções</h4>
            <p className="text-xs text-blue-600">Horizontal, vertical, diagonal</p>
          </div>
          
          <div className="text-center p-2 bg-purple-50 rounded-lg border border-purple-200">
            <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold mx-auto mb-1">3</div>
            <h4 className="font-semibold text-purple-800 mb-0.5 text-sm">Confirme</h4>
            <p className="text-xs text-purple-600">Solte para formar palavra</p>
          </div>
        </div>
        
        <div className="mt-3 p-2 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2 text-sm text-center">🏆 Pontuação</h4>
          <div className="grid grid-cols-2 gap-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-medium">3 letras</span>
              <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">1pt</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">4 letras</span>
              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-xs">2pts</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">5 letras</span>
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 text-xs">3pts</Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">6+ letras</span>
              <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-xs">5pts+</Badge>
            </div>
          </div>
          <div className="flex justify-center mt-1">
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">⭐ Palavras raras</span>
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs">Bônus!</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GameRules;
