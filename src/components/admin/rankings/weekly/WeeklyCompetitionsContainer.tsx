import React from 'react';
import { Trophy, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ActiveCompetitionCard } from './ActiveCompetitionCard';
import { WeeklyCompetitionCard } from './WeeklyCompetitionCard';
import { useWeeklyCompetitionsLogic } from '@/hooks/useWeeklyCompetitionsLogic';
interface WeeklyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  // total_participants is optional since it doesn't exist in the database
}
interface WeeklyCompetitionsContainerProps {
  competitions: WeeklyCompetition[];
  onViewRanking: (competition: WeeklyCompetition) => void;
  onEdit: (competition: WeeklyCompetition) => void;
  onRefresh?: () => void;
}
export const WeeklyCompetitionsContainer: React.FC<WeeklyCompetitionsContainerProps> = ({
  competitions,
  onViewRanking,
  onEdit,
  onRefresh
}) => {
  console.log('🏆 [WeeklyCompetitionsContainer] Processando competições:', competitions.length);
  const {
    currentActiveCompetition,
    otherActiveCompetitions,
    deletingId,
    handleDelete,
    calculateActualStatus
  } = useWeeklyCompetitionsLogic(competitions);
  const onDeleteCompetition = (competition: WeeklyCompetition) => {
    handleDelete(competition, onRefresh);
  };

  // Separar competições por status para melhor organização
  const scheduledCompetitions = otherActiveCompetitions.filter(comp => calculateActualStatus(comp) === 'scheduled');
  const completedCompetitions = otherActiveCompetitions.filter(comp => calculateActualStatus(comp) === 'completed');
  console.log('📊 [CONTAINER] Distribuição das competições:', {
    active: currentActiveCompetition ? 1 : 0,
    scheduled: scheduledCompetitions.length,
    completed: completedCompetitions.length,
    total: competitions.length
  });
  console.log('🎨 [RENDER] Componentes que serão renderizados:', {
    activeCard: !!currentActiveCompetition,
    scheduledSection: scheduledCompetitions.length > 0,
    completedSection: completedCompetitions.length > 0
  });
  return <>
      {/* Competição Ativa Atual */}
      {currentActiveCompetition && <div className="space-y-4">
          {(() => {
        console.log('🟢 [RENDER] Renderizando ActiveCompetitionCard para:', currentActiveCompetition.title);
        return null;
      })()}
          <ActiveCompetitionCard competition={currentActiveCompetition} onViewRanking={onViewRanking} onEdit={onEdit} onDelete={onDeleteCompetition} deletingId={deletingId} />
        </div>}

      {/* Competições Agendadas */}
      {scheduledCompetitions.length > 0 && <div className="space-y-4">
          {(() => {
        console.log('📅 [RENDER] Renderizando seção Agendadas com:', scheduledCompetitions.length, 'competições');
        return null;
      })()}
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Competições Agendadas ({scheduledCompetitions.length})
          </h3>
          
          <div className="grid gap-4">
            {scheduledCompetitions.map(competition => {
          console.log('📅 [RENDER] Renderizando card agendado para:', competition.title);
          return <WeeklyCompetitionCard key={competition.id} competition={competition} onViewRanking={onViewRanking} onEdit={onEdit} onDelete={onDeleteCompetition} deletingId={deletingId} />;
        })}
          </div>
        </div>}

      {/* Competições Finalizadas */}
      {completedCompetitions.length > 0 && <div className="space-y-4">
          {(() => {
        console.log('🏁 [RENDER] Renderizando seção Finalizadas com:', completedCompetitions.length, 'competições');
        return null;
      })()}
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Competições Finalizadas ({completedCompetitions.length})
            </h3>
          </div>
          
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Estas competições já foram finalizadas. Você pode visualizar seus rankings, editar informações ou excluí-las.
            </AlertDescription>
          </Alert>
          
          <div className="grid gap-4">
            {completedCompetitions.map(competition => {
          console.log('🏁 [RENDER] Renderizando card finalizado para:', competition.title);
          return <WeeklyCompetitionCard key={competition.id} competition={competition} onViewRanking={onViewRanking} onEdit={onEdit} onDelete={onDeleteCompetition} deletingId={deletingId} />;
        })}
          </div>
        </div>}

      {/* Fallback visual quando não há competições para mostrar */}
      {!currentActiveCompetition && scheduledCompetitions.length === 0 && completedCompetitions.length === 0 && <div className="text-center py-8">
          {(() => {
        console.log('❌ [RENDER] Renderizando fallback - nenhuma competição para mostrar');
        return null;
      })()}
          <div className="bg-gray-50 rounded-lg p-6">
            <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-gray-600 font-medium mb-2">Nenhuma competição encontrada</p>
            <p className="text-sm text-gray-500">
              As competições aparecerão aqui quando criadas e ativas.
            </p>
          </div>
        </div>}

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development'}
    </>;
};