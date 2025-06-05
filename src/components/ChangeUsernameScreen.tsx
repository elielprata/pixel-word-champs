
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User } from 'lucide-react';

interface ChangeUsernameScreenProps {
  onBack: () => void;
}

const ChangeUsernameScreen = ({ onBack }: ChangeUsernameScreenProps) => {
  const [username, setUsername] = useState('João Silva');
  const [newUsername, setNewUsername] = useState('');

  const handleSave = () => {
    if (newUsername.trim().length >= 3) {
      console.log('Novo nome de usuário:', newUsername);
      onBack();
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Alterar Nome</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Nome de Usuário
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome atual
            </label>
            <div className="p-3 bg-gray-50 rounded-lg text-gray-600">
              {username}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Novo nome *
            </label>
            <input
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Digite seu novo nome"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={30}
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 3 caracteres, máximo 30
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">
              ⚠️ Você só pode alterar seu nome uma vez por mês
            </p>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSave} 
        className="w-full"
        disabled={newUsername.trim().length < 3}
      >
        Salvar Novo Nome
      </Button>
    </div>
  );
};

export default ChangeUsernameScreen;
