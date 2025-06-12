
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Send } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { logger } from '@/utils/logger';

interface SendEmailScreenProps {
  onBack: () => void;
}

const SendEmailScreen = ({ onBack }: SendEmailScreenProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('medium');
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleSendEmail = async () => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para enviar um email",
        variant: "destructive"
      });
      return;
    }

    setIsSending(true);
    
    try {
      const insertData = {
        user_id: user.id,
        report_type: 'support',
        subject: subject.trim(),
        message: message.trim(),
        priority: priority,
        status: 'pending'
      };

      const { error } = await supabase
        .from('user_reports')
        .insert(insertData as any);

      if (error) throw error;

      toast({
        title: "Email enviado com sucesso!",
        description: "Sua mensagem foi enviada. Responderemos em até 24 horas.",
      });
      
      logger.debug('Support email sent successfully');
      onBack();
    } catch (error) {
      logger.error('Error sending support email', { error });
      toast({
        title: "Erro ao enviar email",
        description: "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Enviar Email</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-500" />
            Contate Nossa Equipe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prioridade
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="low">Baixa - Sugestão ou dúvida geral</option>
              <option value="medium">Média - Problema no jogo</option>
              <option value="high">Alta - Problema urgente</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Assunto *
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Descreva o problema em poucas palavras"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mensagem *
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva sua dúvida ou problema em detalhes..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent h-32 resize-none"
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/1000 caracteres
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              💡 <strong>Dica:</strong> Inclua detalhes como seu dispositivo, versão do app e passos para reproduzir o problema.
            </p>
          </div>
        </CardContent>
      </Card>

      <Button 
        onClick={handleSendEmail}
        className="w-full"
        disabled={!subject.trim() || !message.trim() || isSending}
      >
        {isSending ? (
          'Enviando...'
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Enviar Email
          </>
        )}
      </Button>
    </div>
  );
};

export default SendEmailScreen;
