
interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

export const useDailyCompetitionsLogic = (competitions: DailyCompetition[]) => {
  // Filtrar apenas competições diárias ativas (excluir finalizadas e canceladas)
  const activeCompetitions = competitions.filter(comp => 
    comp.status !== 'completed' && comp.status !== 'cancelled'
  );

  return {
    activeCompetitions
  };
};
