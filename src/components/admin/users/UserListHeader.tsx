
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, RotateCcw } from 'lucide-react';
import { AutomationToggle } from './AutomationToggle';

interface UserListHeaderProps {
  userCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onResetScores: () => void;
  isResettingScores: boolean;
}

export const UserListHeader = ({ 
  userCount, 
  searchTerm, 
  onSearchChange, 
  onResetScores, 
  isResettingScores
}: UserListHeaderProps) => {
  return (
    <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <Users className="h-5 w-5 text-blue-600" />
          Lista de Usuários
          <span className="text-sm font-normal text-slate-600">
            ({userCount} usuários)
          </span>
        </CardTitle>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onResetScores}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            disabled={isResettingScores}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Zerar Pontuação Geral
          </Button>
          
          <AutomationToggle />
        </div>
      </div>
      
      <div className="flex items-center gap-2 mt-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>
    </CardHeader>
  );
};
