import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Settings } from 'lucide-react';
import { CreateCompetitionForm } from './competition-form/CreateCompetitionForm';

interface CreateCompetitionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCompetitionCreated?: () => void;
}

export const CreateCompetitionModal = ({ open, onOpenChange, onCompetitionCreated }: CreateCompetitionModalProps) => {
  const [competitionType, setCompetitionType] = useState<'daily' | 'weekly'>('weekly');
  const [activeTab, setActiveTab] = useState('basic');

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleCompetitionTypeChange = (type: 'daily' | 'weekly') => {
    setCompetitionType(type);
    
    // If user is on prizes tab and switches to daily, move to basic tab
    if (type === 'daily' && activeTab === 'prizes') {
      setActiveTab('basic');
    }
  };

  const showPrizesTab = competitionType === 'weekly';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[45vh] overflow-y-auto">
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
              />
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
