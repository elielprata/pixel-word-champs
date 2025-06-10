
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus, Copy, Share2, Gift } from 'lucide-react';

interface InviteScreenProps {
  onBack: () => void;
}

const InviteScreen = ({ onBack }: InviteScreenProps) => {
  const [inviteCode] = useState('PALAVRA2024');
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Convite - Jogo de Palavras',
        text: `Use meu código de convite: ${inviteCode}`,
        url: window.location.origin
      });
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-purple-800">Convide Amigos</h1>
          <p className="text-sm text-purple-600">Ganhe recompensas por cada convite</p>
        </div>
      </div>

      {/* Recompensas */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg shadow-md mb-6">
        <div className="p-4 text-white text-center">
          <Gift className="w-8 h-8 mx-auto mb-2" />
          <h3 className="text-lg font-bold">Sistema de Recompensas</h3>
          <p className="text-sm opacity-90">Ganhe pontos extras por cada amigo que se cadastrar</p>
        </div>
      </div>

      {/* Código de convite */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            Seu Código de Convite
          </h3>
        </div>
        <div className="p-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-purple-800 mb-2 font-mono">
              {inviteCode}
            </div>
            <p className="text-sm text-purple-600 mb-3">
              Compartilhe este código com seus amigos
            </p>
            <div className="flex gap-2">
              <Button 
                onClick={handleCopyCode}
                className="flex-1"
                variant={copied ? "default" : "outline"}
              >
                <Copy className="w-4 h-4 mr-2" />
                {copied ? 'Copiado!' : 'Copiar Código'}
              </Button>
              <Button onClick={handleShare} variant="outline">
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Como funciona */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-4">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Como Funciona</h3>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold shrink-0 mt-0.5">1</div>
            <p className="text-sm text-gray-700">Compartilhe seu código de convite com amigos</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold shrink-0 mt-0.5">2</div>
            <p className="text-sm text-gray-700">Eles inserem o código no cadastro</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 text-sm font-bold shrink-0 mt-0.5">3</div>
            <p className="text-sm text-gray-700">Ambos ganham pontos de bônus!</p>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold">Suas Estatísticas</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">12</div>
              <div className="text-sm text-gray-600">Convites Enviados</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">8</div>
              <div className="text-sm text-gray-600">Amigos Cadastrados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InviteScreen;
