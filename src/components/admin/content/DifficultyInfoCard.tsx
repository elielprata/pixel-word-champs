
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const DifficultyInfoCard = () => {
  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardHeader>
        <CardTitle className="text-amber-800 text-sm">Sistema de Dificuldade Automática</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Badge className="bg-green-100 text-green-800 border-green-200">Fácil</Badge>
            <span className="text-slate-600">3 letras</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Médio</Badge>
            <span className="text-slate-600">4 letras</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-100 text-orange-800 border-orange-200">Difícil</Badge>
            <span className="text-slate-600">5-7 letras</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-800 border-red-200">Expert</Badge>
            <span className="text-slate-600">8+ letras</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
