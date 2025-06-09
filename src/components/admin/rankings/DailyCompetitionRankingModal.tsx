
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Users, RefreshCw } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { dailyCompetitionService } from '@/services/dailyCompetitionService';

interface DailyCompetitionRankingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  competitionId: string | null;
}

export const DailyCompetitionRankingModal = ({ 
  open, 
  onOpenChange, 
  competitionId 
}: DailyCompetitionRankingModalProps) => {
  const [ranking, setRanking] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRanking = async () => {
    if (!competitionId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await dailyCompetitionService.getDailyCompetitionRanking(competitionId);
      
      if (response.success) {
        setRanking(response.data);
      } else {
        setError(response.error || 'Erro ao carregar ranking');
      }
    } catch (err) {
      console.error('❌ Erro ao carregar ranking:', err);
      setError('Erro ao carregar ranking');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (open && competitionId) {
      fetchRanking();
    }
  }, [open, competitionId]);

  const getPositionColor = (position: number) => {
    switch (position) {
      case 1: return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 2: return 'text-gray-600 bg-gray-50 border-gray-200';
      case 3: return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center gap-2">
              <Trophy className="h-4 w-4 text-amber-600" />
              Ranking da Competição Diária
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={fetchRanking}
              disabled={isLoading}
              className="h-8"
            >
              <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Informações Gerais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700">
              <Users className="h-4 w-4" />
              <span className="font-medium">
                {ranking.length} participante{ranking.length !== 1 ? 's' : ''} registrado{ranking.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs text-blue-600 mt-1">
              ⚠️ Esta competição não possui premiação
            </p>
          </div>

          {/* Lista de Ranking */}
          <div className="overflow-y-auto max-h-96 space-y-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-slate-600">Carregando ranking...</p>
                </div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-600 text-sm">{error}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={fetchRanking}
                  className="mt-2"
                >
                  Tentar novamente
                </Button>
              </div>
            ) : ranking.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <Trophy className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                <p className="font-medium">Nenhum participante ainda</p>
                <p className="text-sm">Os participantes aparecerão aqui quando jogarem na competição.</p>
              </div>
            ) : (
              ranking.map((participant) => (
                <Card key={`${participant.user_id}-${participant.user_position}`} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className={`w-8 h-6 flex items-center justify-center font-bold ${getPositionColor(participant.user_position)}`}>
                          {participant.user_position}º
                        </Badge>
                        
                        <div className="flex items-center gap-2">
                          {participant.profiles?.avatar_url ? (
                            <img 
                              src={participant.profiles.avatar_url} 
                              alt={participant.profiles.username}
                              className="w-6 h-6 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                              <span className="text-xs font-medium text-slate-600">
                                {participant.profiles?.username?.charAt(0)?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <span className="font-medium text-slate-800">
                            {participant.profiles?.username || 'Usuário'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-bold text-slate-800">
                            {participant.user_score.toLocaleString()} pts
                          </div>
                          <div className="text-xs text-slate-500">
                            {new Date(participant.created_at).toLocaleDateString('pt-BR')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
