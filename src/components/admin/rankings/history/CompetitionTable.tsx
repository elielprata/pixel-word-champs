
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Users, Calendar, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface CompetitionHistoryItem {
  id: string;
  title: string;
  competition_type: string;
  status: string;
  participants: number;
  prize_pool: number;
  start_date: string;
  end_date: string;
  source: 'system' | 'custom';
  theme?: string;
  created_at: string;
  updated_at: string;
}

interface CompetitionTableProps {
  competitions: CompetitionHistoryItem[];
}

export const CompetitionTable: React.FC<CompetitionTableProps> = ({ competitions }) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="outline" className="text-green-700 border-green-200 bg-green-50">Finalizada</Badge>;
      case 'active':
        return <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50">Ativa</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="text-red-700 border-red-200 bg-red-50">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      'Semanal': 'bg-purple-100 text-purple-800 border-purple-200',
      'Diária': 'bg-blue-100 text-blue-800 border-blue-200',
      'Torneio': 'bg-amber-100 text-amber-800 border-amber-200',
      'Desafio': 'bg-green-100 text-green-800 border-green-200',
    };
    
    return (
      <Badge variant="outline" className={colors[type as keyof typeof colors] || 'bg-slate-100 text-slate-800'}>
        {type}
      </Badge>
    );
  };

  const getSourceBadge = (source: 'system' | 'custom') => {
    return source === 'system' ? (
      <Badge variant="outline" className="text-slate-700 border-slate-200 bg-slate-50">Sistema</Badge>
    ) : (
      <Badge variant="outline" className="text-orange-700 border-orange-200 bg-orange-50">Customizada</Badge>
    );
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return 'Data inválida';
    }
  };

  return (
    <Card className="border-orange-200 bg-white">
      <CardHeader>
        <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Histórico de Competições ({competitions.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Competição</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead className="text-center">Participantes</TableHead>
                <TableHead className="text-center">Prêmio Total</TableHead>
                <TableHead>Período</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {competitions.map((competition) => (
                <TableRow key={competition.id} className="hover:bg-orange-50">
                  <TableCell>
                    <div className="font-medium text-slate-900">{competition.title}</div>
                    <div className="text-sm text-slate-500">ID: {competition.id.slice(0, 8)}...</div>
                  </TableCell>
                  <TableCell>
                    {getTypeBadge(competition.competition_type)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(competition.status)}
                  </TableCell>
                  <TableCell>
                    {getSourceBadge(competition.source)}
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4 text-slate-400" />
                      <span className="font-medium">{competition.participants}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-green-700">
                        R$ {competition.prize_pool.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-4 w-4 text-slate-400" />
                      <div>
                        <div>{formatDate(competition.start_date)}</div>
                        {competition.end_date && competition.end_date !== competition.start_date && (
                          <div className="text-slate-500">até {formatDate(competition.end_date)}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
