
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Lightbulb, Clock, Zap } from 'lucide-react';

const PowerUpsSection = () => {
  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
        <CardTitle className="flex items-center gap-3 text-purple-900">
          <div className="bg-purple-500 p-2 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          Power-ups Disponíveis
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <div className="bg-yellow-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
              <Lightbulb className="w-4 h-4 text-yellow-600" />
            </div>
            <h4 className="font-semibold text-yellow-800 mb-0.5 text-sm">Dica Grátis</h4>
            <p className="text-xs text-yellow-600">1 dica por nível</p>
          </div>
          
          <div className="text-center p-2 bg-blue-50 rounded-lg border border-blue-200">
            <div className="bg-blue-100 w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h4 className="font-semibold text-blue-800 mb-0.5 text-sm">Tempo Extra</h4>
            <p className="text-xs text-blue-600">+30s com anúncio</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PowerUpsSection;
