
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, User, Award, Settings, HelpCircle, LogOut } from 'lucide-react';

interface ProfileMenuProps {
  onMyData: () => void;
  onAchievements: () => void;
  onSettings?: () => void;
  onHelp: () => void;
  onLogout: () => void;
}

const ProfileMenu = ({ onMyData, onAchievements, onSettings, onHelp, onLogout }: ProfileMenuProps) => {
  const menuItems = [
    { 
      label: 'Meus Dados', 
      icon: User, 
      action: onMyData,
      description: 'Editar perfil e informações PIX',
      color: 'text-blue-600'
    },
    { 
      label: 'Conquistas (em breve)', 
      icon: Award, 
      action: onAchievements,
      description: 'Veja seus troféus',
      color: 'text-gray-400',
      disabled: true
    },
    { 
      label: 'Configurações', 
      icon: Settings, 
      action: onSettings,
      description: 'Preferências do app',
      color: 'text-gray-600'
    },
    { 
      label: 'Ajuda', 
      icon: HelpCircle, 
      action: onHelp,
      description: 'Suporte e dúvidas',
      color: 'text-blue-600'
    },
    { 
      label: 'Sair', 
      icon: LogOut, 
      action: onLogout, 
      danger: true,
      description: 'Encerrar sessão',
      color: 'text-red-600'
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardContent className="p-0">
        {menuItems.map((item, index) => (
          <button
            key={index}
            onClick={item.disabled ? undefined : item.action}
            disabled={item.disabled}
            className={`w-full flex items-center gap-3 p-4 text-left transition-colors border-b last:border-b-0 ${
              item.disabled 
                ? 'cursor-not-allowed bg-gray-50' 
                : item.danger 
                  ? 'hover:bg-red-50' 
                  : 'hover:bg-gray-50'
            }`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              item.disabled 
                ? 'bg-gray-100' 
                : item.danger 
                  ? 'bg-red-50' 
                  : 'bg-gray-50'
            }`}>
              <item.icon className={`w-5 h-5 ${
                item.disabled 
                  ? 'text-gray-400' 
                  : item.danger 
                    ? 'text-red-600' 
                    : item.color
              }`} />
            </div>
            <div className="flex-1">
              <p className={`font-medium ${
                item.disabled 
                  ? 'text-gray-400' 
                  : item.danger 
                    ? 'text-red-600' 
                    : 'text-gray-900'
              }`}>
                {item.label}
              </p>
              <p className={`text-xs ${item.disabled ? 'text-gray-300' : 'text-gray-500'}`}>
                {item.description}
              </p>
            </div>
            {!item.disabled && (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ))}
      </CardContent>
    </Card>
  );
};

export default ProfileMenu;
