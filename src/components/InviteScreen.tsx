
import React, { useState, useEffect } from 'react';
import { Share2, Users, Gift, Copy, Check, UserPlus, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { inviteService } from '@/services/inviteService';
import { logger } from '@/utils/logger';

interface InviteStats {
  totalPoints: number;
  activeFriends: number;
  totalInvites: number;
}

interface InvitedFriend {
  name: string;
  status: 'Ativo' | 'Pendente';
  reward: number;
  level: number;
  avatar_url?: string;
}

const InviteScreen = () => {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [invitedFriends, setInvitedFriends] = useState<InvitedFriend[]>([]);
  const [inviteStats, setInviteStats] = useState<InviteStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [isUsing, setIsUsing] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadInviteData = async () => {
      logger.debug('Carregando dados de convites', undefined, 'INVITE_SCREEN');
      setIsLoading(true);
      
      try {
        const [codeResponse, friendsResponse, statsResponse] = await Promise.all([
          inviteService.generateInviteCode(),
          inviteService.getInvitedFriends(),
          inviteService.getInviteStats()
        ]);

        if (codeResponse.success && codeResponse.data) {
          setInviteCode(codeResponse.data.code);
          logger.debug('Código de convite carregado', { codePrefix: codeResponse.data.code.substring(0, 5) }, 'INVITE_SCREEN');
        }

        if (friendsResponse.success && Array.isArray(friendsResponse.data)) {
          setInvitedFriends(friendsResponse.data);
          logger.debug('Amigos convidados carregados', { count: friendsResponse.data.length }, 'INVITE_SCREEN');
        }

        if (statsResponse.success && statsResponse.data) {
          setInviteStats(statsResponse.data);
          logger.debug('Estatísticas de convites carregadas', { stats: statsResponse.data }, 'INVITE_SCREEN');
        }
      } catch (error) {
        logger.error('Erro ao carregar dados de convites', { error }, 'INVITE_SCREEN');
      } finally {
        setIsLoading(false);
      }
    };

    loadInviteData();
  }, []);

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);
      logger.debug('Código de convite copiado', { codePrefix: inviteCode.substring(0, 5) }, 'INVITE_SCREEN');
      
      toast({
        title: "Código copiado!",
        description: "O código foi copiado para sua área de transferência.",
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      logger.error('Erro ao copiar código', { error }, 'INVITE_SCREEN');
      toast({
        title: "Erro",
        description: "Não foi possível copiar o código.",
        variant: "destructive",
      });
    }
  };

  const handleUseCode = async () => {
    if (!inputCode.trim()) {
      toast({
        title: "Código inválido",
        description: "Digite um código válido.",
        variant: "destructive",
      });
      return;
    }

    logger.info('Tentativa de usar código de convite', { inputCodePrefix: inputCode.substring(0, 5) }, 'INVITE_SCREEN');
    setIsUsing(true);
    
    try {
      const response = await inviteService.useInviteCode(inputCode.trim());
      
      if (response.success) {
        logger.info('Código de convite usado com sucesso', { inputCodePrefix: inputCode.substring(0, 5) }, 'INVITE_SCREEN');
        toast({
          title: "Código usado com sucesso!",
          description: "Você ganhou pontos por usar este código.",
        });
        setInputCode('');
      } else {
        logger.warn('Falha ao usar código de convite', { 
          inputCodePrefix: inputCode.substring(0, 5),
          error: response.error 
        }, 'INVITE_SCREEN');
        toast({
          title: "Erro",
          description: response.error || "Código inválido ou já usado.",
          variant: "destructive",
        });
      }
    } catch (error) {
      logger.error('Erro ao usar código de convite', { error }, 'INVITE_SCREEN');
    } finally {
      setIsUsing(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Convide Amigos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <p>Carregando...</p>
          ) : (
            <>
              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Compartilhe seu código exclusivo com seus amigos e ganhe recompensas!
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    value={inviteCode || ''}
                    readOnly
                    className="flex-1"
                  />
                  <Button onClick={handleCopyCode} disabled={copied || !inviteCode}>
                    {copied ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">
                  Use o código de convite de um amigo para ganhar bônus!
                </p>
                <div className="flex items-center space-x-2">
                  <Input
                    type="text"
                    placeholder="Digite o código de convite"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={handleUseCode} disabled={isUsing}>
                    {isUsing ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Usar Código
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {inviteStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Gift className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-blue-700">Pontos Ganhos</p>
                          <p className="text-lg font-semibold text-blue-800">{inviteStats.totalPoints}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Users className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-sm font-medium text-green-700">Amigos Ativos</p>
                          <p className="text-lg font-semibold text-green-800">{inviteStats.activeFriends}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <Trophy className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-yellow-700">Total de Convites</p>
                          <p className="text-lg font-semibold text-yellow-800">{inviteStats.totalInvites}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              {invitedFriends.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-md font-semibold">Amigos Convidados</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="text-left">
                          <th className="py-2">Nome</th>
                          <th className="py-2">Status</th>
                          <th className="py-2">Recompensa</th>
                          <th className="py-2">Nível</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invitedFriends.map((friend) => (
                          <tr key={friend.name} className="border-b border-gray-200">
                            <td className="py-2">{friend.name}</td>
                            <td className="py-2">
                              <Badge variant={friend.status === 'Ativo' ? 'default' : 'secondary'}>
                                {friend.status}
                              </Badge>
                            </td>
                            <td className="py-2">{friend.reward}</td>
                            <td className="py-2">{friend.level}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default InviteScreen;
