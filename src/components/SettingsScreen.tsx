
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Volume2, Vibrate, Globe, Palette, Shield, Bell } from 'lucide-react';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const settingsGroups = [
    {
      title: "Áudio e Vibração",
      icon: Volume2,
      items: [
        { label: "Sons do jogo", enabled: true },
        { label: "Música de fundo", enabled: false },
        { label: "Vibração", enabled: true },
        { label: "Feedback tátil", enabled: true }
      ]
    },
    {
      title: "Notificações",
      icon: Bell,
      items: [
        { label: "Novos desafios", enabled: true },
        { label: "Ranking atualizado", enabled: true },
        { label: "Conquistas", enabled: true },
        { label: "Lembretes diários", enabled: false }
      ]
    },
    {
      title: "Idioma e Região",
      icon: Globe,
      items: [
        { label: "Português (Brasil)", enabled: true },
        { label: "Formato de data/hora", enabled: true }
      ]
    },
    {
      title: "Aparência",
      icon: Palette,
      items: [
        { label: "Tema escuro", enabled: false },
        { label: "Animações", enabled: true },
        { label: "Efeitos visuais", enabled: true }
      ]
    },
    {
      title: "Privacidade",
      icon: Shield,
      items: [
        { label: "Perfil público", enabled: true },
        { label: "Análise de dados", enabled: true },
        { label: "Anúncios personalizados", enabled: false }
      ]
    }
  ];

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Configurações</h1>
          <p className="text-sm text-slate-600">Personalize sua experiência</p>
        </div>
      </div>

      {/* Grupos de configurações */}
      <div className="space-y-4">
        {settingsGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="bg-white rounded-lg shadow-md border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                  <group.icon className="w-5 h-5 text-blue-600" />
                </div>
                {group.title}
              </h3>
            </div>
            <div className="p-4 space-y-3">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center justify-between">
                  <span className="text-gray-700">{item.label}</span>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    item.enabled ? 'bg-blue-600' : 'bg-gray-200'
                  }`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      item.enabled ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Ações adicionais */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mt-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Ações</h3>
        </div>
        <div className="p-4 space-y-3">
          <Button variant="outline" className="w-full justify-start">
            Limpar cache do app
          </Button>
          <Button variant="outline" className="w-full justify-start">
            Restaurar configurações padrão
          </Button>
          <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
            Excluir conta
          </Button>
        </div>
      </div>

      {/* Informações da versão */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 mt-6">
        <div className="p-4 text-center">
          <p className="text-sm text-gray-600">Versão 2.1.0</p>
          <p className="text-xs text-gray-500 mt-1">Build 2024.01.15</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
