
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Shield, Zap, Database, Download, FileText, Cog, Save } from 'lucide-react';

interface SecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string | null;
  is_active: boolean;
}

interface SecuritySettingsProps {
  settings: SecuritySetting[];
  onUpdateSetting: (settingKey: string, value: string) => Promise<void>;
}

export const SecuritySettings = ({ settings, onUpdateSetting }: SecuritySettingsProps) => {
  const [editingSettings, setEditingSettings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);

  const handleSettingChange = (settingKey: string, value: string) => {
    setEditingSettings(prev => ({
      ...prev,
      [settingKey]: value
    }));
  };

  const handleSaveSetting = async (setting: SecuritySetting) => {
    const newValue = editingSettings[setting.setting_key] || setting.setting_value;
    setSaving(setting.setting_key);
    await onUpdateSetting(setting.setting_key, newValue);
    setEditingSettings(prev => {
      const updated = { ...prev };
      delete updated[setting.setting_key];
      return updated;
    });
    setSaving(null);
  };

  const getSettingDisplayName = (key: string) => {
    const names: Record<string, string> = {
      'max_login_attempts': 'Tentativas de Login',
      'session_timeout': 'Timeout da Sessão (s)',
      'enable_2fa': 'Autenticação 2FA',
      'suspicious_login_threshold': 'Threshold Suspeito',
      'fraud_detection_enabled': 'Detecção de Fraude',
      'ip_blocking_enabled': 'Bloqueio por IP',
      'rate_limit_requests': 'Limite de Requests/min'
    };
    return names[key] || key;
  };

  const renderSettingInput = (setting: SecuritySetting) => {
    const currentValue = editingSettings[setting.setting_key] !== undefined 
      ? editingSettings[setting.setting_key] 
      : setting.setting_value;
    const hasChanged = editingSettings[setting.setting_key] !== undefined;

    if (setting.setting_type === 'boolean') {
      return (
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={currentValue === 'true'}
            onChange={(e) => handleSettingChange(setting.setting_key, e.target.checked ? 'true' : 'false')}
            className="w-4 h-4"
          />
          <Badge className={currentValue === 'true' ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"}>
            {currentValue === 'true' ? 'Ativo' : 'Inativo'}
          </Badge>
          {hasChanged && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleSaveSetting(setting)}
              disabled={saving === setting.setting_key}
              className="h-6 px-2 text-xs"
            >
              <Save className="h-3 w-3 mr-1" />
              {saving === setting.setting_key ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      );
    }

    return (
      <div className="flex items-center gap-2">
        <Input
          type={setting.setting_type === 'number' ? 'number' : 'text'}
          value={currentValue}
          onChange={(e) => handleSettingChange(setting.setting_key, e.target.value)}
          className="h-6 text-xs w-24"
        />
        {hasChanged && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleSaveSetting(setting)}
            disabled={saving === setting.setting_key}
            className="h-6 px-2 text-xs"
          >
            <Save className="h-3 w-3 mr-1" />
            {saving === setting.setting_key ? 'Salvando...' : 'Salvar'}
          </Button>
        )}
      </div>
    );
  };

  // Agrupar configurações por categoria
  const systemSettings = settings.filter(s => 
    ['max_login_attempts', 'session_timeout', 'enable_2fa'].includes(s.setting_key)
  );
  
  const monitoringSettings = settings.filter(s => 
    ['suspicious_login_threshold', 'fraud_detection_enabled', 'ip_blocking_enabled'].includes(s.setting_key)
  );
  
  const otherSettings = settings.filter(s => 
    !systemSettings.includes(s) && !monitoringSettings.includes(s)
  );

  return (
    <Card className="border-slate-200">
      <CardHeader className="bg-slate-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Settings className="h-5 w-5 text-slate-600" />
          Configurações de Segurança
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sistema Antifraude */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Sistema Antifraude</h4>
            </div>
            <div className="space-y-3">
              {systemSettings.map(setting => (
                <div key={setting.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm text-slate-700 font-medium block">
                      {getSettingDisplayName(setting.setting_key)}
                    </span>
                    {setting.description && (
                      <span className="text-xs text-slate-500">{setting.description}</span>
                    )}
                  </div>
                  <div className="ml-2">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monitoramento */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Zap className="h-4 w-4 text-orange-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Monitoramento</h4>
            </div>
            <div className="space-y-3">
              {monitoringSettings.map(setting => (
                <div key={setting.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm text-slate-700 font-medium block">
                      {getSettingDisplayName(setting.setting_key)}
                    </span>
                    {setting.description && (
                      <span className="text-xs text-slate-500">{setting.description}</span>
                    )}
                  </div>
                  <div className="ml-2">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Outras Configurações e Ações Rápidas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Database className="h-4 w-4 text-purple-600" />
              </div>
              <h4 className="font-semibold text-slate-900">Outras Configurações</h4>
            </div>
            <div className="space-y-3">
              {otherSettings.map(setting => (
                <div key={setting.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <span className="text-sm text-slate-700 font-medium block">
                      {getSettingDisplayName(setting.setting_key)}
                    </span>
                    {setting.description && (
                      <span className="text-xs text-slate-500">{setting.description}</span>
                    )}
                  </div>
                  <div className="ml-2">
                    {renderSettingInput(setting)}
                  </div>
                </div>
              ))}
              
              {/* Ações Rápidas */}
              <div className="border-t pt-4 mt-4">
                <h5 className="text-sm font-medium text-slate-700 mb-3">Ações Rápidas</h5>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Logs
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                    <FileText className="h-4 w-4 mr-2" />
                    Relatório Semanal
                  </Button>
                  <Button variant="outline" size="sm" className="w-full justify-start bg-white border-slate-200 hover:bg-slate-50">
                    <Cog className="h-4 w-4 mr-2" />
                    Configurações Avançadas
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
