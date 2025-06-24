
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus, RefreshCw } from 'lucide-react';
import { UnifiedCompetitionModal } from './UnifiedCompetitionModal';
import { DailyCompetitionsView } from './DailyCompetitionsView';
import { WeeklyRankingView } from './WeeklyRankingView';
import { EditCompetitionModal } from './EditCompetitionModal';
import { useUnifiedCompetitions } from '@/hooks/useUnifiedCompetitions';
import { useUnifiedCompetitionModal } from '@/hooks/useUnifiedCompetitionModal';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Trophy, Calendar } from 'lucide-react';

// Interface para mapear UnifiedCompetition para DailyCompetition
interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  theme: string;
  rules: any;
}

export const UnifiedCompetitionsView = () => {
  const { 
    competitions, 
    isLoading, 
    error, 
    refetch 
  } = useUnifiedCompetitions();
  
  const { 
    isOpen, 
    openModal, 
    closeModal 
  } = useUnifiedCompetitionModal();

  const [editingCompetition, setEditingCompetition] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCompetitionCreated = () => {
    refetch();
    closeModal();
  };

  // Converter UnifiedCompetition[] para DailyCompetition[]
  const dailyCompetitions: DailyCompetition[] = competitions
    .filter(comp => comp.type === 'daily')
    .map(comp => ({
      id: comp.id,
      title: comp.title,
      description: comp.description,
      start_date: comp.startDate,
      end_date: comp.endDate,
      status: comp.status,
      prize_pool: comp.prizePool,
      max_participants: comp.maxParticipants,
      total_participants: comp.totalParticipants || 0,
      theme: comp.theme || 'default',
      rules: null
    }));

  const handleRefresh = () => {
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sistema de Competições e Rankings</h2>
          <p className="text-slate-600">Gerencie competições diárias e o ranking semanal</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={openModal}>
            <Plus className="h-4 w-4 mr-2" />
            Criar Competição Diária
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Tabs para separar Competições Diárias e Ranking Semanal */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Competições Diárias
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ranking Semanal
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="daily" className="mt-6">
          <DailyCompetitionsView
            competitions={dailyCompetitions}
            isLoading={isLoading}
            onRefresh={handleRefresh}
          />
        </TabsContent>
        
        <TabsContent value="weekly" className="mt-6">
          <WeeklyRankingView />
        </TabsContent>
      </Tabs>

      {/* Modal de Criação (apenas para competições diárias) */}
      <UnifiedCompetitionModal
        open={isOpen}
        onOpenChange={closeModal}
        onCompetitionCreated={handleCompetitionCreated}
        competitionTypeFilter="daily"
      />

      {/* Modal de Edição */}
      {editingCompetition && (
        <EditCompetitionModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          competition={editingCompetition}
          onCompetitionUpdated={() => {
            refetch();
            setIsEditModalOpen(false);
            setEditingCompetition(null);
          }}
        />
      )}
    </div>
  );
};
