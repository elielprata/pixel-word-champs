
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, RotateCcw, Users, Loader2 } from 'lucide-react';

interface UserListHeaderProps {
  userCount: number;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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
    <CardHeader className="pb-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 p-2 rounded-lg">
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-900">
              Lista de Usuários
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {userCount} usuários
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar usuários..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 w-full sm:w-64"
            />
          </div>
          
          <Button
            onClick={onResetScores}
            variant="destructive"
            size="sm"
            disabled={isResettingScores}
            className="min-w-[120px]"
          >
            {isResettingScores ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Zerando...
              </>
            ) : (
              <>
                <RotateCcw className="h-4 w-4 mr-2" />
                Zerar Pontuações
              </>
            )}
          </Button>
        </div>
      </div>
    </CardHeader>
  );
};
