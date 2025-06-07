
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface GameSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string;
  category: string;
}

interface GameSettingsFormProps {
  settings: GameSetting[];
  onSave: (updatedSettings: GameSetting[]) => Promise<void>;
  onReset: () => Promise<void>;
  saving: boolean;
}

const gameSettingsSchema = z.object({
  settings: z.array(z.object({
    id: z.string(),
    setting_key: z.string(),
    setting_value: z.string().min(1, 'Valor é obrigatório'),
    setting_type: z.string(),
    description: z.string(),
    category: z.string(),
  }))
});

type GameSettingsFormData = z.infer<typeof gameSettingsSchema>;

export const GameSettingsForm = ({ settings, onSave, onReset, saving }: GameSettingsFormProps) => {
  const { toast } = useToast();
  
  const form = useForm<GameSettingsFormData>({
    resolver: zodResolver(gameSettingsSchema),
    defaultValues: {
      settings: settings
    }
  });

  React.useEffect(() => {
    form.reset({ settings });
  }, [settings, form]);

  const handleSave = async (data: GameSettingsFormData) => {
    try {
      // Validações específicas por tipo
      const validatedSettings = data.settings.map(setting => {
        if (setting.setting_type === 'number') {
          const numValue = parseFloat(setting.setting_value);
          if (isNaN(numValue) || numValue < 0) {
            throw new Error(`${setting.description} deve ser um número válido e positivo`);
          }
        }
        
        if (setting.setting_key.includes('time') && setting.setting_type === 'number') {
          const timeValue = parseInt(setting.setting_value);
          if (timeValue < 30 || timeValue > 3600) {
            throw new Error(`${setting.description} deve estar entre 30 e 3600 segundos`);
          }
        }

        if (setting.setting_key.includes('points') && setting.setting_type === 'number') {
          const pointsValue = parseInt(setting.setting_value);
          if (pointsValue < 1 || pointsValue > 1000) {
            throw new Error(`${setting.description} deve estar entre 1 e 1000 pontos`);
          }
        }

        return setting;
      });

      await onSave(validatedSettings);
      
      toast({
        title: "Configurações salvas",
        description: "Todas as configurações foram salvas com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro na validação",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const handleReset = async () => {
    try {
      await onReset();
      toast({
        title: "Configurações restauradas",
        description: "Configurações restauradas para os valores padrão",
      });
    } catch (error) {
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar as configurações",
        variant: "destructive",
      });
    }
  };

  const groupedSettings = settings.reduce((groups, setting) => {
    const category = setting.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(setting);
    return groups;
  }, {} as Record<string, GameSetting[]>);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Configurações do Sistema</CardTitle>
            <CardDescription>
              Configure as regras e pontuações do jogo. Todas as alterações são validadas antes de serem salvas.
            </CardDescription>
            <div className="flex gap-2">
              <Button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Restaurar Padrão
              </Button>
            </div>
          </CardHeader>
        </Card>

        {Object.entries(groupedSettings).map(([category, categorySettings]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="text-lg">
                {category === 'scoring' ? 'Sistema de Pontuação' : 'Mecânicas do Jogo'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categorySettings.map((setting, index) => {
                  const fieldIndex = settings.findIndex(s => s.id === setting.id);
                  return (
                    <FormField
                      key={setting.id}
                      control={form.control}
                      name={`settings.${fieldIndex}.setting_value`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{setting.description}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={setting.setting_type === 'number' ? 'number' : 'text'}
                              placeholder={`Valor para ${setting.setting_key}`}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Chave: {setting.setting_key}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </form>
    </Form>
  );
};
