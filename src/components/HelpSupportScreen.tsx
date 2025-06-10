
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle, Mail, BookOpen, Star, HelpCircle, Bug } from 'lucide-react';
import LiveChatScreen from './LiveChatScreen';
import SendEmailScreen from './SendEmailScreen';
import ReportBugScreen from './ReportBugScreen';
import BasicTutorialScreen from './BasicTutorialScreen';
import AdvancedStrategiesScreen from './AdvancedStrategiesScreen';
import RankingSystemScreen from './RankingSystemScreen';

interface HelpSupportScreenProps {
  onBack: () => void;
}

const HelpSupportScreen = ({ onBack }: HelpSupportScreenProps) => {
  const [currentScreen, setCurrentScreen] = useState<'help' | 'chat' | 'email' | 'bug' | 'basic' | 'advanced' | 'ranking'>('help');

  const faqs = [
    {
      question: "Como funciona a pontuação?",
      answer: "Palavras de 3 letras = 1 ponto, 4 letras = 2 pontos, 5 letras = 3 pontos, 6+ letras = 5+ pontos"
    },
    {
      question: "Posso jogar um desafio mais de uma vez?",
      answer: "Não, cada desafio só pode ser jogado uma vez por dia para manter a competição justa"
    },
    {
      question: "Como funcionam as dicas?",
      answer: "Você tem 1 dica gratuita por nível. Assista um anúncio para revelar uma palavra no tabuleiro"
    },
    {
      question: "O que é o sistema de revive?",
      answer: "Assista anúncios para ganhar +30 segundos extras em qualquer nível, quantas vezes quiser"
    }
  ];

  if (currentScreen === 'chat') {
    return <LiveChatScreen onBack={() => setCurrentScreen('help')} />;
  }

  if (currentScreen === 'email') {
    return <SendEmailScreen onBack={() => setCurrentScreen('help')} />;
  }

  if (currentScreen === 'bug') {
    return <ReportBugScreen onBack={() => setCurrentScreen('help')} />;
  }

  if (currentScreen === 'basic') {
    return <BasicTutorialScreen onBack={() => setCurrentScreen('help')} />;
  }

  if (currentScreen === 'advanced') {
    return <AdvancedStrategiesScreen onBack={() => setCurrentScreen('help')} />;
  }

  if (currentScreen === 'ranking') {
    return <RankingSystemScreen onBack={() => setCurrentScreen('help')} />;
  }

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Ajuda e Suporte</h1>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-blue-500" />
            Precisa de Ajuda?
          </h3>
        </div>
        <div className="p-4 space-y-3">
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="lg"
            onClick={() => setCurrentScreen('chat')}
          >
            <MessageCircle className="w-5 h-5 mr-3" />
            Chat ao Vivo
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="lg"
            onClick={() => setCurrentScreen('email')}
          >
            <Mail className="w-5 h-5 mr-3" />
            Enviar Email
          </Button>
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="lg"
            onClick={() => setCurrentScreen('bug')}
          >
            <Bug className="w-5 h-5 mr-3" />
            Reportar Bug
          </Button>
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-green-500" />
            Perguntas Frequentes
          </h3>
        </div>
        <div className="p-4 space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-200 last:border-b-0 pb-4 last:pb-0">
              <h3 className="font-medium text-gray-800 mb-2">{faq.question}</h3>
              <p className="text-sm text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Tutorial */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            Tutorial
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentScreen('basic')}
            >
              Como jogar - Básico
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentScreen('advanced')}
            >
              Estratégias avançadas
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setCurrentScreen('ranking')}
            >
              Sistema de ranking
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Informações de Contato</h3>
        </div>
        <div className="p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Mail className="w-4 h-4" />
            <span>suporte@letraarena.com</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MessageCircle className="w-4 h-4" />
            <span>Chat disponível das 9h às 18h</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-500 text-sm">
        <p>Letra Arena v1.0.0</p>
        <p>Feito com ❤️ para gamers brasileiros</p>
      </div>
    </div>
  );
};

export default HelpSupportScreen;
