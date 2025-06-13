
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trophy, Calendar, Clock, Users } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useDailyRanking } from '@/hooks/ranking/useDailyRanking';

interface DailyRankingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DailyRankingModal: React.FC<DailyRankingModalProps> = ({
  open,
  onOpenChange
}) => {
  const { dailyRanking, isLoading } = useDailyRanking();

  const formatTime = () => {
    const now = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(endOfWeek.getDate() + (7 - endOfWeek.getDay()));
    endOfWeek.setHours(23, 59, 59, 999);
    
    const diff = endOfWeek.getTime() - now.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days}d ${hours}h`;
  };

  const getRankingColor = (position: number) => {
    if (position === 1) return 'text-yellow-600 bg-yellow-50';
    if (position === 2) return 'text-gray-600 bg-gray-50';
    if (position === 3) return 'text-orange-600 bg-orange-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getRankingIcon = (position: number) => {
    if (position === 1) return '🥇';
    if (position === 2) return '🥈';
    if (position === 3) return '🥉';
    return `#${position}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="border-b border-slate-200 pb-4">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Trophy className="h-6 w-6 text-orange-500" />
            Ranking Semanal Consolidado
          </DialogTitle>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Semana atual</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Reseta em: {formatTime()}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{dailyRanking.length} participantes</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-b-2 border-orange-500 rounded-full mx-auto mb-4"></div>
                <p className="text-slate-600">Carregando ranking...</p>
              </div>
            </div>
          ) : dailyRanking.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">Nenhuma pontuação registrada esta semana</p>
            </div>
          ) : (
            <div className="space-y-2 p-4">
              {dailyRanking.map((player) => (
                <div 
                  key={player.user_id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${getRankingColor(player.pos)}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 font-bold text-sm">
                      {typeof getRankingIcon(player.pos) === 'string' && getRankingIcon(player.pos).includes('#') ? (
                        <span className="text-slate-600">{player.pos}</span>
                      ) : (
                        <span>{getRankingIcon(player.pos)}</span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {player.avatar_url ? (
                        <img 
                          src={player.avatar_url} 
                          alt={player.name}
                          className="w-8 h-8 rounded-full border"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-slate-600 text-sm font-medium">
                            {player.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div>
                        <p className="font-medium text-slate-900">{player.name}</p>
                        <p className="text-xs text-slate-500">Posição {player.pos}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <Badge variant="outline" className="font-bold">
                      {player.score.toLocaleString()} pts
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="border-t border-slate-200 pt-4 text-center">
          <p className="text-xs text-slate-500">
            💡 O ranking é acumulativo semanal - pontos das competições diárias são somados automaticamente
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
