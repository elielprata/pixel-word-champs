import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Trophy, Calendar, Users, Crown, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { usePaymentData } from "@/hooks/usePaymentData";

interface WeeklyTournament {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  prize_pool: number;
  max_participants: number;
  status: string;
  created_at: string;
}

export const WeeklyTournamentsManagement = () => {
  const [tournaments, setTournaments] = useState<WeeklyTournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingTournament, setEditingTournament] = useState<WeeklyTournament | null>(null);
  const [newTournament, setNewTournament] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    max_participants: 1000
  });
  const { toast } = useToast();
  const { calculateTotalPrize } = usePaymentData();

  // Calcular pool de prêmios automaticamente
  const currentPrizePool = calculateTotalPrize();
  
  // Calcular pool total de todos os torneios finalizados
  const totalCompletedPrizePool = tournaments
    .filter(t => t.status === 'completed')
    .reduce((total, tournament) => total + tournament.prize_pool, 0);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os torneios semanais",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addTournament = async () => {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .insert([{
          ...newTournament,
          competition_type: 'tournament',
          status: 'scheduled',
          prize_pool: currentPrizePool
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Torneio semanal criado com sucesso"
      });

      setNewTournament({
        title: '',
        description: '',
        start_date: '',
        end_date: '',
        max_participants: 1000
      });
      setIsAddModalOpen(false);
      fetchTournaments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o torneio semanal",
        variant: "destructive"
      });
    }
  };

  const updateTournament = async () => {
    if (!editingTournament) return;

    try {
      const { error } = await supabase
        .from('custom_competitions')
        .update({
          title: editingTournament.title,
          description: editingTournament.description,
          start_date: editingTournament.start_date,
          end_date: editingTournament.end_date,
          max_participants: editingTournament.max_participants,
          status: editingTournament.status,
          prize_pool: currentPrizePool
        })
        .eq('id', editingTournament.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Torneio semanal atualizado com sucesso"
      });

      setEditingTournament(null);
      fetchTournaments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o torneio semanal",
        variant: "destructive"
      });
    }
  };

  const deleteTournament = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Torneio semanal removido com sucesso"
      });

      fetchTournaments();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover o torneio semanal",
        variant: "destructive"
      });
    }
  };

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

  const getWeekFromDate = (dateString: string) => {
    const date = new Date(dateString);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Torneios Semanais
            </CardTitle>
            <p className="text-sm text-slate-600">
              Gerencie torneios semanais de grande escala
            </p>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Torneio Semanal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Novo Torneio Semanal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Título</Label>
                  <Input 
                    value={newTournament.title}
                    onChange={(e) => setNewTournament({...newTournament, title: e.target.value})}
                    placeholder="Ex: Torneio Semanal - Palavras Cruzadas"
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={newTournament.description}
                    onChange={(e) => setNewTournament({...newTournament, description: e.target.value})}
                    placeholder="Descreva o torneio semanal..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data/Hora Início (Segunda-feira)</Label>
                    <Input 
                      type="datetime-local"
                      value={newTournament.start_date}
                      onChange={(e) => setNewTournament({...newTournament, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data/Hora Fim (Domingo)</Label>
                    <Input 
                      type="datetime-local"
                      value={newTournament.end_date}
                      onChange={(e) => setNewTournament({...newTournament, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="flex items-center gap-2">
                      Pool de Prêmios (Automático)
                      <Info className="h-4 w-4 text-blue-500" />
                    </Label>
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-lg font-semibold text-blue-700">
                        R$ {currentPrizePool.toFixed(2)}
                      </p>
                      <p className="text-xs text-blue-600">
                        Baseado nas configurações de premiação
                      </p>
                    </div>
                  </div>
                  <div>
                    <Label>Máx. Participantes</Label>
                    <Input 
                      type="number"
                      value={newTournament.max_participants}
                      onChange={(e) => setNewTournament({...newTournament, max_participants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <Button onClick={addTournament} className="w-full">
                  Criar Torneio Semanal
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Trophy className="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-yellow-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-yellow-700">{tournaments.length}</p>
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
                  <p className="text-sm text-green-600 font-medium">Ativos</p>
                  <p className="text-2xl font-bold text-green-700">
                    {tournaments.filter(t => t.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Agendados</p>
                  <p className="text-2xl font-bold text-blue-700">
                    {tournaments.filter(t => t.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-2 rounded-lg">
                  <Crown className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 font-medium">Finalizados</p>
                  <p className="text-xl font-bold text-purple-700">
                    R$ {totalCompletedPrizePool.toFixed(2)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de torneios */}
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Título</TableHead>
                <TableHead className="font-semibold">Semana</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Início</TableHead>
                <TableHead className="font-semibold">Fim</TableHead>
                <TableHead className="font-semibold">Prêmio</TableHead>
                <TableHead className="font-semibold text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tournaments.map((tournament) => (
                <TableRow key={tournament.id} className="hover:bg-slate-50">
                  <TableCell className="font-medium">{tournament.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      Semana {getWeekFromDate(tournament.start_date)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(tournament.status)}>
                      {tournament.status === 'draft' ? 'Rascunho' :
                       tournament.status === 'active' ? 'Ativo' :
                       tournament.status === 'scheduled' ? 'Agendado' :
                       tournament.status === 'completed' ? 'Finalizado' : 'Cancelado'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{formatDate(tournament.start_date)}</TableCell>
                  <TableCell className="text-sm">{formatDate(tournament.end_date)}</TableCell>
                  <TableCell className="font-semibold">R$ {tournament.prize_pool.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingTournament(tournament)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteTournament(tournament.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {tournaments.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum torneio semanal criado ainda</p>
            <p className="text-sm">Crie seu primeiro torneio semanal</p>
          </div>
        )}

        {/* Modal de edição */}
        {editingTournament && (
          <Dialog open={!!editingTournament} onOpenChange={() => setEditingTournament(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Torneio Semanal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Título</Label>
                  <Input 
                    value={editingTournament.title}
                    onChange={(e) => setEditingTournament({...editingTournament, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={editingTournament.description}
                    onChange={(e) => setEditingTournament({...editingTournament, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={editingTournament.status} 
                      onValueChange={(value) => setEditingTournament({...editingTournament, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="completed">Finalizado</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Máx. Participantes</Label>
                    <Input 
                      type="number"
                      value={editingTournament.max_participants}
                      onChange={(e) => setEditingTournament({...editingTournament, max_participants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data/Hora Início</Label>
                    <Input 
                      type="datetime-local"
                      value={editingTournament.start_date}
                      onChange={(e) => setEditingTournament({...editingTournament, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data/Hora Fim</Label>
                    <Input 
                      type="datetime-local"
                      value={editingTournament.end_date}
                      onChange={(e) => setEditingTournament({...editingTournament, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label className="flex items-center gap-2">
                    Pool de Prêmios (Automático)
                    <Info className="h-4 w-4 text-blue-500" />
                  </Label>
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-lg font-semibold text-blue-700">
                      R$ {currentPrizePool.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-600">
                      Será atualizado automaticamente baseado nas configurações de premiação
                    </p>
                  </div>
                </div>
                <Button onClick={updateTournament} className="w-full">
                  Salvar Alterações
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
};
