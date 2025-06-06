
import React from 'react';
import { Gift } from 'lucide-react';

interface InviteCodeDisplayProps {
  inviteCode: string;
}

const InviteCodeDisplay = ({ inviteCode }: InviteCodeDisplayProps) => {
  return (
    <div className="text-center bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-xl border-2 border-dashed border-purple-200">
      <div className="flex items-center justify-center gap-2 mb-2">
        <Gift className="w-5 h-5 text-purple-600" />
        <span className="text-sm font-medium text-purple-600">Seu Código Especial</span>
      </div>
      <p className="text-2xl font-bold text-gray-800 tracking-widest">{inviteCode}</p>
      <p className="text-xs text-gray-500 mt-1">Cada amigo que usar ganha 50 pontos!</p>
    </div>
  );
};

export default InviteCodeDisplay;
