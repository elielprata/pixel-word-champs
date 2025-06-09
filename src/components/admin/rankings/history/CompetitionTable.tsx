
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Eye, History as HistoryIcon } from 'lucide-react';
import { CompetitionDetailsModal } from './CompetitionDetailsModal';

interface CompetitionHistoryItem {
  id: string;
  title: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  created_at: string;
}

interface CompetitionTableProps {
  competitions: CompetitionHistoryItem[];
  onReload: () => void;
}

export const CompetitionTable: React.FC<CompetitionTableProps> = ({ competitions, onReload }) => {
  const [selectedCompetition, setSelectedCompetition] = useState<CompetitionHistoryItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'weekly': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'tournament': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'challenge': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWeekFromDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const handleViewCompetition = (competition: CompetitionHistoryItem) => {
    setSelectedCompetition(competition);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCompetition(null);
  };

  return (
    <>
      <Card className="border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-orange-600" />
            Histórico de Competições ({competitions.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Competição</TableHead>
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Período</TableHead>
                  <TableHead className="font-semibold">Participantes</TableHead>
                  <TableHead className="font-semibold">Prêmio</TableHead>
                  <TableHead className="font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {competitions.map((competition) => (
                  <TableRow key={competition.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div>
                        <p className="font-medium text-slate-900">{competition.title}</p>
                        {competition.competition_type === 'weekly' && (
                          <p className="text-xs text-slate-500">
                            Semana {getWeekFromDate(competition.start_date)} de {new Date(competition.start_date).getFullYear()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeColor(competition.competition_type)}>
                        {competition.competition_type === 'weekly' ? 'Semanal' :
                         competition.competition_type === 'tournament' ? 'Torneio' :
                         competition.competition_type === 'challenge' ? 'Desafio' : competition.competition_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(competition.status)}>
                        {competition.status === 'completed' ? 'Finalizada' : 
                         competition.status === 'cancelled' ? 'Cancelada' : competition.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p>{formatDate(competition.start_date)} -</p>
                        <p>{formatDate(competition.end_date)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <p className="font-semibold">{competition.total_participants}</p>
                        {competition.max_participants > 0 && (
                          <p className="text-xs text-slate-500">/ {competition.max_participants}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-green-600">
                      R$ {competition.prize_pool.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        onClick={() => handleViewCompetition(competition)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {competitions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <HistoryIcon className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">Nenhuma competição finalizada encontrada</p>
              <p className="text-sm">
                As competições aparecerão aqui quando forem finalizadas. Crie uma nova competição para começar!
              </p>
              <Button 
                className="mt-4" 
                onClick={onReload}
                variant="outline"
              >
                🔄 Recarregar dados
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <CompetitionDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        competition={selectedCompetition}
      />
    </>
  );
};
