
import React from 'react';
import { Users, Sword, Crown } from 'lucide-react';

interface UserListEmptyProps {
  searchTerm: string;
}

export const UserListEmpty = ({ searchTerm }: UserListEmptyProps) => {
  return (
    <div className="text-center py-12">
      <div className="relative mb-6">
        <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto relative">
          <Users className="h-10 w-10 text-slate-400" />
          <div className="absolute -top-2 -right-2 p-1 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full">
            <Sword className="h-4 w-4 text-white" />
          </div>
        </div>
        {/* Decorative rings */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-24 h-24 border-2 border-slate-200 rounded-full animate-pulse"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-28 h-28 border border-slate-100 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-slate-700">
          {searchTerm ? 'Nenhum guerreiro encontrado' : 'A arena está vazia'}
        </h3>
        
        <p className="text-slate-500">
          {searchTerm 
            ? 'Tente ajustar os termos de busca ou remover filtros' 
            : 'Ainda não há guerreiros cadastrados no sistema'
          }
        </p>
        
        {searchTerm && (
          <div className="mt-4 text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg inline-block">
            Buscando por: "<span className="font-medium">{searchTerm}</span>"
          </div>
        )}
      </div>
    </div>
  );
};
