
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Medal, Award, Crown, RefreshCw, Users, Clock } from 'lucide-react';
import { ChallengeRanking } from '@/services/challengeRankingService';

interface ChallengeRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  ranking: ChallengeRanking | null;
  isLoading: boolean;
  onRefresh: () => void;
  challengeTitle: string;
}

const ChallengeRankingModal = ({ 
  isOpen, 
  onClose, 
  ranking, 
  isLoading, 
  onRefresh,
  challengeTitle 
}: ChallengeRankingModalProps) => {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="w-5 h-5 text-yellow-500" />;
      case 2: return <Medal className="w-5 h-5 text-gray-400" />;
      case 3: return <Award className="w-5 h-5 text-orange-500" />;
      default: return <Trophy className="w-4 h-4 text-gray-400" />;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position <= 3) {
      const colors = {
        1: 'bg-yellow-500 text-white',
        2: 'bg-gray-400 text-white',
        3: 'bg-orange-500 text-white'
      };
      return colors[position as keyof typeof colors];
    }
    return 'bg-gray-100 text-gray-700';
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-bold">
              Ranking - {challengeTitle}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </DialogHeader>

        {isLoading && (
          <div className="flex justify-center py-8">
            <RefreshCw className="w-6 h-6 animate-spin text-purple-500" />
          </div>
        )}

        {ranking && !isLoading && (
          <div className="space-y-4">
            {/* Stats */}
            <div className="flex justify-between text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{ranking.totalParticipants.toLocaleString()} jogadores</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>Atualizado agora</span>
              </div>
            </div>

            {/* User Position */}
            {ranking.userPosition && (
              <Card className="bg-purple-50 border-purple-200">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        {ranking.userPosition}
                      </div>
                      <span className="font-medium text-purple-800">Sua Posição</span>
                    </div>
                    <span className="text-purple-600 font-bold">#{ranking.userPosition}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Top Rankings */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-800 mb-3">Top 10</h3>
              {ranking.rankings.slice(0, 10).map((player) => (
                <Card 
                  key={player.position} 
                  className={`${player.isCurrentUser ? 'bg-purple-50 border-purple-200' : 'bg-white'}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${getPositionBadge(player.position)}`}>
                          {player.position <= 3 ? getPositionIcon(player.position) : player.position}
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{player.playerName}</div>
                          <div className="text-xs text-gray-500">
                            Tempo: {formatTime(player.completionTime)}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-purple-600">
                          {player.score.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">pontos</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Fechar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeRankingModal;
