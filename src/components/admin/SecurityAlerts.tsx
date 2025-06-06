
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { AlertTriangle, Clock, CheckCircle2, Eye } from 'lucide-react';

interface FraudAlert {
  id: number;
  user: string;
  reason: string;
  severity: 'high' | 'medium' | 'low';
  timestamp: string;
  status: 'pending' | 'resolved' | 'investigating';
}

interface SecurityAlertsProps {
  alerts: FraudAlert[];
}

export const SecurityAlerts = ({ alerts }: SecurityAlertsProps) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'investigating' | 'resolved'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const alertsPerPage = 9;

  const filteredAlerts = alerts.filter(alert => 
    filter === 'all' || alert.status === filter
  );

  // Calculate pagination
  const totalPages = Math.ceil(filteredAlerts.length / alertsPerPage);
  const startIndex = (currentPage - 1) * alertsPerPage;
  const paginatedAlerts = filteredAlerts.slice(startIndex, startIndex + alertsPerPage);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-3 w-3 text-orange-500" />;
      case 'investigating': return <Eye className="h-3 w-3 text-blue-500" />;
      case 'resolved': return <CheckCircle2 className="h-3 w-3 text-green-500" />;
      default: return <AlertTriangle className="h-3 w-3 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'investigating': return 'Investigando';
      case 'resolved': return 'Resolvido';
      default: return status;
    }
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
            className="h-6 px-2 text-xs"
          >
            Todos
          </Button>
          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('pending'); setCurrentPage(1); }}
            className="h-6 px-2 text-xs"
          >
            Pendentes
          </Button>
          <Button
            variant={filter === 'investigating' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('investigating'); setCurrentPage(1); }}
            className="h-6 px-2 text-xs"
          >
            Investigando
          </Button>
          <Button
            variant={filter === 'resolved' ? 'default' : 'outline'}
            size="sm"
            onClick={() => { setFilter('resolved'); setCurrentPage(1); }}
            className="h-6 px-2 text-xs"
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

        {/* 3x3 Grid - Mais compacto */}
        {paginatedAlerts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {paginatedAlerts.map(alert => (
              <div key={alert.id} className="p-2 border rounded-lg hover:bg-gray-50 transition-colors space-y-1.5 min-h-[120px]">
                <div className="flex items-center gap-1.5 mb-1">
                  {getStatusIcon(alert.status)}
                  <span className="font-medium text-xs truncate">{alert.user}</span>
                  <Badge variant={getSeverityColor(alert.severity)} className="text-[10px] px-1 py-0">
                    {alert.severity === 'high' ? 'Alto' : 
                     alert.severity === 'medium' ? 'Médio' : 'Baixo'}
                  </Badge>
                </div>
                <p className="text-[11px] text-gray-600 line-clamp-2 leading-tight">{alert.reason}</p>
                <div className="flex flex-col gap-0.5">
                  <p className="text-[10px] text-gray-400">{alert.timestamp}</p>
                  <p className="text-[10px] text-gray-400">Status: {getStatusLabel(alert.status)}</p>
                </div>
                <div className="flex gap-1 pt-1">
                  <Button variant="outline" size="sm" className="text-[10px] h-5 px-1.5 flex-1">
                    Detalhes
                  </Button>
                  {alert.status === 'pending' && (
                    <Button variant="default" size="sm" className="text-[10px] h-5 px-1.5 flex-1">
                      Investigar
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
