
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Settings, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreateCompetitionForm } from './competition-form/CreateCompetitionForm';
import { secureLogger } from '@/utils/secureLogger';

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
}

export const CreateCompetitionModal = ({ open, onOpenChange, onCompetitionCreated }: CreateCompetitionModalProps) => {
  const [competitionType, setCompetitionType] = useState<'daily' | 'weekly'>('weekly');
  const [activeTab, setActiveTab] = useState('basic');
  const [error, setError] = useState<string | null>(null);

  // Log quando o modal é aberto/fechado
  React.useEffect(() => {
    if (open) {
      secureLogger.debug('Modal de criação de competição aberto', { competitionType, activeTab }, 'CREATE_COMPETITION_MODAL');
    }
  }, [open, competitionType, activeTab]);

  const handleClose = () => {
    secureLogger.debug('Fechando modal de criação de competição', undefined, 'CREATE_COMPETITION_MODAL');
    setError(null);
    onOpenChange(false);
  };

  const handleCompetitionTypeChange = (type: 'daily' | 'weekly') => {
    secureLogger.debug('Mudando tipo de competição', { from: competitionType, to: type }, 'CREATE_COMPETITION_MODAL');
    setCompetitionType(type);
    
    // If user is on prizes tab and switches to daily, move to basic tab
    if (type === 'daily' && activeTab === 'prizes') {
      setActiveTab('basic');
    }
  };

  const handleError = (errorMessage: string) => {
    secureLogger.error('Erro no modal de criação de competição', { error: errorMessage }, 'CREATE_COMPETITION_MODAL');
    setError(errorMessage);
  };

  const showPrizesTab = competitionType === 'weekly';

  // Error Boundary simples
  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Erro no Modal
            </DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
          <div className="flex justify-end gap-2 mt-4">
            <button 
              onClick={() => setError(null)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tentar Novamente
            </button>
            <button 
              onClick={handleClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${showPrizesTab ? 'grid-cols-2' : 'grid-cols-1'}`}>
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações Básicas
            </TabsTrigger>
            {showPrizesTab && (
              <TabsTrigger value="prizes" className="flex items-center gap-2">
                <Trophy className="h-4 w-4" />
                Configuração de Premiação
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <CreateCompetitionForm 
              onClose={handleClose}
              onCompetitionCreated={onCompetitionCreated}
              showPrizeConfig={false}
              onCompetitionTypeChange={handleCompetitionTypeChange}
              onError={handleError}
            />
          </TabsContent>

          {showPrizesTab && (
            <TabsContent value="prizes" className="mt-6">
              <CreateCompetitionForm 
                onClose={handleClose}
                onCompetitionCreated={onCompetitionCreated}
                showPrizeConfig={true}
                showBasicConfig={false}
                onCompetitionTypeChange={handleCompetitionTypeChange}
                onError={handleError}
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
