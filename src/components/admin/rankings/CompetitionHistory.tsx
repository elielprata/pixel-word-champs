
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Users, Eye, Search, Filter, Download } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

export const CompetitionHistory = () => {
  const [competitions, setCompetitions] = useState<CompetitionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchCompetitionHistory();
  }, []);

  const fetchCompetitionHistory = async () => {
    try {
      setLoading(true);
      
      // Buscar competições customizadas finalizadas
      const { data: customCompetitions, error: customError } = await supabase
        .from('custom_competitions')
        .select('*')
        .in('status', ['completed', 'cancelled'])
        .order('end_date', { ascending: false });

      if (customError) throw customError;

      // Buscar competições do sistema finalizadas
      const { data: systemCompetitions, error: systemError } = await supabase
        .from('competitions')
        .select('*')
        .eq('is_active', false)
        .order('week_end', { ascending: false });

      if (systemError) throw systemError;

      // Combinar e formatar os dados
      const formattedCompetitions: CompetitionHistoryItem[] = [
        ...(customCompetitions || []).map(comp => ({
          id: comp.id,
          title: comp.title,
          competition_type: comp.competition_type,
          start_date: comp.start_date,
          end_date: comp.end_date,
          status: comp.status,
          prize_pool: Number(comp.prize_pool) || 0,
          max_participants: comp.max_participants || 0,
          total_participants: 0, // TODO: calcular participantes reais
          created_at: comp.created_at
        })),
        ...(systemCompetitions || []).map(comp => ({
          id: comp.id,
          title: comp.title,
          competition_type: comp.type,
          start_date: comp.week_start || '',
          end_date: comp.week_end || '',
          status: 'completed',
          prize_pool: Number(comp.prize_pool) || 0,
          max_participants: 0,
          total_participants: comp.total_participants || 0,
          created_at: comp.created_at
        }))
      ];

      setCompetitions(formattedCompetitions);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico de competições",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredCompetitions = competitions.filter(comp => {
    const matchesSearch = comp.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    const matchesType = typeFilter === 'all' || comp.competition_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-orange-600 rounded-full mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Pesquisa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-orange-700">Buscar por título</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
                <Input
                  placeholder="Digite o nome da competição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-400"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-orange-700">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="completed">Finalizada</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-orange-700">Tipo</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="border-orange-200 focus:border-orange-400">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="tournament">Torneio</SelectItem>
                  <SelectItem value="challenge">Desafio</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Trophy className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-orange-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-orange-700">{competitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Finalizadas</p>
                <p className="text-2xl font-bold text-green-700">
                  {competitions.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <Users className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Canceladas</p>
                <p className="text-2xl font-bold text-red-700">
                  {competitions.filter(c => c.status === 'cancelled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Trophy className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Prêmios Total</p>
                <p className="text-xl font-bold text-yellow-700">
                  R$ {competitions.reduce((total, comp) => total + comp.prize_pool, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabela */}
      <Card className="border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <History className="h-5 w-5 text-orange-600" />
              Histórico de Competições ({filteredCompetitions.length})
            </CardTitle>
            <Button variant="outline" className="text-orange-600 hover:text-orange-700 border-orange-200">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
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
                {filteredCompetitions.map((competition) => (
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
                      <Button size="sm" variant="outline" className="text-orange-600 hover:text-orange-700">
                        <Eye className="h-3 w-3 mr-1" />
                        Ver
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredCompetitions.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <History className="h-12 w-12 mx-auto mb-4 text-slate-300" />
              <p className="text-lg font-medium mb-2">Nenhuma competição encontrada</p>
              <p className="text-sm">
                {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' 
                  ? 'Tente ajustar os filtros de pesquisa'
                  : 'Ainda não há competições finalizadas no sistema'
                }
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
