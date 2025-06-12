import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Bug, Send, AlertTriangle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

interface ReportBugScreenProps {
  onBack: () => void;
}

const ReportBugScreen = ({ onBack }: ReportBugScreenProps) => {
  const [bugType, setBugType] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const bugTypes = [
    { value: 'gameplay', label: 'Problema durante o jogo' },
    { value: 'ui', label: 'Problema na interface' },
    { value: 'performance', label: 'Lentidão ou travamento' },
    { value: 'scoring', label: 'Erro na pontuação' },
    { value: 'other', label: 'Outro problema' }
  ];

  const handleSubmitBug = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para reportar um bug",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const fullMessage = `Tipo: ${bugTypes.find(t => t.value === bugType)?.label}\n\nDescrição:\n${description}\n\nPassos para reproduzir:\n${steps}`;
      
      const insertData = {
        user_id: user.id,
        report_type: 'bug',
        subject: `Bug Report: ${bugTypes.find(t => t.value === bugType)?.label}`,
        message: fullMessage,
        priority: 'high',
        status: 'pending'
      };

      const { error } = await supabase
        .from('user_reports')
        .insert(insertData);

      if (error) throw error;

      toast({
        title: "Bug reportado com sucesso!",
        description: "Obrigado por ajudar a melhorar o jogo. Nossa equipe irá analisar o report.",
      });
      
      logger.debug('Bug report submitted successfully');
      onBack();
    } catch (error) {
      logger.error('Error submitting bug report', { error });
      toast({
        title: "Erro ao reportar bug",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-red-50 to-orange-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-red-800 ml-3">Reportar Bug</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bug className="w-5 h-5 text-red-500" />
            Relatar Problema
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Ajude-nos a corrigir bugs fornecendo o máximo de detalhes possível
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo do problema *
            </label>
            <select
              value={bugType}
              onChange={(e) => setBugType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Selecione o tipo do problema</option>
              {bugTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do problema *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descreva o que aconteceu..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
              maxLength={500}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Passos para reproduzir *
            </label>
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Abri o jogo&#10;2. Cliquei em...&#10;3. O erro aconteceu quando..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent h-24 resize-none"
              maxLength={500}
            />
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-800 mb-2">Informações do dispositivo</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• Dispositivo: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</p>
              <p>• Navegador: {navigator.userAgent.split(' ')[0]}</p>
              <p>• Versão do app: 1.0.0</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSubmitBug}
        className="w-full"
        disabled={!bugType || !description.trim() || !steps.trim() || isSubmitting}
      >
        {isSubmitting ? (
          'Enviando relatório...'
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Relatório
          </>
        )}
      </Button>
    </div>
  );
};

export default ReportBugScreen;
