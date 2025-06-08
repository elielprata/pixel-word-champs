
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Settings, Database, Shield, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const ActiveSettingsDetails = () => {
  const { data: settings, isLoading } = useQuery({
    queryKey: ['activeSettings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_settings')
        .select('*')
        .in('category', ['scoring', 'gameplay']) // Removido 'prizes'
        .order('category')
        .order('setting_key');

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'scoring': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'gameplay': return <Settings className="h-4 w-4 text-blue-500" />;
      case 'integrations': return <Shield className="h-4 w-4 text-purple-500" />;
      default: return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'scoring': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'gameplay': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'integrations': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const groupedSettings = settings?.reduce((groups, setting) => {
    const category = setting.category || 'outros';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(setting);
    return groups;
  }, {} as Record<string, typeof settings>);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configurações Ativas ({settings?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(groupedSettings || {}).map(([category, categorySettings]) => (
          <div key={category} className="space-y-2">
            <div className="flex items-center gap-2">
              {getCategoryIcon(category)}
              <h4 className="font-medium text-sm uppercase tracking-wide text-gray-600">
                {category} ({categorySettings.length})
              </h4>
            </div>
            <div className="grid gap-2">
              {categorySettings.map((setting) => (
                <div key={setting.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{setting.setting_key}</span>
                      <Badge variant="outline" className={getCategoryColor(setting.category)}>
                        {setting.category}
                      </Badge>
                    </div>
                    {setting.description && (
                      <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono bg-white px-2 py-1 rounded border">
                      {setting.setting_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {(!settings || settings.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Nenhuma configuração encontrada</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
