
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trophy, Target } from 'lucide-react';

interface UserScoresSectionProps {
  totalScore: number;
  gamesPlayed: number;
  bestDailyPosition?: number;
  bestWeeklyPosition?: number;
  onUpdate: (data: { 
    total_score?: number; 
    games_played?: number;
    best_daily_position?: number;
    best_weekly_position?: number;
  }) => Promise<void>;
  isLoading: boolean;
}

export const UserScoresSection = ({ 
  totalScore,
  gamesPlayed,
  bestDailyPosition,
  bestWeeklyPosition,
  onUpdate, 
  isLoading 
}: UserScoresSectionProps) => {
  const [editing, setEditing] = useState(false);
  const [scores, setScores] = useState({
    totalScore: totalScore.toString(),
    gamesPlayed: gamesPlayed.toString(),
    bestDailyPosition: bestDailyPosition?.toString() || '',
    bestWeeklyPosition: bestWeeklyPosition?.toString() || ''
  });

  const handleUpdate = async () => {
    const updateData: any = {};
    
    if (scores.totalScore !== totalScore.toString()) {
      updateData.total_score = parseInt(scores.totalScore) || 0;
    }
    if (scores.gamesPlayed !== gamesPlayed.toString()) {
      updateData.games_played = parseInt(scores.gamesPlayed) || 0;
    }
    if (scores.bestDailyPosition !== (bestDailyPosition?.toString() || '')) {
      updateData.best_daily_position = scores.bestDailyPosition ? parseInt(scores.bestDailyPosition) : null;
    }
    if (scores.bestWeeklyPosition !== (bestWeeklyPosition?.toString() || '')) {
      updateData.best_weekly_position = scores.bestWeeklyPosition ? parseInt(scores.bestWeeklyPosition) : null;
    }

    if (Object.keys(updateData).length > 0) {
      await onUpdate(updateData);
    }
    setEditing(false);
  };

  const handleCancel = () => {
    setScores({
      totalScore: totalScore.toString(),
      gamesPlayed: gamesPlayed.toString(),
      bestDailyPosition: bestDailyPosition?.toString() || '',
      bestWeeklyPosition: bestWeeklyPosition?.toString() || ''
    });
    setEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Pontuações e Estatísticas
        </h3>
        {!editing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setEditing(true)}
            className="h-6 px-2 text-xs"
          >
            Editar
          </Button>
        )}
      </div>
      
      {editing ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Pontuação Total</Label>
              <Input
                type="number"
                value={scores.totalScore}
                onChange={(e) => setScores(prev => ({ ...prev, totalScore: e.target.value }))}
                disabled={isLoading}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Jogos Realizados</Label>
              <Input
                type="number"
                value={scores.gamesPlayed}
                onChange={(e) => setScores(prev => ({ ...prev, gamesPlayed: e.target.value }))}
                disabled={isLoading}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Melhor Posição Diária</Label>
              <Input
                type="number"
                value={scores.bestDailyPosition}
                onChange={(e) => setScores(prev => ({ ...prev, bestDailyPosition: e.target.value }))}
                placeholder="Não definido"
                disabled={isLoading}
                className="h-8"
              />
            </div>
            <div>
              <Label className="text-xs">Melhor Posição Semanal</Label>
              <Input
                type="number"
                value={scores.bestWeeklyPosition}
                onChange={(e) => setScores(prev => ({ ...prev, bestWeeklyPosition: e.target.value }))}
                placeholder="Não definido"
                disabled={isLoading}
                className="h-8"
              />
            </div>
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button
              size="sm"
              onClick={handleUpdate}
              disabled={isLoading}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2 bg-slate-50 rounded border">
            <div className="text-xs text-slate-500">Pontuação Total</div>
            <div className="font-medium">{totalScore.toLocaleString()}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded border">
            <div className="text-xs text-slate-500">Jogos Realizados</div>
            <div className="font-medium">{gamesPlayed}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded border">
            <div className="text-xs text-slate-500">Melhor Posição Diária</div>
            <div className="font-medium">{bestDailyPosition || 'N/A'}</div>
          </div>
          <div className="p-2 bg-slate-50 rounded border">
            <div className="text-xs text-slate-500">Melhor Posição Semanal</div>
            <div className="font-medium">{bestWeeklyPosition || 'N/A'}</div>
          </div>
        </div>
      )}
    </div>
  );
};
