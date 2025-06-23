
import React from 'react';
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
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-4 w-4 text-amber-600" />
            Criar Nova Competição
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configurações Básicas
            </TabsTrigger>
            <TabsTrigger value="prizes" className="flex items-center gap-2">
              <Trophy className="h-4 w-4" />
              Configuração de Premiação
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <CreateCompetitionForm 
              onClose={handleClose}
              onCompetitionCreated={onCompetitionCreated}
              showPrizeConfig={false}
            />
          </TabsContent>

          <TabsContent value="prizes" className="mt-6">
            <CreateCompetitionForm 
              onClose={handleClose}
              onCompetitionCreated={onCompetitionCreated}
              showPrizeConfig={true}
              showBasicConfig={false}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
