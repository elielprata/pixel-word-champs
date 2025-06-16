
import React from 'react';
import { Button } from "@/components/ui/button";
import { Settings, Play } from 'lucide-react';
import { AutomationConfig } from './types';

interface AutomationActionsProps {
  settings: AutomationConfig;
  showTestSection: boolean;
  onSave: () => void;
  onToggleTestSection: () => void;
}

export const AutomationActions = ({ 
  settings, 
  showTestSection, 
  onSave, 
  onToggleTestSection 
}: AutomationActionsProps) => {
  return (
    <div className="flex justify-between items-center pt-4 border-t">
      <div className="space-x-2">
        <Button onClick={onSave} className="bg-orange-600 hover:bg-orange-700">
          <Settings className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
        
        {settings.enabled && (
          <Button
            variant="outline"
            onClick={onToggleTestSection}
            className="text-blue-600 hover:text-blue-700"
          >
            <Play className="h-4 w-4 mr-2" />
            Testar Agora
          </Button>
        )}
      </div>
    </div>
  );
};
