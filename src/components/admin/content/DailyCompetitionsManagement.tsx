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
import { Plus, Edit, Trash2, Target, Calendar, Users, Clock } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDailyCompetitionFinalization } from "@/hooks/useDailyCompetitionFinalization";

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

export const DailyCompetitionsManagement = () => {
  // Usar o hook de finalização automática
  useDailyCompetitionFinalization();

  const [competitions, setCompetitions] = useState<DailyCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<DailyCompetition | null>(null);
  const [newCompetition, setNewCompetition] = useState({
    title: '',
    description: '',
    theme: '',
    start_date: '',
    end_date: '',
    max_participants: 500
  });
  const { toast } = useToast();

  const themes = [
    'Animais',
    'Profissões',
    'Esportes',
    'Comidas',
    'Países',
    'Cores',
    'Natureza',
    'Tecnologia',
    'Música',
    'Cinema',
    'Literatura',
    'História',
    'Ciência',
    'Geografia'
  ];

  useEffect(() => {
    fetchCompetitions();
  }, []);

  // Função para calcular o final do dia baseado na data de início
  const calculateEndOfDay = (startDate: string): string => {
    if (!startDate) return '';
    
    const date = new Date(startDate);
    // Definir como final do dia (23:59:59.999)
    date.setHours(23, 59, 59, 999);
    
    // Retornar no formato datetime-local
    return date.toISOString().slice(0, 19);
  };

  // Função para definir o início do dia
  const setStartOfDay = (dateString: string): string => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    // Definir como início do dia (00:00:00.000)
    date.setHours(0, 0, 0, 0);
    
    // Retornar no formato datetime-local
    return date.toISOString().slice(0, 19);
  };

  const handleStartDateChange = (value: string) => {
    const adjustedStartDate = setStartOfDay(value);
    const adjustedEndDate = calculateEndOfDay(value);
    
    setNewCompetition({
      ...newCompetition, 
      start_date: adjustedStartDate,
      end_date: adjustedEndDate
    });
  };

  const fetchCompetitions = async () => {
    try {
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'challenge')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedCompetitions: DailyCompetition[] = (data || []).map(comp => ({
        id: comp.id,
        title: comp.title,
        description: comp.description || '',
        theme: comp.theme || 'Geral',
        start_date: comp.start_date,
        end_date: comp.end_date,
        max_participants: comp.max_participants || 500,
        status: comp.status || 'draft',
        created_at: comp.created_at
      }));
      
      setCompetitions(mappedCompetitions);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as competições diárias",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addCompetition = async () => {
    try {
      // Garantir que as datas estão corretas antes de salvar
      const adjustedCompetition = {
        ...newCompetition,
        start_date: setStartOfDay(newCompetition.start_date),
        end_date: calculateEndOfDay(newCompetition.start_date), // Usar start_date para calcular o final do mesmo dia
        competition_type: 'challenge',
        status: 'active' // Ativar automaticamente
      };

      const { error } = await supabase
        .from('custom_competitions')
        .insert([adjustedCompetition]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária criada com sucesso (ativa do início ao fim do dia)"
      });

      setNewCompetition({
        title: '',
        description: '',
        theme: '',
        start_date: '',
        end_date: '',
        max_participants: 500
      });
      setIsAddModalOpen(false);
      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a competição diária",
        variant: "destructive"
      });
    }
  };

  const updateCompetition = async () => {
    if (!editingCompetition) return;

    try {
      const { error } = await supabase
        .from('custom_competitions')
        .update({
          title: editingCompetition.title,
          description: editingCompetition.description,
          theme: editingCompetition.theme,
          start_date: editingCompetition.start_date,
          end_date: editingCompetition.end_date,
          max_participants: editingCompetition.max_participants,
          status: editingCompetition.status
        })
        .eq('id', editingCompetition.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária atualizada com sucesso"
      });

      setEditingCompetition(null);
      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a competição diária",
        variant: "destructive"
      });
    }
  };

  const deleteCompetition = async (id: string) => {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Competição diária removida com sucesso"
      });

      fetchCompetitions();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível remover a competição diária",
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

  return (
    <Card className="shadow-sm border-slate-200">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800 flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              Competições Diárias
            </CardTitle>
            <p className="text-sm text-slate-600">
              Gerencie competições diárias com temas específicos. Duração: 00:00:00 às 23:59:59 do mesmo dia.
            </p>
            <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded">
              <Clock className="h-3 w-3" />
              Pontos são automaticamente transferidos para a competição semanal quando finalizada
            </div>
          </div>
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Competição Diária
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Criar Nova Competição Diária</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Título</Label>
                  <Input 
                    value={newCompetition.title}
                    onChange={(e) => setNewCompetition({...newCompetition, title: e.target.value})}
                    placeholder="Ex: Desafio Diário - Animais"
                  />
                </div>
                <div>
                  <Label>Tema</Label>
                  <Select 
                    value={newCompetition.theme} 
                    onValueChange={(value) => setNewCompetition({...newCompetition, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um tema" />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(theme => (
                        <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={newCompetition.description}
                    onChange={(e) => setNewCompetition({...newCompetition, description: e.target.value})}
                    placeholder="Descreva o desafio diário..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Data do Desafio</Label>
                  <Input 
                    type="date"
                    value={newCompetition.start_date.split('T')[0]}
                    onChange={(e) => handleStartDateChange(e.target.value)}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Competição será ativa das 00:00:00 às 23:59:59 desta data
                  </p>
                </div>
                <div>
                  <Label>Máx. Participantes</Label>
                  <Input 
                    type="number"
                    value={newCompetition.max_participants}
                    onChange={(e) => setNewCompetition({...newCompetition, max_participants: parseInt(e.target.value)})}
                  />
                </div>
                <Button onClick={addCompetition} className="w-full">
                  Criar Competição Diária
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <Target className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total</p>
                  <p className="text-2xl font-bold text-blue-700">{competitions.length}</p>
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
                  <p className="text-sm text-green-600 font-medium">Ativas</p>
                  <p className="text-2xl font-bold text-green-700">
                    {competitions.filter(c => c.status === 'active').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-amber-100 p-2 rounded-lg">
                  <Users className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 font-medium">Agendadas</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {competitions.filter(c => c.status === 'scheduled').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de competições */}
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
                    <div className="flex gap-2 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingCompetition(competition)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => deleteCompetition(competition.id)}
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

        {competitions.length === 0 && !loading && (
          <div className="text-center py-8 text-gray-500">
            <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhuma competição diária criada ainda</p>
            <p className="text-sm">Crie sua primeira competição diária com tema</p>
          </div>
        )}

        {/* Modal de edição */}
        {editingCompetition && (
          <Dialog open={!!editingCompetition} onOpenChange={() => setEditingCompetition(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Editar Competição Diária</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div>
                  <Label>Título</Label>
                  <Input 
                    value={editingCompetition.title}
                    onChange={(e) => setEditingCompetition({...editingCompetition, title: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Tema</Label>
                  <Select 
                    value={editingCompetition.theme} 
                    onValueChange={(value) => setEditingCompetition({...editingCompetition, theme: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {themes.map(theme => (
                        <SelectItem key={theme} value={theme}>{theme}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Descrição</Label>
                  <Textarea 
                    value={editingCompetition.description}
                    onChange={(e) => setEditingCompetition({...editingCompetition, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Status</Label>
                    <Select 
                      value={editingCompetition.status} 
                      onValueChange={(value) => setEditingCompetition({...editingCompetition, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Rascunho</SelectItem>
                        <SelectItem value="scheduled">Agendado</SelectItem>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="completed">Finalizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Máx. Participantes</Label>
                    <Input 
                      type="number"
                      value={editingCompetition.max_participants}
                      onChange={(e) => setEditingCompetition({...editingCompetition, max_participants: parseInt(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Data/Hora Início</Label>
                    <Input 
                      type="datetime-local"
                      value={editingCompetition.start_date}
                      onChange={(e) => setEditingCompetition({...editingCompetition, start_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Data/Hora Fim</Label>
                    <Input 
                      type="datetime-local"
                      value={editingCompetition.end_date}
                      onChange={(e) => setEditingCompetition({...editingCompetition, end_date: e.target.value})}
                    />
                  </div>
                </div>
                <Button onClick={updateCompetition} className="w-full">
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
