
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface ChangeUsernameScreenProps {
  onBack: () => void;
}

const ChangeUsernameScreen = ({ onBack }: ChangeUsernameScreenProps) => {
  const { user } = useAuth();
  const [newUsername, setNewUsername] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isValidUsername = (username: string) => {
    return username.trim().length >= 3 && username.trim().length <= 30;
  };

  const handleSave = async () => {
    if (!isValidUsername(newUsername)) return;
    
    setIsLoading(true);
    try {
      // Aqui seria implementada a lógica de atualização
      console.log('Novo nome de usuário:', newUsername);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simular delay
      onBack();
    } catch (error) {
      console.error('Erro ao alterar nome:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const usernameValid = isValidUsername(newUsername);
  const hasChanges = newUsername.trim() !== '' && newUsername !== user?.username;

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Alterar Nome</h1>
          <p className="text-sm text-gray-600">Como os outros jogadores te veem</p>
        </div>
      </div>

      {/* Card principal */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            Nome de Usuário
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {/* Nome atual */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome atual
            </label>
            <div className="p-3 bg-gray-50 rounded-lg border">
              <span className="text-gray-900 font-medium">{user?.username || 'Usuário'}</span>
            </div>
          </div>

          {/* Novo nome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Novo nome de usuário
            </label>
            <div className="relative">
              <input
                type="text"
                value={newUsername}
                onChange={(e) => setNewUsername(e.target.value)}
                placeholder="Digite seu novo nome"
                className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  newUsername && !usernameValid ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                maxLength={30}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {newUsername && (
                  usernameValid ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )
                )}
              </div>
            </div>
            
            {/* Feedback */}
            <div className="mt-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className={newUsername.length >= 3 ? 'text-green-600' : 'text-gray-500'}>
                  ✓ Mínimo 3 caracteres
                </span>
                <span className="text-gray-500">{newUsername.length}/30</span>
              </div>
              
              {newUsername && !usernameValid && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  Nome deve ter entre 3 e 30 caracteres
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Aviso de limitação */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg shadow-md mb-6">
        <div className="p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Limite de alterações</p>
              <p className="text-sm text-yellow-700">Você pode alterar seu nome apenas uma vez por mês.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="space-y-3">
        <Button 
          onClick={handleSave} 
          className="w-full"
          disabled={!hasChanges || !usernameValid || isLoading}
        >
          {isLoading ? 'Salvando...' : 'Salvar Novo Nome'}
        </Button>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default ChangeUsernameScreen;
