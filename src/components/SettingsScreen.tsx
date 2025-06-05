
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bell, Globe, Volume2, Shield, User, Smartphone } from 'lucide-react';
import { Switch } from "@/components/ui/switch";
import LanguageSelectionScreen from './LanguageSelectionScreen';
import ChangeUsernameScreen from './ChangeUsernameScreen';
import DeleteAccountScreen from './DeleteAccountScreen';
import PrivacyPolicyScreen from './PrivacyPolicyScreen';
import TermsOfServiceScreen from './TermsOfServiceScreen';

interface SettingsScreenProps {
  onBack: () => void;
}

const SettingsScreen = ({ onBack }: SettingsScreenProps) => {
  const [notifications, setNotifications] = useState(true);
  const [sounds, setSounds] = useState(true);
  const [vibration, setVibration] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<'settings' | 'language' | 'username' | 'delete' | 'privacy' | 'terms'>('settings');

  if (currentScreen === 'language') {
    return <LanguageSelectionScreen onBack={() => setCurrentScreen('settings')} />;
  }

  if (currentScreen === 'username') {
    return <ChangeUsernameScreen onBack={() => setCurrentScreen('settings')} />;
  }

  if (currentScreen === 'delete') {
    return <DeleteAccountScreen onBack={() => setCurrentScreen('settings')} />;
  }

  if (currentScreen === 'privacy') {
    return <PrivacyPolicyScreen onBack={() => setCurrentScreen('settings')} />;
  }

  if (currentScreen === 'terms') {
    return <TermsOfServiceScreen onBack={() => setCurrentScreen('settings')} />;
  }

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Configurações</h1>
      </div>

      {/* Notifications */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-500" />
            Notificações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Novos desafios</p>
              <p className="text-sm text-gray-600">Receba notificações sobre novos desafios diários</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
        </CardContent>
      </Card>

      {/* Sound & Vibration */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Volume2 className="w-5 h-5 text-green-500" />
            Som e Vibração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Efeitos sonoros</p>
              <p className="text-sm text-gray-600">Sons durante o jogo</p>
            </div>
            <Switch checked={sounds} onCheckedChange={setSounds} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Vibração</p>
              <p className="text-sm text-gray-600">Feedback tátil durante o jogo</p>
            </div>
            <Switch checked={vibration} onCheckedChange={setVibration} />
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-500" />
            Idioma
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Português (Brasil)</p>
              <p className="text-sm text-gray-600">Idioma do aplicativo</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentScreen('language')}>
              Alterar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-orange-500" />
            Conta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setCurrentScreen('username')}
          >
            Alterar nome de usuário
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setCurrentScreen('delete')}
          >
            Excluir conta
          </Button>
        </CardContent>
      </Card>

      {/* Privacy */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-500" />
            Privacidade
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setCurrentScreen('privacy')}
          >
            Política de Privacidade
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => setCurrentScreen('terms')}
          >
            Termos de Uso
          </Button>
        </CardContent>
      </Card>

      {/* App Info */}
      <div className="text-center text-gray-500 text-sm">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Smartphone className="w-4 h-4" />
          <span>Letra Arena v1.0.0</span>
        </div>
        <p>Feito com ❤️ para gamers brasileiros</p>
      </div>
    </div>
  );
};

export default SettingsScreen;
