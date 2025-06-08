
import React from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Users, RotateCcw, Sword, Trophy } from 'lucide-react';

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
    <CardHeader className="bg-gradient-to-r from-indigo-50 via-blue-50 to-purple-50 border-b border-slate-200 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/20 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg">
              <Sword className="h-5 w-5 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold">Arena dos Guerreiros</span>
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-3 py-1">
                <Trophy className="h-3 w-3 mr-1" />
                {userCount} jogadores
              </Badge>
            </div>
          </CardTitle>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onResetScores}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white border-0 hover:from-red-600 hover:to-pink-600 shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={isResettingScores}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Pontuação Global
          </Button>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Buscar guerreiro por nome ou email..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm border-slate-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Live</span>
            </div>
          </div>
        </div>
      </div>
    </CardHeader>
  );
};
