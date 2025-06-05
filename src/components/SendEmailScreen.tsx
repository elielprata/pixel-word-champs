
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Send } from 'lucide-react';

interface SendEmailScreenProps {
  onBack: () => void;
}

const SendEmailScreen = ({ onBack }: SendEmailScreenProps) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState('normal');
  const [isSending, setIsSending] = useState(false);

  const handleSendEmail = async () => {
    setIsSending(true);
    // Simular envio de email
    setTimeout(() => {
      setIsSending(false);
      alert('Email enviado com sucesso! Responderemos em até 24 horas.');
      onBack();
    }, 2000);
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
              <option value="normal">Normal - Problema no jogo</option>
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
