
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, Clock } from 'lucide-react';
import { useAutomationLogs } from '@/hooks/useAutomationLogs';
import { AutomationHeader } from './automation/AutomationHeader';
import { AutomationLogCard } from './automation/AutomationLogCard';
import { AutomationPagination } from './automation/AutomationPagination';

export const AutomationMonitoring: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { logs, isLoading, error, totalPages, refetch } = useAutomationLogs(currentPage, 10);

  if (error) {
    return (
      <div className="p-6 text-center">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar Novamente
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AutomationHeader isLoading={isLoading} onRefresh={refetch} />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-8">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Carregando logs de automação...</p>
        </div>
      )}

      {/* Logs List */}
      {!isLoading && (
        <>
          {logs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhum log de automação encontrado</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {logs.map((log) => (
                <AutomationLogCard key={log.id} log={log} />
              ))}
            </div>
          )}

          <AutomationPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
};
