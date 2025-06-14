
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Eye, Edit, Trash2, MoreVertical, RotateCcw } from 'lucide-react';
import { weeklyCompetitionFinalizationService } from '@/services/weeklyCompetitionFinalizationService';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
}

interface WeeklyCompetitionActionsProps {
  competition: WeeklyCompetition;
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onDelete: (competition: WeeklyCompetition) => void;
  deletingId: string | null;
  className?: string;
  size?: 'default' | 'sm' | 'lg';
}

export const WeeklyCompetitionActions = ({
  competition,
  onViewRanking,
  onEdit,
  onDelete,
  deletingId,
  className = "",
  size = "default"
}: WeeklyCompetitionActionsProps) => {
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleForceReset = async () => {
    try {
      setIsResetting(true);
      logger.log('🔄 Iniciando reset forçado de pontuações...');
      
      await weeklyCompetitionFinalizationService.forceResetAllScores();
      
      toast({
        title: "Reset concluído",
        description: "Todas as pontuações foram zeradas com sucesso.",
      });
      
      logger.log('✅ Reset forçado concluído com sucesso');
    } catch (error) {
      logger.error('❌ Erro no reset forçado:', error);
      toast({
        title: "Erro no reset",
        description: "Ocorreu um erro ao zerar as pontuações. Verifique o console.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
      setShowResetDialog(false);
    }
  };

  const isDeleting = deletingId === competition.id;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size={size}
            className={`h-8 w-8 p-0 ${className}`}
            disabled={isDeleting}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem 
            onClick={() => onViewRanking(competition)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            Ver Ranking
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            onClick={() => onEdit(competition)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar
          </DropdownMenuItem>
          
          {competition.status === 'completed' && (
            <DropdownMenuItem 
              onClick={() => setShowResetDialog(true)}
              className="flex items-center gap-2 text-orange-600"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Pontuações
            </DropdownMenuItem>
          )}
          
          <DropdownMenuItem 
            onClick={() => onDelete(competition)}
            disabled={isDeleting}
            className="flex items-center gap-2 text-red-600"
          >
            <Trash2 className="h-4 w-4" />
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Reset de Pontuações</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá zerar a pontuação total (total_score) e jogos jogados (games_played) 
              de TODOS os usuários no sistema. Esta operação não pode ser desfeita.
              <br /><br />
              Use esta função apenas se a finalização automática não zerou as pontuações corretamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isResetting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleForceReset}
              disabled={isResetting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isResetting ? 'Resetando...' : 'Confirmar Reset'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
