
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, AlertTriangle, CheckCircle, Clock, User } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Report {
  id: string;
  user_id: string;
  report_type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  resolution: string;
  created_at: string;
  updated_at: string;
}

export const SupportTab = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [resolution, setResolution] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os reports",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: string, newResolution?: string) => {
    try {
      const updateData: any = { status: newStatus };
      if (newResolution) {
        updateData.resolution = newResolution;
      }

      const { error } = await supabase
        .from('user_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do report atualizado"
      });

      fetchReports();
      setSelectedReport(null);
      setResolution('');
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o report",
        variant: "destructive"
      });
    }
  };

  const filteredReports = reports.filter(report => {
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && report.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <AlertTriangle className="h-4 w-4" />;
      case 'feature': return <MessageSquare className="h-4 w-4" />;
      case 'support': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
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
    <div className="space-y-6">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <MessageSquare className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Central de Suporte</h1>
            <p className="text-indigo-100 text-sm">Gerencie reports de usuários e solicitações de suporte</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <Clock className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-yellow-600 font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-yellow-700">
                  {reports.filter(r => r.status === 'pending').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <MessageSquare className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Em Progresso</p>
                <p className="text-2xl font-bold text-blue-700">
                  {reports.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Resolvidos</p>
                <p className="text-2xl font-bold text-green-700">
                  {reports.filter(r => r.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-red-600 font-medium">Alta Prioridade</p>
                <p className="text-2xl font-bold text-red-700">
                  {reports.filter(r => r.priority === 'high').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Reports */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg text-slate-800">Reports de Usuários</CardTitle>
              <p className="text-sm text-slate-600">
                {filteredReports.length} de {reports.length} reports
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="in_progress">Em Progresso</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                  <SelectItem value="closed">Fechado</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Tipo</TableHead>
                  <TableHead className="font-semibold">Assunto</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Prioridade</TableHead>
                  <TableHead className="font-semibold">Data</TableHead>
                  <TableHead className="font-semibold text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getReportTypeIcon(report.report_type)}
                        <span className="capitalize">{report.report_type}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium max-w-xs truncate">
                      {report.subject}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === 'pending' ? 'Pendente' :
                         report.status === 'in_progress' ? 'Em Progresso' :
                         report.status === 'resolved' ? 'Resolvido' : 'Fechado'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(report.priority)}>
                        {report.priority === 'low' ? 'Baixa' :
                         report.priority === 'medium' ? 'Média' : 'Alta'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(report.created_at)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedReport(report)}
                      >
                        Ver Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredReports.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum report encontrado</p>
              <p className="text-sm">Ajuste os filtros ou aguarde novos reports</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de detalhes do report */}
      {selectedReport && (
        <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Report</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-semibold">Tipo</Label>
                  <p className="capitalize">{selectedReport.report_type}</p>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Prioridade</Label>
                  <Badge className={getPriorityColor(selectedReport.priority)}>
                    {selectedReport.priority === 'low' ? 'Baixa' :
                     selectedReport.priority === 'medium' ? 'Média' : 'Alta'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Assunto</Label>
                <p>{selectedReport.subject}</p>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Mensagem</Label>
                <div className="bg-gray-50 p-3 rounded-lg border">
                  <p className="whitespace-pre-wrap">{selectedReport.message}</p>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-semibold">Data de Criação</Label>
                <p>{formatDate(selectedReport.created_at)}</p>
              </div>

              {selectedReport.resolution && (
                <div>
                  <Label className="text-sm font-semibold">Resolução</Label>
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <p className="whitespace-pre-wrap">{selectedReport.resolution}</p>
                  </div>
                </div>
              )}

              {selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                <div>
                  <Label className="text-sm font-semibold">Resolução</Label>
                  <Textarea
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    placeholder="Descreva como o problema foi resolvido..."
                    rows={3}
                  />
                </div>
              )}

              <div className="flex gap-2 pt-4">
                {selectedReport.status === 'pending' && (
                  <Button 
                    onClick={() => updateReportStatus(selectedReport.id, 'in_progress')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Marcar como Em Progresso
                  </Button>
                )}
                
                {(selectedReport.status === 'pending' || selectedReport.status === 'in_progress') && (
                  <Button 
                    onClick={() => updateReportStatus(selectedReport.id, 'resolved', resolution)}
                    disabled={!resolution.trim()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Marcar como Resolvido
                  </Button>
                )}
                
                {selectedReport.status === 'resolved' && (
                  <Button 
                    onClick={() => updateReportStatus(selectedReport.id, 'closed')}
                    variant="outline"
                  >
                    Fechar Report
                  </Button>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium text-gray-700 mb-1 ${className || ''}`}>{children}</label>;
}
