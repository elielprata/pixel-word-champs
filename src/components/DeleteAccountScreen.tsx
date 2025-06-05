
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface DeleteAccountScreenProps {
  onBack: () => void;
}

const DeleteAccountScreen = ({ onBack }: DeleteAccountScreenProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirmText === 'EXCLUIR') {
      setIsDeleting(true);
      // Aqui seria implementada a lógica de exclusão
      console.log('Conta excluída');
      
      // Simular processo de exclusão
      setTimeout(() => {
        setIsDeleting(false);
        onBack();
      }, 2000);
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-red-50 to-orange-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-red-800 ml-3">Excluir Conta</h1>
      </div>

      <Card className="mb-6 border-red-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Atenção: Esta ação é irreversível
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-medium text-red-800 mb-2">O que será perdido:</h3>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Todas as suas pontuações e rankings</li>
              <li>• Histórico de desafios completados</li>
              <li>• Conquistas e estatísticas</li>
              <li>• Dados de convites e amigos</li>
              <li>• Configurações personalizadas</li>
            </ul>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Para confirmar, digite <strong>EXCLUIR</strong> na caixa abaixo:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Digite EXCLUIR"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-sm text-gray-600">
              💡 <strong>Alternativa:</strong> Você pode desativar temporariamente sua conta entrando em contato com o suporte.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <Button 
          onClick={handleDelete}
          variant="destructive"
          className="w-full"
          disabled={confirmText !== 'EXCLUIR' || isDeleting}
        >
          {isDeleting ? 'Excluindo conta...' : 'Excluir Minha Conta Permanentemente'}
        </Button>
        
        <Button 
          onClick={onBack}
          variant="outline"
          className="w-full"
        >
          Cancelar
        </Button>
      </div>
    </div>
  );
};

export default DeleteAccountScreen;
