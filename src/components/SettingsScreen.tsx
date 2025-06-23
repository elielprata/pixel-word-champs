
import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { logger } from '@/utils/logger';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  logger.debug('SettingsScreen renderizado', undefined, 'SETTINGS_SCREEN');

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="sticky top-0 bg-white/80 backdrop-blur-sm border-b border-purple-200 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-xl font-bold text-purple-800">Configurações</h1>
          <div className="w-10" />
        </div>
      </div>

      <div className="p-4">
        <p className="text-gray-600 text-center">Configurações em desenvolvimento...</p>
      </div>
    </div>
  );
};

export default SettingsScreen;
