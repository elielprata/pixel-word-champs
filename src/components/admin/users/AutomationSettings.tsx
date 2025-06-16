
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar, Clock, Settings, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AutomationSettingsProps {
  onSaveSettings: (settings: AutomationConfig) => void;
  currentSettings: AutomationConfig | null;
}

interface AutomationConfig {
  enabled: boolean;
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string; // HH:MM format
  dayOfWeek?: number; // 0-6 for weekly (0 = Sunday)
  dayOfMonth?: number; // 1-31 for monthly
  requiresPassword: boolean;
}

export const AutomationSettings = ({ onSaveSettings, currentSettings }: AutomationSettingsProps) => {
  const [settings, setSettings] = useState<AutomationConfig>(
    currentSettings || {
      enabled: false,
      frequency: 'weekly',
      time: '03:00',
      dayOfWeek: 1, // Monday
      dayOfMonth: 1,
      requiresPassword: true
    }
  );

  const handleSave = () => {
    onSaveSettings(settings);
  };

  const getNextExecution = () => {
    if (!settings.enabled) return null;

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

            {settings.frequency === 'weekly' && (
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

            {settings.frequency === 'monthly' && (
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
                Esta ação é irreversível e será executada automaticamente no horário configurado.
              </AlertDescription>
            </Alert>
          </>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">
            <Settings className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
