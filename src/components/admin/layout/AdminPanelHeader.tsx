
import React, { useState } from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { AdminErrorReportModal } from '../AdminErrorReportModal';

export const AdminPanelHeader = () => {
  const [showErrorReport, setShowErrorReport] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Painel Administrativo</h1>
              <p className="text-slate-600 mt-1">
                Gerencie usuários, conteúdo, rankings e configurações do sistema
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowErrorReport(true)}
              className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Reportar Erro
            </Button>
          </div>
        </div>
      </div>

      <AdminErrorReportModal
        isOpen={showErrorReport}
        onClose={() => setShowErrorReport(false)}
      />
    </>
  );
};
