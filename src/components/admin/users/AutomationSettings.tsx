
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Settings, AlertTriangle, Play, Loader2, Trophy } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AutomationLogs } from './AutomationLogs';
import { useAutomationSettings } from '@/hooks/useAutomationSettings';

interface AutomationSettingsProps {
  onSaveSettings: (settings: AutomationConfig) => void;
  currentSettings: AutomationConfig | null;
}

interface AutomationConfig {
  enabled: boolean;
  triggerType: 'schedule' | 'competition_finalization';
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  requiresPassword: boolean;
  resetOnCompetitionEnd: boolean;
}

export const AutomationSettings = ({ onSaveSettings, currentSettings }: AutomationSettingsProps) => {
  const { logs, isExecuting, executeManualReset } = useAutomationSettings();
  const [settings, setSettings] = useState<AutomationConfig>(
    currentSettings || {
      enabled: false,
      triggerType: 'schedule',
      frequency: 'weekly',
      time: '03:00',
      dayOfWeek: 1,
      dayOfMonth: 1,
      requiresPassword: true,
      resetOnCompetitionEnd: false
    }
  );
  const [testPassword, setTestPassword] = useState('');
  const [showTestSection, setShowTestSection] = useState(false);

  const handleSave = () => {
    onSaveSettings(settings);
  };

  const handleManualTest = async () => {
    const success = await executeManualReset(settings.requiresPassword ? testPassword : undefined);
    if (success) {
      setTestPassword('');
      setShowTestSection(false);
    }
  };

  const getNextExecution = () => {
    if (!settings.enabled || settings.triggerType === 'competition_finalization') return null;

    const now = new Date();
    const [hours, minutes] = settings.time.split(':').map(Number);
    
    let nextDate = new Date();
    nextDate.setHours(hours, minutes, 0, 0);

    switch (settings.frequency) {
      case 'daily':
        if (nextDate <= now) {
          nextDate.setDate(nextDate.getDate() + 1);
        }
        break;
      case 'weekly':
        const targetDay = settings.dayOfWeek || 1;
        const currentDay = nextDate.getDay();
        let daysUntilTarget = targetDay - currentDay;
        if (daysUntilTarget <= 0 || (daysUntilTarget === 0 && nextDate <= now)) {
          daysUntilTarget += 7;
        }
        nextDate.setDate(nextDate.getDate() + daysUntilTarget);
        break;
      case 'monthly':
        nextDate.setDate(settings.dayOfMonth || 1);
        if (nextDate <= now) {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        break;
    }

    return nextDate;
  };

  const nextExecution = getNextExecution();
  const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

  return (
    <div className="space-y-6">
      <Card className="border-orange-200">
        <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Settings className="h-5 w-5" />
            Automação de Reset de Pontuações
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label htmlFor="automation-enabled" className="text-base font-medium">
                Automação Ativada
              </Label>
              <p className="text-sm text-slate-600">
                Ativar reset automático de pontuações
              </p>
            </div>
            <Switch
              id="automation-enabled"
              checked={settings.enabled}
              onCheckedChange={(enabled) => setSettings({ ...settings, enabled })}
            />
          </div>

          {settings.enabled && (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tipo de Trigger</Label>
                  <Select
                    value={settings.triggerType}
                    onValueChange={(triggerType: 'schedule' | 'competition_finalization') =>
                      setSettings({ ...settings, triggerType })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="schedule">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          Agendamento (Por horário)
                        </div>
                      </SelectItem>
                      <SelectItem value="competition_finalization">
                        <div className="flex items-center gap-2">
                          <Trophy className="h-4 w-4" />
                          Finalização de Competição
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.triggerType === 'schedule' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Frequência</Label>
                      <Select
                        value={settings.frequency}
                        onValueChange={(frequency: 'daily' | 'weekly' | 'monthly') =>
                          setSettings({ ...settings, frequency })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="daily">Diário</SelectItem>
                          <SelectItem value="weekly">Semanal</SelectItem>
                          <SelectItem value="monthly">Mensal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Horário</Label>
                      <Input
                        type="time"
                        value={settings.time}
                        onChange={(e) => setSettings({ ...settings, time: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                {settings.triggerType === 'schedule' && settings.frequency === 'weekly' && (
                  <div className="space-y-2">
                    <Label>Dia da Semana</Label>
                    <Select
                      value={settings.dayOfWeek?.toString()}
                      onValueChange={(day) =>
                        setSettings({ ...settings, dayOfWeek: parseInt(day) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day, index) => (
                          <SelectItem key={index} value={index.toString()}>
                            {day}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {settings.triggerType === 'schedule' && settings.frequency === 'monthly' && (
                  <div className="space-y-2">
                    <Label>Dia do Mês</Label>
                    <Input
                      type="number"
                      min="1"
                      max="31"
                      value={settings.dayOfMonth}
                      onChange={(e) =>
                        setSettings({ ...settings, dayOfMonth: parseInt(e.target.value) })
                      }
                    />
                  </div>
                )}

                {settings.triggerType === 'competition_finalization' && (
                  <Alert className="border-blue-200 bg-blue-50">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                      <strong>Reset por Finalização:</strong> O reset será executado automaticamente 
                      sempre que uma competição semanal for finalizada. Todos os usuários terão suas 
                      pontuações zeradas para começar a próxima competição.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label htmlFor="requires-password" className="text-base font-medium">
                    Requer Senha de Confirmação
                  </Label>
                  <p className="text-sm text-slate-600">
                    Exigir senha do admin antes de executar
                  </p>
                </div>
                <Switch
                  id="requires-password"
                  checked={settings.requiresPassword}
                  onCheckedChange={(requiresPassword) =>
                    setSettings({ ...settings, requiresPassword })
                  }
                />
              </div>

              {nextExecution && (
                <Alert className="border-green-200 bg-green-50">
                  <Calendar className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <strong>Próxima execução:</strong>{' '}
                    {nextExecution.toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </AlertDescription>
                </Alert>
              )}

              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Atenção:</strong> O reset automático zeará a pontuação de todos os usuários.
                  Esta ação é irreversível e será executada automaticamente {
                    settings.triggerType === 'competition_finalization' 
                      ? 'quando uma competição semanal for finalizada'
                      : 'no horário configurado'
                  }.
                </AlertDescription>
              </Alert>
            </>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <div className="space-x-2">
              <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
                <Settings className="h-4 w-4 mr-2" />
                Salvar Configurações
              </Button>
              
              {settings.enabled && (
                <Button
                  variant="outline"
                  onClick={() => setShowTestSection(!showTestSection)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Testar Agora
                </Button>
              )}
            </div>
          </div>

          {showTestSection && (
            <div className="border-t pt-4 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Executar Reset Manual</h4>
                <p className="text-sm text-blue-800 mb-4">
                  Teste a automação executando o reset manualmente agora.
                </p>
                
                {settings.requiresPassword && (
                  <div className="space-y-2 mb-4">
                    <Label htmlFor="test-password">Senha de Administrador</Label>
                    <Input
                      id="test-password"
                      type="password"
                      value={testPassword}
                      onChange={(e) => setTestPassword(e.target.value)}
                      placeholder="Digite sua senha atual"
                      disabled={isExecuting}
                    />
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    onClick={handleManualTest}
                    disabled={isExecuting || (settings.requiresPassword && !testPassword.trim())}
                    variant="destructive"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Executando...
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4 mr-2" />
                        Executar Reset Agora
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTestSection(false)}
                    disabled={isExecuting}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AutomationLogs logs={logs} />
    </div>
  );
};
