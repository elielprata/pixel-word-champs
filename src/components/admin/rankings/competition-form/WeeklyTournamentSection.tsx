
import React from 'react';
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from 'lucide-react';
import { Competition } from '@/types';

interface WeeklyTournamentSectionProps {
  weeklyTournamentId: string;
  weeklyTournaments: Competition[];
  onTournamentChange: (tournamentId: string) => void;
}

export const WeeklyTournamentSection = ({ 
  weeklyTournamentId, 
  weeklyTournaments, 
  onTournamentChange 
}: WeeklyTournamentSectionProps) => {
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
          {weeklyTournaments.map((tournament) => (
            <SelectItem key={tournament.id} value={tournament.id}>
              <div className="flex flex-col py-1">
                <span className="font-medium text-sm">{tournament.title}</span>
                <span className="text-xs text-slate-500 mt-0.5">
                  {tournament.total_participants} participantes • R$ {tournament.prize_pool}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
        Os pontos desta competição diária contribuirão para o torneio semanal selecionado.
      </p>
    </div>
  );
};
