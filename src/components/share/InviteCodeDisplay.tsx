
import React from 'react';
import { Gift, Zap } from 'lucide-react';

interface InviteCodeDisplayProps {
  inviteCode: string;
}

const InviteCodeDisplay = ({ inviteCode }: InviteCodeDisplayProps) => {
  return (
    <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 p-2 rounded-lg border-2 border-dashed border-purple-200">
      <div className="flex items-center justify-center gap-1 mb-1">
        <Gift className="w-3 h-3 text-purple-600" />
        <span className="text-xs font-medium text-purple-600">Seu Código Especial</span>
      </div>
      <p className="text-lg font-bold text-gray-800 tracking-widest">{inviteCode}</p>
      <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
        <span>Ambos ganham</span>
        <Zap className="w-3 h-3 text-purple-600" />
        <span className="font-semibold text-purple-600">50 XP</span>
        <span>no cadastro!</span>
      </div>
    </div>
  );
};

export default InviteCodeDisplay;
