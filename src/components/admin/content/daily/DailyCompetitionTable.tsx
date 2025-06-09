
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Target } from 'lucide-react';
import { DailyCompetitionActions } from './DailyCompetitionActions';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
}

interface DailyCompetitionTableProps {
  competitions: DailyCompetition[];
  loading: boolean;
  onEdit: (competition: DailyCompetition) => void;
  onDelete: (id: string) => void;
}

export const DailyCompetitionTable: React.FC<DailyCompetitionTableProps> = ({
  competitions,
  loading,
  onEdit,
  onDelete
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (competitions.length === 0 && !loading) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>Nenhuma competição diária criada ainda</p>
        <p className="text-sm">Crie sua primeira competição diária com tema</p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50">
            <TableHead className="font-semibold">Título</TableHead>
            <TableHead className="font-semibold">Tema</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Início</TableHead>
            <TableHead className="font-semibold">Fim</TableHead>
            <TableHead className="font-semibold">Máx. Participantes</TableHead>
            <TableHead className="font-semibold text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {competitions.map((competition) => (
            <TableRow key={competition.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">{competition.title}</TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {competition.theme}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(competition.status)}>
                  {competition.status === 'draft' ? 'Rascunho' :
                   competition.status === 'active' ? 'Ativo' :
                   competition.status === 'scheduled' ? 'Agendado' :
                   competition.status === 'completed' ? 'Finalizado' : competition.status}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">{formatDate(competition.start_date)}</TableCell>
              <TableCell className="text-sm">{formatDate(competition.end_date)}</TableCell>
              <TableCell className="font-semibold">{competition.max_participants}</TableCell>
              <TableCell className="text-center">
                <DailyCompetitionActions
                  competition={competition}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
