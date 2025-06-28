
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Zap } from 'lucide-react';

const HowItWorksCard = () => {
  return (
    <Card className="mb-6 border-0 bg-white/80 backdrop-blur-sm shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg text-gray-800">Como Funciona</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-bold">1</div>
          <p className="text-sm text-gray-700">Copie seu código único</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
          <p className="text-sm text-gray-700">Amigo se cadastra informando seu código</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
          <div className="flex items-center gap-1">
            <p className="text-sm text-gray-700">Ambos ganham</p>
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-600">50 XP</span>
            <p className="text-sm text-gray-700">instantaneamente!</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default HowItWorksCard;
