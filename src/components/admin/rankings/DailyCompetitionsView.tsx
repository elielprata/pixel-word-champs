
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, Eye, RefreshCw, Play, Pause, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DailyCompetitionRankingModal } from './DailyCompetitionRankingModal';

interface Competition {
  id: string;
  title: string;
  description?: string;
  theme?: string;
  start_date: string;
  end_date: string;
  status: string;
  max_participants?: number;
  competition_type: string;
}

interface DailyCompetitionsViewProps {
  competitions: Competition[];
  isLoading: boolean;
  onRefresh: () => void;
}

export const DailyCompetitionsView: React.FC<DailyCompetitionsViewProps> = ({
  competitions,
  isLoading,
  onRefresh
}) => {
  const navigate = useNavigate();
  const [selectedCompetitionId, setSelectedCompetitionId] = useState<string | null>(null);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);

  const dailyCompetitions = competitions.filter(comp => comp.competition_type === 'challenge');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'draft': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Play className="h-3 w-3" />;
      case 'scheduled': return <Calendar className="h-3 w-3" />;
      case 'completed': return <CheckCircle className="h-3 w-3" />;
      case 'draft': return <Pause className="h-3 w-3" />;
      default: return <Pause className="h-3 w-3" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Finalizado';
      case 'draft': return 'Rascunho';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewRanking = (competitionId: string) => {
    console.log('👀 Navegando para ranking da competição:', competitionId);
    navigate(`/admin/daily-competition/${competitionId}/ranking`);
  };

  const handleOpenRankingModal = (competitionId: string) => {
    setSelectedCompetitionId(competitionId);
    setIsRankingModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full mx-auto mb-2"></div>
          <p className="text-sm text-slate-600">Carregando competições diárias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-slate-700">
            {dailyCompetitions.length} competição{dailyCompetitions.length !== 1 ? 'ões' : ''} diária{dailyCompetitions.length !== 1 ? 's' : ''}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-blue-600 font-medium">Total</p>
                <p className="text-2xl font-bold text-blue-700">{dailyCompetitions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-green-600 font-medium">Ativas</p>
                <p className="text-2xl font-bold text-green-700">
                  {dailyCompetitions.filter(c => c.status === 'active').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Calendar className="h-4 w-4 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-amber-600 font-medium">Agendadas</p>
                <p className="text-2xl font-bold text-amber-700">
                  {dailyCompetitions.filter(c => c.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-violet-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-purple-600 font-medium">Finalizadas</p>
                <p className="text-2xl font-bold text-purple-700">
                  {dailyCompetitions.filter(c => c.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Competitions List */}
      <div className="space-y-4">
        {dailyCompetitions.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-slate-300 mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">Nenhuma competição diária</h3>
              <p className="text-sm text-slate-500">
                As competições diárias aparecerão aqui quando forem criadas.
              </p>
            </CardContent>
          </Card>
        ) : (
          dailyCompetitions.map((competition) => (
            <Card key={competition.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      {competition.title}
                    </CardTitle>
                    {competition.description && (
                      <p className="text-sm text-slate-600">{competition.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(competition.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(competition.status)}
                        {getStatusText(competition.status)}
                      </div>
                    </Badge>
                    {competition.theme && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {competition.theme}
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Início: {formatDate(competition.start_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Fim: {formatDate(competition.end_date)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Users className="h-4 w-4" />
                    <span>Máx: {competition.max_participants || 'Ilimitado'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    ⚠️ Competição sem premiação - Pontos transferidos para a semanal
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenRankingModal(competition.id)}
                      className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
                    >
                      <Eye className="h-3 w-3" />
                      Ranking
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewRanking(competition.id)}
                      className="flex items-center gap-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 border-purple-200"
                    >
                      <Trophy className="h-3 w-3" />
                      Ver Página
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Ranking Modal */}
      <DailyCompetitionRankingModal
        open={isRankingModalOpen}
        onOpenChange={setIsRankingModalOpen}
        competitionId={selectedCompetitionId}
      />
    </div>
  );
};
