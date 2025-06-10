
import React from 'react';
import { Home, Trophy, User, Settings, HelpCircle, Award } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNavigateToSettings?: () => void;
  onNavigateToHelp?: () => void;
  onNavigateToAchievements?: () => void;
}

const BottomNavigation = ({ 
  activeTab, 
  onTabChange, 
  onNavigateToSettings,
  onNavigateToHelp,
  onNavigateToAchievements 
}: BottomNavigationProps) => {
  const tabs = [
    { 
      id: 'home', 
      icon: Home, 
      label: 'Início',
      onClick: () => onTabChange('home')
    },
    { 
      id: 'ranking', 
      icon: Trophy, 
      label: 'Ranking',
      onClick: () => onTabChange('ranking')
    },
    { 
      id: 'achievements', 
      icon: Award, 
      label: 'Conquistas',
      onClick: onNavigateToAchievements || (() => onTabChange('achievements'))
    },
    { 
      id: 'profile', 
      icon: User, 
      label: 'Perfil',
      onClick: () => onTabChange('profile')
    },
    { 
      id: 'settings', 
      icon: Settings, 
      label: 'Config',
      onClick: onNavigateToSettings || (() => onTabChange('settings'))
    }
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={tab.onClick}
              className={`flex flex-col items-center justify-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-purple-600 bg-purple-50' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
