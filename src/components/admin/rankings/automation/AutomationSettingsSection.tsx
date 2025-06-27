import React from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, AlertTriangle } from 'lucide-react';
import { AutomationConfig } from '../../users/automation/types';
import { AutomationActions } from '../../users/automation/AutomationActions';
import { ManualTestSection } from '../../users/automation/ManualTestSection';
interface AutomationSettingsSectionProps {
  settings: AutomationConfig;
  showTestSection: boolean;
  isExecuting: boolean;
  onSettingsChange: (settings: AutomationConfig) => void;
  onSave: () => void;
  onToggleTestSection: () => void;
  onExecuteTest: () => Promise<void>;
  onCancelTest: () => void;
}
export const AutomationSettingsSection: React.FC<AutomationSettingsSectionProps> = ({
  settings,
  showTestSection,
  isExecuting,
  onSettingsChange,
  onSave,
  onToggleTestSection,
  onExecuteTest,
  onCancelTest
}) => {
  return <div className="space-y-6">
      {/* Switch de Automação */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <Label htmlFor="automation-enabled" className="text-base font-medium">
            Automação Ativada
          </Label>
          <p className="text-sm text-slate-600">
            Ativar reset automático de pontuações baseado nas datas do ranking semanal
          </p>
        </div>
        <Switch id="automation-enabled" checked={settings.enabled} onCheckedChange={enabled => onSettingsChange({
        ...settings,
        enabled
      })} />
      </div>

      {settings.enabled && <>
          {/* Informação sobre o tipo de trigger */}
          

          {/* Alerta de aviso */}
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Atenção:</strong> O reset automático zeará a pontuação de todos os usuários.
              Esta ação é irreversível e será executada automaticamente quando a data de fim do ranking for ultrapassada.
            </AlertDescription>
          </Alert>
        </>}

      <AutomationActions settings={settings} showTestSection={showTestSection} onSave={onSave} onToggleTestSection={onToggleTestSection} />

      <ManualTestSection showTestSection={showTestSection} isExecuting={isExecuting} onExecuteTest={onExecuteTest} onCancel={onCancelTest} />
    </div>;
};