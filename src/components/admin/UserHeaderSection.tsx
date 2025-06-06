
import React from 'react';
import { Users } from 'lucide-react';

export const UserHeaderSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>
      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                <Users className="h-8 w-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
                <p className="text-blue-100 mt-1">Administre usuários e suas permissões na plataforma</p>
              </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Crescimento</div>
                <div className="text-xl font-bold">+12%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Retenção</div>
                <div className="text-xl font-bold">85%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Engajamento</div>
                <div className="text-xl font-bold">94%</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm">
                <div className="text-sm text-blue-100">Satisfação</div>
                <div className="text-xl font-bold">4.8/5</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
