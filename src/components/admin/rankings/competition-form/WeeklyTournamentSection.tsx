
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, Trophy, Calendar } from 'lucide-react';

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

interface WeeklyTournamentSectionProps {
  weeklyTournamentId: string;
  weeklyTournaments: WeeklyCompetition[];
  onTournamentChange: (tournamentId: string) => void;
}

export const WeeklyTournamentSection = ({ 
  weeklyTournamentId, 
  weeklyTournaments, 
  onTournamentChange 
}: WeeklyTournamentSectionProps) => {
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Finalizado';
      default: return 'Rascunho';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'scheduled': return 'text-blue-600';
      case 'completed': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  // Filtrar apenas competições ativas e agendadas
  const availableTournaments = weeklyTournaments.filter(tournament => 
    tournament.status === 'active' || tournament.status === 'scheduled'
  );

  console.log('🏆 Competições semanais disponíveis:', availableTournaments);

  return (
    <div className="space-y-2">
      <Label htmlFor="weeklyTournament" className="flex items-center gap-2 text-sm font-medium">
        <Link className="h-3 w-3" />
        Atribuir a Torneio Semanal
      </Label>
      
      <Select value={weeklyTournamentId} onValueChange={onTournamentChange}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Selecione um torneio semanal (opcional)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <span className="text-slate-500">Nenhum torneio selecionado</span>
          </SelectItem>
          
          {availableTournaments.length === 0 ? (
            <SelectItem value="no-tournaments" disabled>
              <div className="flex items-center gap-2 py-1">
                <Trophy className="h-3 w-3 text-slate-400" />
                <span className="text-slate-400 text-xs">Nenhuma competição semanal disponível</span>
              </div>
            </SelectItem>
          ) : (
            availableTournaments.map((tournament) => (
              <SelectItem key={tournament.id} value={tournament.id}>
                <div className="flex flex-col py-1 w-full">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-3 w-3 text-yellow-600" />
                    <span className="font-medium text-sm">{tournament.title}</span>
                    <span className={`text-xs px-1 py-0.5 rounded ${getStatusColor(tournament.status)}`}>
                      {getStatusText(tournament.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-2 w-2" />
                      <span>{formatDate(tournament.start_date)} - {formatDate(tournament.end_date)}</span>
                    </div>
                    <span>R$ {tournament.prize_pool.toFixed(2)}</span>
                  </div>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      
      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
        {availableTournaments.length === 0 
          ? "Nenhuma competição semanal ativa ou agendada disponível para atribuição."
          : "Os pontos desta competição diária contribuirão para o torneio semanal selecionado."
        }
      </p>
    </div>
  );
};
