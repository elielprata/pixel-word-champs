
export interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
  // Competições diárias não têm prêmios (prêmios vêm do ranking semanal)
}
