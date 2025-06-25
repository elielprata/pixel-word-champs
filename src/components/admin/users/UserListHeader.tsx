
import React from 'react';
import { Users, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface UserListHeaderProps {
  totalUsers: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export const UserListHeader = ({ totalUsers, onRefresh, isLoading }: UserListHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <div className="bg-blue-100 p-2 rounded-lg">
          <Users className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">
            Usuários Cadastrados
          </h2>
          <p className="text-sm text-gray-600">
            {totalUsers} usuários no sistema
          </p>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
};
