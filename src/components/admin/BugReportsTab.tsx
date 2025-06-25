
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Bug, AlertCircle, CheckCircle, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { createBrasiliaTimestamp, formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface BugReport {
  id: string;
  subject: string;
  message: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  username?: string;
  resolution?: string;
}

export const BugReportsTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdminQuery = useIsAdmin();
  const isAdmin = isAdminQuery.data || false;
  const [reports, setReports] = useState<BugReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newReport, setNewReport] = useState({
    subject: '',
    message: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const loadReports = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('user_reports')
        .select('*')
        .eq('report_type', 'bug');

      // Se não for admin, mostrar apenas os próprios reports
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      // Aplicar filtros
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      // Buscar usernames separadamente para evitar problemas de join
      const reportsWithUsernames = await Promise.all(
        (data || []).map(async (report) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', report.user_id)
            .single();
          
          return {
            ...report,
            username: profile?.username || 'Usuário',
          };
        })
      );

      setReports(reportsWithUsernames);
    } catch (error) {
      console.error('Erro ao carregar reports:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os reports de bugs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async () => {
    if (!user || !newReport.subject || !newReport.message) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('user_reports')
        .insert({
          subject: newReport.subject,
          message: newReport.message,
          priority: newReport.priority,
          report_type: 'bug',
          status: 'pending',
          user_id: user.id,
          created_at: createBrasiliaTimestamp(new Date().toString()),
          updated_at: createBrasiliaTimestamp(new Date().toString())
        });

      if (error) throw error;

      setNewReport({ subject: '', message: '', priority: 'medium' });
      loadReports();
      
      toast({
        title: "Sucesso",
        description: "Report de bug enviado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o report de bug",
        variant: "destructive",
      });
    }
  };

  const resolveReport = async (reportId: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({ 
          status: 'resolved',
          updated_at: createBrasiliaTimestamp(new Date().toString())
        })
        .eq('id', reportId);

      if (error) throw error;

      loadReports();
      toast({
        title: "Sucesso",
        description: "Report marcado como resolvido",
      });
    } catch (error) {
      console.error('Erro ao resolver report:', error);
      toast({
        title: "Erro",
        description: "Não foi possível resolver o report",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadReports();
  }, [statusFilter, priorityFilter, isAdmin]);

  const getStatusIcon = (status: string) => {
    return status === 'resolved' ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (status: string) => {
    return status === 'resolved' ? 
      'bg-green-100 text-green-800' : 
      'bg-red-100 text-red-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Mostrar loading enquanto verifica se é admin
  if (isAdminQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Bug className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          {isAdmin ? 'Gerenciar Reports de Bugs' : 'Reportar Bugs'}
        </h2>
      </div>

      {/* Estatísticas simples (apenas para admins) */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-blue-600">{reports.length}</div>
              <div className="text-sm text-gray-600">Total de Reports</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-red-600">
                {reports.filter(r => r.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pendentes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'resolved').length}
              </div>
              <div className="text-sm text-gray-600">Resolvidos</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário para criar novo report */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Reportar Bug
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Título do Bug *</Label>
              <Input
                id="subject"
                value={newReport.subject}
                onChange={(e) => setNewReport({ ...newReport, subject: e.target.value })}
                placeholder="Descreva o problema em poucas palavras"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                value={newReport.priority}
                onChange={(e) => setNewReport({ ...newReport, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Baixa - Bug menor</option>
                <option value="medium">Média - Bug que atrapalha o uso</option>
                <option value="high">Alta - Bug que impede o uso</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Descrição Detalhada *</Label>
            <Textarea
              id="message"
              value={newReport.message}
              onChange={(e) => setNewReport({ ...newReport, message: e.target.value })}
              placeholder="Descreva o bug em detalhes: o que aconteceu, como reproduzir, etc."
              rows={4}
            />
          </div>
          <Button onClick={createReport} className="w-full">
            <Bug className="w-4 h-4 mr-2" />
            Enviar Report de Bug
          </Button>
        </CardContent>
      </Card>

      {/* Filtros (apenas para admins) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="resolved">Resolvidos</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todas</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de reports */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isAdmin ? 'Todos os Reports de Bugs' : 'Meus Reports de Bugs'}
            </CardTitle>
            <Button variant="outline" onClick={loadReports} disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {reports.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum report de bug encontrado</p>
          ) : (
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(report.status)}
                        <h3 className="font-semibold">{report.subject}</h3>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority === 'high' ? 'Alta' : report.priority === 'medium' ? 'Média' : 'Baixa'}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{report.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        {isAdmin && <span>Por: {report.username || 'Usuário'}</span>}
                        <span>Criado: {formatBrasiliaDate(new Date(report.created_at))}</span>
                        <span>Atualizado: {formatBrasiliaDate(new Date(report.updated_at))}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(report.status)}>
                        {report.status === 'resolved' ? 'Resolvido' : 'Pendente'}
                      </Badge>
                      {isAdmin && report.status === 'pending' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resolveReport(report.id)}
                        >
                          Marcar como Resolvido
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
