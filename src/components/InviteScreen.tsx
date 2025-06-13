import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Users, Gift, Send, Copy, Check } from 'lucide-react';
import { useInvites } from '@/hooks/social/useInvites';
import { useAuth } from '@/hooks/auth/useAuth';
import { logger } from '@/utils/logger';

interface InviteScreenProps {
  onBack: () => void;
}

const InviteScreen = ({ onBack }: InviteScreenProps) => {
  const [inviteEmail, setInviteEmail] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const { user } = useAuth();
  const { inviteLink, isLoading, error, sendInvite } = useInvites();

  const handleSendInvite = async () => {
    if (!inviteEmail) {
      alert('Por favor, insira um email.');
      return;
    }

    logger.info('Enviando convite', { targetEmail: inviteEmail }, 'INVITE_SCREEN');
    await sendInvite(inviteEmail);
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      navigator.clipboard.writeText(inviteLink);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      logger.info('Link de convite copiado', { inviteLink }, 'INVITE_SCREEN');
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-green-50 to-yellow-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-green-800 ml-3">Convidar Amigos</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-yellow-500" />
            Compartilhe a diversão!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            Convide seus amigos para jogar e ganhe recompensas exclusivas!
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Convidar por Email
            </label>
            <div className="flex items-center">
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email do amigo"
                className="flex-1"
              />
              <Button
                onClick={handleSendInvite}
                disabled={isLoading}
                className="ml-2"
              >
                <Send className="w-4 h-4 mr-2" />
                Enviar
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Compartilhar Link
            </label>
            <div className="flex items-center">
              <Input
                type="text"
                value={inviteLink || ''}
                readOnly
                className="flex-1"
              />
              <Button
                onClick={handleCopyLink}
                disabled={!inviteLink}
                className="ml-2"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="w-5 h-5 text-pink-500" />
            Recompensas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-600">
            Ganhe prêmios incríveis ao convidar seus amigos!
          </p>
          <ul className="list-disc list-inside text-sm text-gray-700">
            <li>1 amigo: 100 moedas</li>
            <li>3 amigos: Avatar exclusivo</li>
            <li>5 amigos: Pacote de dicas</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteScreen;
