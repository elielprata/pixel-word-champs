
import React from 'react';
import { AllUsersList } from './AllUsersList';

export const AllUsersTab = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-slate-900">Gerenciamento de Usuários</h3>
        <p className="text-slate-600">
          Visualize, edite, bane e gerencie todos os usuários cadastrados no sistema.
        </p>
      </div>
      
      <AllUsersList />
    </div>
  );
};
