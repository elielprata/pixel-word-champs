
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, HelpCircle, FileText, Shield, Globe, Trash2 } from 'lucide-react';
import { useAppNavigation } from '@/hooks/useAppNavigation';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const { navigateToScreen } = useAppNavigation();

  const menuItems = [
    {
      icon: HelpCircle,
      title: "Ajuda",
      subtitle: "FAQs, tutoriais e regras do jogo",
      onClick: () => navigateToScreen('help'),
      color: "text-blue-500"
    },
    {
      icon: FileText,
      title: "Termos de Uso",
      subtitle: "Leia nossos termos e condições",
      onClick: () => navigateToScreen('terms'),
      color: "text-green-500"
    },
    {
      icon: Shield,
      title: "Política de Privacidade",
      subtitle: "Como protegemos seus dados",
      onClick: () => navigateToScreen('privacy'),
      color: "text-purple-500"
    },
    {
      icon: Globe,
      title: "Idioma",
      subtitle: "Português (Brasil)",
      onClick: () => navigateToScreen('language'),
      color: "text-orange-500"
    },
    {
      icon: Trash2,
      title: "Excluir Conta",
      subtitle: "Remover permanentemente sua conta",
      onClick: () => navigateToScreen('deleteAccount'),
      color: "text-red-500"
    }
  ];

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Configurações</h1>
      </div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => {
          const IconComponent = item.icon;
          return (
            <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center" onClick={item.onClick}>
                  <div className={`p-2 rounded-lg bg-gray-100 mr-4 ${item.color}`}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.subtitle}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>Letra Arena v1.0.0</p>
        <p>Feito com ❤️ para gamers brasileiros</p>
      </div>
    </div>
  );
};

export default SettingsScreen;
