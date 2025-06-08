
import React from 'react';
import { Users } from 'lucide-react';

interface UserListEmptyProps {
  searchTerm: string;
}

export const UserListEmpty = ({ searchTerm }: UserListEmptyProps) => {
  return (
    <div className="text-center py-8">
      <div className="bg-slate-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Users className="h-8 w-8 text-slate-400" />
      </div>
      <p className="text-slate-500 font-medium">
        {searchTerm ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}
      </p>
      {searchTerm && (
        <p className="text-sm text-slate-400 mt-1">
          Tente ajustar os termos de busca
        </p>
      )}
    </div>
  );
};
