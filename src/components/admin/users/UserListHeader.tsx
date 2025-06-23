
import React, { useState } from 'react';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, RotateCcw, Download, FileText } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { AutomationToggle } from './AutomationToggle';
import { userExportService } from '@/services/userExportService';
import { AllUsersData } from '@/hooks/useUsersQuery';
import { logger } from '@/utils/logger';

interface UserListHeaderProps {
  userCount: number;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onResetScores: () => void;
  isResettingScores: boolean;
  users?: AllUsersData[];
}

export const UserListHeader = ({ 
  userCount, 
  searchTerm, 
  onSearchChange, 
  onResetScores, 
  isResettingScores,
  users = []
}: UserListHeaderProps) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportUsers = async () => {
    if (users.length === 0) {
      toast({
        title: "Nenhum usuário",
        description: "Não há usuários para exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);
    try {
      logger.info('Iniciando exportação de usuários', { count: users.length }, 'USER_LIST_HEADER');
      
      await userExportService.exportUsersToCSV(users);
      
      toast({
        title: "Exportação concluída",
        description: `${users.length} usuários exportados com sucesso.`,
      });
      
      logger.info('Exportação de usuários concluída', { count: users.length }, 'USER_LIST_HEADER');
    } catch (error) {
      logger.error('Erro na exportação de usuários', { error }, 'USER_LIST_HEADER');
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar os dados dos usuários.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportStats = async () => {
    setIsExporting(true);
    try {
      logger.info('Iniciando exportação de estatísticas', undefined, 'USER_LIST_HEADER');
      
      await userExportService.exportUserStats();
      
      toast({
        title: "Estatísticas exportadas",
        description: "Relatório de estatísticas gerado com sucesso.",
      });
      
      logger.info('Exportação de estatísticas concluída', undefined, 'USER_LIST_HEADER');
    } catch (error) {
      logger.error('Erro na exportação de estatísticas', { error }, 'USER_LIST_HEADER');
      toast({
        title: "Erro na exportação",
        description: "Não foi possível exportar as estatísticas.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

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
        
        <div className="flex flex-col gap-2">
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
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportUsers}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
              disabled={isExporting || users.length === 0}
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Usuários'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportStats}
              className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
              disabled={isExporting}
            >
              <FileText className="h-4 w-4 mr-2" />
              {isExporting ? 'Exportando...' : 'Exportar Estatísticas'}
            </Button>
          </div>
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
