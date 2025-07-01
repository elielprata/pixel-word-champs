
import React, { useRef } from 'react';
import { Home, Trophy, UserPlus, User } from 'lucide-react';
import { logger } from '@/utils/logger';
import { useEdgeProtection } from '@/utils/edgeProtection';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, onTabChange }: BottomNavigationProps) => {
  const navRef = useRef<HTMLDivElement>(null);
  
  // ✅ APLICAR PROTEÇÃO DE BORDA NA NAVEGAÇÃO
  useEdgeProtection(navRef, true);

  const tabs = [
    { id: 'home', icon: Home, label: 'Início' },
    { id: 'ranking', icon: Trophy, label: 'Ranking' },
    { id: 'invite', icon: UserPlus, label: 'Convidar' },
    { id: 'profile', icon: User, label: 'Perfil' },
  ];

  const handleTabChange = (tabId: string) => {
    logger.info('Navegação entre abas', { 
      from: activeTab, 
      to: tabId 
    }, 'BOTTOM_NAVIGATION');
    onTabChange(tabId);
  };

  return (
    <div 
      ref={navRef}
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 shadow-lg navigation-safe total-edge-protection"
    >
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 navigation-safe no-tap-highlight ${
                isActive 
                  ? 'text-purple-600 bg-purple-50 hover-glow' 
                  : 'text-gray-500 hover:text-gray-700 hover-shadow active-dim'
              }`}
            >
              <Icon className={`w-6 h-6 mb-1 transition-all duration-200 ${isActive ? 'filter brightness-110' : ''}`} />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
