import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MessageSquare, AlertTriangle, CheckCircle, Clock, User, RefreshCw, Filter, Search } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

interface Report {
  id: string;
  user_id: string;
  report_type: string;
  subject: string;
  message: string;
  status: string;
  priority: string;
  resolution: string | null;
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
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform data to match Report interface
      const transformedData: Report[] = (data || []).map(report => ({
        id: report.id,
        user_id: report.user_id || '',
        report_type: report.report_type,
        subject: report.subject,
        message: report.message,
        status: report.status || 'pending',
        priority: report.priority || 'medium',
        resolution: report.resolution,
        created_at: report.created_at || '',
        updated_at: report.updated_at || ''
      }));
      
      setReports(transformedData);
    } catch (error) {
      logger.error('Error loading reports', { error });
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
      setUpdating(true);
      const updateData: any = { 
        status: newStatus,
        updated_at: new Date().toISOString()
      };
      
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
        description: "Status do report atualizado com sucesso"
      });

      await fetchReports();
      setSelectedReport(null);
      setResolution('');
    } catch (error) {
      logger.error('Error updating report', { error });
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o report",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const filteredReports = reports.filter(report => {
    if (statusFilter !== 'all' && report.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && report.priority !== priorityFilter) return false;
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'resolved': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'bg-green-50 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'in_progress': return 'Em Progresso';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return priority;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return 'Bug';
      case 'feature': return 'Recurso';
      case 'support': return 'Suporte';
      case 'other': return 'Outro';
      default: return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - Similar to RankingsTab */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg shadow-md">
                <MessageSquare className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Central de Suporte
                </h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Gerencie reports de usuários e solicitações de suporte da plataforma
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reports.filter(r => r.status === 'pending').length}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">Aguardando Resposta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reports.filter(r => r.status === 'in_progress').length}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">Em Atendimento</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reports.filter(r => r.status === 'resolved').length}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">Resolvidos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {reports.filter(r => r.priority === 'high').length}
                  </p>
                  <p className="text-slate-600 text-sm font-medium">Alta Prioridade</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Reports */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-slate-600" />
                <h2 className="text-lg font-semibold text-slate-900">Reports de Usuários</h2>
                <Badge variant="outline" className="bg-white">
                  {filteredReports.length} de {reports.length}
                </Badge>
              </div>
              <div className="flex gap-3">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Filtrar por Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os Status</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="in_progress">Em Progresso</SelectItem>
                    <SelectItem value="resolved">Resolvido</SelectItem>
                    <SelectItem value="closed">Fechado</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40 bg-white">
                    <SelectValue placeholder="Filtrar por Prioridade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Prioridades</SelectItem>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  onClick={fetchReports}
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  className="bg-white"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {loading ? (
              <div className="text-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-slate-400" />
                <p className="text-slate-500">Carregando reports...</p>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead className="font-semibold text-slate-700">Tipo</TableHead>
                      <TableHead className="font-semibold text-slate-700">Assunto</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Prioridade</TableHead>
                      <TableHead className="font-semibold text-slate-700">Data</TableHead>
                      <TableHead className="font-semibold text-slate-700 text-center">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredReports.map((report) => (
                      <TableRow key={report.id} className="hover:bg-slate-50 transition-colors">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getReportTypeIcon(report.report_type)}
                            <span className="font-medium">{getReportTypeLabel(report.report_type)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium max-w-xs">
                          <div className="truncate" title={report.subject}>
                            {report.subject}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(report.status)}>
                            {getStatusLabel(report.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(report.priority)}>
                            {getPriorityLabel(report.priority)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-600 text-sm">
                          {formatDate(report.created_at)}
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedReport(report)}
                            className="hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300"
                          >
                            Ver Detalhes
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {!loading && filteredReports.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-slate-300" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhum report encontrado</h3>
                <p className="text-slate-500">Ajuste os filtros ou aguarde novos reports dos usuários</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de detalhes do report */}
        {selectedReport && (
          <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Detalhes do Report
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Tipo</label>
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                      {getReportTypeIcon(selectedReport.report_type)}
                      <span>{getReportTypeLabel(selectedReport.report_type)}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Prioridade</label>
                    <Badge className={getPriorityColor(selectedReport.priority)}>
                      {getPriorityLabel(selectedReport.priority)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Assunto</label>
                  <p className="p-3 bg-slate-50 rounded-lg border">{selectedReport.subject}</p>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Mensagem</label>
                  <div className="bg-slate-50 p-4 rounded-lg border">
                    <p className="whitespace-pre-wrap text-slate-700">{selectedReport.message}</p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-2">Data de Criação</label>
                  <p className="text-slate-600">{formatDate(selectedReport.created_at)}</p>
                </div>

                {selectedReport.resolution && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Resolução</label>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <p className="whitespace-pre-wrap text-green-800">{selectedReport.resolution}</p>
                    </div>
                  </div>
                )}

                {selectedReport.status !== 'resolved' && selectedReport.status !== 'closed' && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">Resolução</label>
                    <Textarea
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      placeholder="Descreva como o problema foi resolvido..."
                      rows={4}
                      className="bg-white"
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  {selectedReport.status === 'pending' && (
                    <Button 
                      onClick={() => updateReportStatus(selectedReport.id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={updating}
                    >
                      Iniciar Atendimento
                    </Button>
                  )}
                  
                  {(selectedReport.status === 'pending' || selectedReport.status === 'in_progress') && (
                    <Button 
                      onClick={() => updateReportStatus(selectedReport.id, 'resolved', resolution)}
                      disabled={!resolution.trim() || updating}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Marcar como Resolvido
                    </Button>
                  )}
                  
                  {selectedReport.status === 'resolved' && (
                    <Button 
                      onClick={() => updateReportStatus(selectedReport.id, 'closed')}
                      variant="outline"
                      disabled={updating}
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
    </div>
  );
};
