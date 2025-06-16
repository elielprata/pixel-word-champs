
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AutomationSettings } from './AutomationSettings';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';

export const AutomationToggle = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, saveSettings, isLoading } = useAutomationSettings();

  const handleSaveSettings = async (newSettings: any) => {
    await saveSettings(newSettings);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
        >
          <Settings className="h-4 w-4 mr-2" />
          Automação
          {settings?.enabled && (
            <Clock className="h-3 w-3 ml-1 text-green-600" />
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Configurações de Automação</DialogTitle>
        </DialogHeader>
        
        {!isLoading && (
          <AutomationSettings
            currentSettings={settings}
            onSaveSettings={handleSaveSettings}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};
