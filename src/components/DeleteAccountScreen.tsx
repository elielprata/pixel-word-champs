
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, AlertTriangle, Trash2, Shield, CheckCircle2 } from 'lucide-react';

interface DeleteAccountScreenProps {
  onBack: () => void;
}

const DeleteAccountScreen = ({ onBack }: DeleteAccountScreenProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const isConfirmed = confirmText === 'EXCLUIR';

  const handleDelete = async () => {
    if (!isConfirmed) return;
    
    setIsDeleting(true);
    try {
      // Aqui seria implementada a lógica de exclusão
      console.log('Conta excluída');
      await new Promise(resolve => setTimeout(resolve, 2000));
      onBack();
    } catch (error) {
      console.error('Erro ao excluir conta:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const dataItems = [
    'Todas as suas pontuações e rankings',
    'Histórico de desafios completados',
    'Conquistas e estatísticas',
    'Dados de convites e amigos',
    'Configurações personalizadas'
  ];

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-red-800">Excluir Conta</h1>
          <p className="text-sm text-red-600">Esta ação não pode ser desfeita</p>
        </div>
      </div>

      {/* Aviso principal */}
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-md mb-4">
        <div className="p-4 border-b border-red-200">
          <h3 className="text-lg font-semibold flex items-center gap-3 text-red-800">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            Atenção: Ação Irreversível
          </h3>
        </div>
        <div className="p-4">
          <p className="text-sm text-red-700">
            Uma vez excluída, sua conta e todos os dados associados serão permanentemente removidos. 
            Esta ação não pode ser desfeita.
          </p>
        </div>
      </div>

      {/* O que será perdido */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-gray-600" />
            </div>
            Dados que serão perdidos
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-2">
            {dataItems.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm text-gray-700">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Confirmação */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Para confirmar, digite <span className="font-bold text-red-600">EXCLUIR</span> na caixa abaixo:
          </label>
          <div className="relative">
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
              placeholder="Digite EXCLUIR"
              className={`w-full p-3 pr-10 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors ${
                confirmText && !isConfirmed ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {isConfirmed && (
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Alternativa */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg shadow-md mb-6">
        <div className="p-4">
          <div className="flex gap-3">
            <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Alternativa mais segura</p>
              <p className="text-sm text-blue-700">
                Considere apenas fazer logout ou entrar em contato com o suporte para desativar temporariamente sua conta.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Botões de ação */}
      <div className="space-y-3">
        <Button 
          onClick={handleDelete}
          variant="destructive"
          className="w-full"
          disabled={!isConfirmed || isDeleting}
        >
          {isDeleting ? 'Excluindo conta...' : 'Excluir Minha Conta Permanentemente'}
        </Button>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
          disabled={isDeleting}
        >
          Cancelar e Manter Conta
        </Button>
      </div>
    </div>
  );
};

export default DeleteAccountScreen;
