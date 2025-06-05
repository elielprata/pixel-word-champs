
import React from 'react';
import { Home, Trophy, UserPlus, User } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Início',
      tooltip: 'Acesse os desafios diários e veja as novidades do Letra Arena'
    },
    { 
      id: 'ranking', 
      icon: Trophy, 
      label: 'Ranking',
      tooltip: 'Veja sua posição no ranking global e compete com outros jogadores'
    },
    { 
      id: 'invite', 
      icon: UserPlus, 
      label: 'Convidar',
      tooltip: 'Convide amigos para jogar e ganhe recompensas especiais'
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Perfil',
      tooltip: 'Gerencie sua conta, configurações e histórico de jogos'
    },
  ];

  return (
    <TooltipProvider>
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Tooltip key={tab.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(tab.id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'text-purple-600 bg-purple-50' 
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-1 ${isActive ? 'scale-110' : ''}`} />
                    <span className="text-xs font-medium">{tab.label}</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs">
                  <p className="text-sm">{tab.tooltip}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BottomNavigation;
