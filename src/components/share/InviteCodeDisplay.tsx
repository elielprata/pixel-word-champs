
import React from 'react';
import { Gift } from 'lucide-react';

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
      <p className="text-xs text-gray-500">Cada amigo que usar ganha 50 pontos!</p>
    </div>
  );
};

export default InviteCodeDisplay;
