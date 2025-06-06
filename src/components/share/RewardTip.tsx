
import React from 'react';
import { Gift } from 'lucide-react';

const RewardTip = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-2 rounded-lg border border-yellow-200">
      <div className="flex items-center gap-1 mb-0.5">
        <div className="w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
          <Gift className="w-2 h-2 text-white" />
        </div>
        <span className="text-xs font-semibold text-yellow-800">Dica de Ouro</span>
      </div>
      <p className="text-xs text-yellow-700">
        Quanto mais amigos convidar, maiores serão suas recompensas! 
        Cada amigo ativo te dá <span className="font-semibold">50 pontos bônus</span>.
      </p>
    </div>
  );
};

export default RewardTip;
