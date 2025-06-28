
import React from 'react';
import { Gift } from 'lucide-react';

const InviteHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl mb-4 animate-bounce-in">
        <Gift className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Convide & Ganhe XP</h1>
      <p className="text-gray-600">Ambos ganham 50XP quando se cadastram!</p>
    </div>
  );
};

export default InviteHeader;
