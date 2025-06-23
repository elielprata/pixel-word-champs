
import React from 'react';
import { Home, Trophy, User, Settings } from 'lucide-react';

interface BottomNavigationProps {
  currentScreen: 'home' | 'ranking' | 'fullRanking' | 'profile' | 'settings' | 'invite' | 'achievements';
  onScreenChange: (screen: 'home' | 'ranking' | 'fullRanking' | 'profile' | 'settings' | 'invite' | 'achievements') => void;
}

const BottomNavigation = ({ currentScreen, onScreenChange }: BottomNavigationProps) => {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Início' },
    { id: 'ranking' as const, icon: Trophy, label: 'Ranking' },
    { id: 'profile' as const, icon: User, label: 'Perfil' },
    { id: 'settings' as const, icon: Settings, label: 'Config' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onScreenChange(id)}
            className={`flex flex-col items-center justify-center py-2 px-4 rounded-lg transition-colors ${
              currentScreen === id
                ? 'text-purple-600 bg-purple-50'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Icon className="w-5 h-5 mb-1" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default BottomNavigation;
