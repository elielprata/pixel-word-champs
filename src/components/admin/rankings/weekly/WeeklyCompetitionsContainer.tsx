
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
  total_participants: number;
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
  const scheduledCompetitions = otherActiveCompetitions.filter(comp => 
    calculateActualStatus(comp) === 'scheduled'
  );
  
  const completedCompetitions = otherActiveCompetitions.filter(comp => 
    calculateActualStatus(comp) === 'completed'
  );

  console.log('📊 [CONTAINER] Distribuição das competições:', {
    active: currentActiveCompetition ? 1 : 0,
    scheduled: scheduledCompetitions.length,
    completed: completedCompetitions.length,
    total: competitions.length
  });

  return (
    <>
      {/* Competição Ativa Atual */}
      {currentActiveCompetition && (
        <div className="space-y-4">
          <ActiveCompetitionCard
            competition={currentActiveCompetition}
            onViewRanking={onViewRanking}
            onEdit={onEdit}
            onDelete={onDeleteCompetition}
            deletingId={deletingId}
          />
        </div>
      )}

      {/* Competições Agendadas */}
      {scheduledCompetitions.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-blue-600" />
            Competições Agendadas ({scheduledCompetitions.length})
          </h3>
          
          <div className="grid gap-4">
            {scheduledCompetitions.map((competition) => (
              <WeeklyCompetitionCard
                key={competition.id}
                competition={competition}
                onViewRanking={onViewRanking}
                onEdit={onEdit}
                onDelete={onDeleteCompetition}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Competições Finalizadas */}
      {completedCompetitions.length > 0 && (
        <div className="space-y-4">
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
            {completedCompetitions.map((competition) => (
              <WeeklyCompetitionCard
                key={competition.id}
                competition={competition}
                onViewRanking={onViewRanking}
                onEdit={onEdit}
                onDelete={onDeleteCompetition}
                deletingId={deletingId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Debug Info (apenas em desenvolvimento) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded-lg text-xs">
          <h4 className="font-semibold mb-2">🐛 Debug Info:</h4>
          <pre className="whitespace-pre-wrap">
            {JSON.stringify({
              totalCompetitions: competitions.length,
              activeCount: currentActiveCompetition ? 1 : 0,
              scheduledCount: scheduledCompetitions.length,
              completedCount: completedCompetitions.length,
              competitions: competitions.map(c => ({
                title: c.title,
                status: c.status,
                calculatedStatus: calculateActualStatus(c),
                startDate: c.start_date,
                endDate: c.end_date
              }))
            }, null, 2)}
          </pre>
        </div>
      )}
    </>
  );
};
