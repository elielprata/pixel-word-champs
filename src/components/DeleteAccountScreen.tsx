
import React, { useState } from 'react';
import { ArrowLeft, Trash2, AlertTriangle, Lock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/logger';

interface DeleteAccountScreenProps {
  onBack: () => void;
}

const DeleteAccountScreen = ({ onBack }: DeleteAccountScreenProps) => {
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const { user, signOut } = useAuth();

  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETAR CONTA') {
      toast({
        title: "Confirmação inválida",
        description: "Digite exatamente 'DELETAR CONTA' para confirmar",
        variant: "destructive",
      });
      return;
    }

    setIsDeleting(true);
    logger.warn('Iniciando exclusão de conta', { userId: user?.id }, 'DELETE_ACCOUNT');

    try {
      const { error } = await supabase.rpc('delete_user_account');
      
      if (error) {
        logger.error('Erro ao excluir conta', { error: error.message }, 'DELETE_ACCOUNT');
        throw error;
      }

      logger.info('Conta excluída com sucesso', undefined, 'DELETE_ACCOUNT');
      toast({
        title: "Conta excluída",
        description: "Sua conta foi excluída permanentemente.",
      });

      await signOut();
    } catch (error: any) {
      logger.error('Erro na exclusão de conta', { error: error.message }, 'DELETE_ACCOUNT');
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conta",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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

      <Card className="border-red-200 shadow-lg">
        <CardHeader className="bg-red-50 border-b border-red-200">
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Atenção: Ação Irreversível
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="bg-red-100 border border-red-200 rounded-lg p-4">
              <h3 className="font-semibold text-red-800 mb-2">O que será excluído:</h3>
              <ul className="text-red-700 space-y-1 text-sm">
                <li>• Seu perfil e dados pessoais</li>
                <li>• Histórico de jogos e pontuações</li>
                <li>• Participações em competições</li>
                <li>• Convites enviados e recebidos</li>
                <li>• Todas as configurações da conta</li>
              </ul>
            </div>

            <div className="bg-orange-100 border border-orange-200 rounded-lg p-4">
              <h3 className="font-semibold text-orange-800 mb-2">Importante:</h3>
              <ul className="text-orange-700 space-y-1 text-sm">
                <li>• Esta ação é permanente e irreversível</li>
                <li>• Você perderá acesso a prêmios pendentes</li>
                <li>• Não será possível recuperar os dados</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Para confirmar, digite: <span className="font-bold">DELETAR CONTA</span>
              </label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Digite DELETAR CONTA"
                className="border-red-300 focus:border-red-500"
              />
            </div>

            <Button
              onClick={handleDeleteAccount}
              disabled={confirmText !== 'DELETAR CONTA' || isDeleting}
              variant="destructive"
              className="w-full"
              size="lg"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Excluindo conta...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Excluir Conta Permanentemente
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeleteAccountScreen;
