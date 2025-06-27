
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Zap } from 'lucide-react';

interface UserListActionsProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onRefresh: () => void;
  onResetScores: () => void;
  isLoading: boolean;
  isResettingScores: boolean;
}

export const UserListActions = ({
  searchTerm,
  onSearchChange,
  onRefresh,
  onResetScores,
  isLoading,
  isResettingScores
}: UserListActionsProps) => {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          onClick={onResetScores}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
          disabled={isResettingScores}
        >
          <Zap className="h-4 w-4 mr-2" />
          Reset Geral
        </Button>
        
        <Button onClick={onRefresh} variant="outline" disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>
    </div>
  );
};
