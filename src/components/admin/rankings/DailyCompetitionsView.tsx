
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar } from 'lucide-react';
import { UnifiedCompetitionsList } from './UnifiedCompetitionsList';
import { UnifiedCompetitionModal } from './UnifiedCompetitionModal';
import { UnifiedCompetition } from '@/types/competition';
import { useToast } from "@/hooks/use-toast";

interface DailyCompetitionsViewProps {
  competitions: UnifiedCompetition[];
  isLoading: boolean;
}

export const DailyCompetitionsView = ({ competitions, isLoading }: DailyCompetitionsViewProps) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompetition, setEditingCompetition] = useState<UnifiedCompetition | null>(null);
  const { toast } = useToast();

  const handleEdit = (competition: UnifiedCompetition) => {
    console.log('🔧 Abrindo modal de edição para:', competition.id);
    setEditingCompetition(competition);
    // TODO: Implementar modal de edição completo
    toast({
      title: "Funcionalidade em desenvolvimento",
      description: `Edição da competição "${competition.title}" será implementada em breve.`,
    });
  };

  const handleDelete = (competition: UnifiedCompetition) => {
    console.log('✅ Competição excluída:', competition.id);
    // A exclusão já foi processada no UnifiedCompetitionsList
    // Aqui podemos atualizar a lista se necessário
    toast({
      title: "Competição removida",
      description: "A lista será atualizada automaticamente.",
    });
  };

  const handleCompetitionCreated = () => {
    setShowCreateModal(false);
    toast({
      title: "Competição criada",
      description: "A nova competição foi criada com sucesso.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle className="text-xl">Competições Diárias</CardTitle>
                <p className="text-sm text-slate-600 mt-1">
                  Gerencie competições diárias focadas no engajamento dos usuários
                </p>
              </div>
            </div>
            <Button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Nova Competição
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Lista de Competições */}
      <UnifiedCompetitionsList
        competitions={competitions}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal de Criação */}
      <UnifiedCompetitionModal
        open={showCreateModal}
        onOpenChange={setShowCreateModal}
        onCompetitionCreated={handleCompetitionCreated}
        competitionTypeFilter="daily"
      />
    </div>
  );
};
