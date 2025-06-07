
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertTriangle, Clock, CheckCircle2, Eye, Search } from 'lucide-react';

interface FraudAlert {
  id: string;
  user_id: string | null;
  alert_type: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  metadata: any;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SecurityAlertsProps {
  alerts: FraudAlert[];
  onUpdateStatus: (alertId: string, status: string, assignedTo?: string) => Promise<void>;
}

export const SecurityAlerts = ({ alerts, onUpdateStatus }: SecurityAlertsProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updating, setUpdating] = useState<string | null>(null);
  const alertsPerPage = 6;

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.status === filter
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const startIndex = (currentPage - 1) * alertsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + alertsPerPage);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-orange-500" />;
      case 'investigating': return <Search className="h-3 w-3 text-blue-500" />;
      case 'resolved': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      case 'false_positive': return <Eye className="h-3 w-3 text-gray-500" />;
      default: return <AlertTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'investigating': return 'Investigando';
      case 'resolved': return 'Resolvido';
      case 'false_positive': return 'Falso Positivo';
      default: return status;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Crítico';
      case 'high': return 'Alto';
      case 'medium': return 'Médio';
      case 'low': return 'Baixo';
      default: return severity;
    }
  };

  const handleUpdateStatus = async (alertId: string, newStatus: string) => {
    setUpdating(alertId);
    await onUpdateStatus(alertId, newStatus);
    setUpdating(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between flex-wrap gap-2 text-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            Alertas de Segurança
          </div>
          <Badge variant="outline" className="text-xs">{filteredAlerts.length}</Badge>
        </CardTitle>
        
        <div className="flex flex-wrap gap-1 mt-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('all'); setCurrentPage(1); }}
            className="h-5 px-2 text-[10px]"
          >
            Todos
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('pending'); setCurrentPage(1); }}
            className="h-5 px-2 text-[10px]"
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'investigating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('investigating'); setCurrentPage(1); }}
            className="h-5 px-2 text-[10px]"
          >
            Investigando
          </Button>
          <Button
            variant={filter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('resolved'); setCurrentPage(1); }}
            className="h-5 px-2 text-[10px]"
          >
            Resolvidos
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mb-3">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* 2x3 Grid - 6 items */}
        {paginatedAlerts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {paginatedAlerts.map(alert => (
              <div key={alert.id} className="p-2 border rounded-lg hover:bg-gray-50 transition-colors space-y-1.5 min-h-[120px]">
                <div className="flex items-center gap-1.5 mb-1">
                  {getStatusIcon(alert.status)}
                  <span className="font-medium text-xs truncate">
                    {alert.user_id ? `User: ${alert.user_id.slice(-8)}` : 'Sistema'}
                  </span>
                  <Badge className={`text-[10px] px-1 py-0 ${getSeverityColor(alert.severity)}`}>
                    {getSeverityLabel(alert.severity)}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight">{alert.reason}</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-gray-400">{formatDate(alert.created_at)}</p>
                  <p className="text-[10px] text-gray-400">Status: {getStatusLabel(alert.status)}</p>
                </div>
                <div className="flex gap-1 pt-1">
                  {alert.status === 'pending' && (
                    <Button 
                      variant="default" 
                      size="sm" 
                      className="text-[10px] h-5 px-1.5 flex-1"
                      onClick={() => handleUpdateStatus(alert.id, 'investigating')}
                      disabled={updating === alert.id}
                    >
                      {updating === alert.id ? 'Atualizando...' : 'Investigar'}
                    </Button>
                  )}
                  {alert.status === 'investigating' && (
                    <>
                      <Button 
                        variant="default" 
                        size="sm" 
                        className="text-[10px] h-5 px-1.5 flex-1"
                        onClick={() => handleUpdateStatus(alert.id, 'resolved')}
                        disabled={updating === alert.id}
                      >
                        Resolver
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-[10px] h-5 px-1.5 flex-1"
                        onClick={() => handleUpdateStatus(alert.id, 'false_positive')}
                        disabled={updating === alert.id}
                      >
                        Falso +
                      </Button>
                    </>
                  )}
                  {(alert.status === 'resolved' || alert.status === 'false_positive') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-5 px-1.5 flex-1"
                      onClick={() => handleUpdateStatus(alert.id, 'pending')}
                      disabled={updating === alert.id}
                    >
                      Reabrir
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Nenhum alerta encontrado para o filtro selecionado</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
