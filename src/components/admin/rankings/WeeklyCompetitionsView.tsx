
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Trophy, RefreshCw } from 'lucide-react';
import { RankingCard } from './RankingCard';

interface WeeklyCompetition {
  id: string;
  title: string;
  type: string;
  description?: string;
  week_start?: string;
  week_end?: string;
  is_active: boolean;
  total_participants: number;
  prize_pool: number;
  created_at: string;
}

interface WeeklyCompetitionsViewProps {
  competitions: WeeklyCompetition[];
  activeCompetition: WeeklyCompetition | null;
  isLoading: boolean;
  onRefresh: () => void;
}

export const WeeklyCompetitionsView: React.FC<WeeklyCompetitionsViewProps> = ({
  competitions,
  activeCompetition,
  isLoading,
  onRefresh
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-purple-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando competições semanais...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Competições Semanais ({competitions.length})</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="h-8"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Atualizar
          </Button>
        </div>
      </div>

      {competitions.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-slate-300" />
          <p className="font-medium mb-2">Nenhuma competição semanal encontrada</p>
          <p className="text-sm">Use o botão "Criar Competição" para adicionar uma nova competição semanal.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {competitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-slate-800">{competition.title}</h4>
                      <Badge variant={competition.is_active ? "default" : "secondary"}>
                        {competition.is_active ? 'Ativa' : 'Inativa'}
                      </Badge>
                    </div>
                    
                    {competition.description && (
                      <p className="text-sm text-slate-600 mb-3">{competition.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span>Início: {formatDate(competition.week_start)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-slate-500" />
                        <span>Fim: {formatDate(competition.week_end)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Trophy className="h-3 w-3 text-slate-500" />
                        <span>R$ {competition.prize_pool.toFixed(2)}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-500" />
                        <span>{competition.total_participants} participantes</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeCompetition && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-slate-900 mb-4">Ranking da Competição Ativa</h4>
          <RankingCard 
            title="Ranking Semanal Atual"
            type="weekly"
            data={[]} // Será preenchido com dados reais do ranking
            isLoading={false}
          />
        </div>
      )}
    </div>
  );
};
