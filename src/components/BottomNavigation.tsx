
import React from 'react';
import { Home, Trophy, Users, User } from 'lucide-react';
import { logger } from '@/utils/logger';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const handleTabClick = (tab: string) => {
    logger.debug('Navegação: mudança de aba', { from: activeTab, to: tab }, 'BOTTOM_NAVIGATION');
    onTabChange(tab);
  };

  const tabs = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'ranking', icon: Trophy, label: 'Ranking' },
    { id: 'invite', icon: Users, label: 'Convites' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-pb">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex flex-col items-center space-y-1 p-2 rounded-lg transition-colors ${
              activeTab === tab.id
                ? 'text-orange-600 bg-orange-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="h-6 w-6" />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
