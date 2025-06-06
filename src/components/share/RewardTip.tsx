
import React from 'react';
import { Gift } from 'lucide-react';

const RewardTip = () => {
  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-xl border border-yellow-200">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
          <Gift className="w-3 h-3 text-white" />
        </div>
        <span className="text-sm font-semibold text-yellow-800">Dica de Ouro</span>
      </div>
      <p className="text-xs text-yellow-700">
        Quanto mais amigos convidar, maiores serão suas recompensas! 
        Cada amigo ativo te dá <span className="font-semibold">50 pontos bônus</span>.
      </p>
    </div>
  );
};

export default RewardTip;
