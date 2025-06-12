
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Trophy, Users, DollarSign, Plus, Edit, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface WeeklyTournament {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants?: number;
}

export const WeeklyTournamentsManagement = () => {
  const [tournaments, setTournaments] = useState<WeeklyTournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const loadTournaments = async () => {
    setIsLoading(true);
    try {
      console.log('🏆 Carregando torneios semanais...');
      
      const { data, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('competition_type', 'tournament' as any)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar torneios:', error);
        throw error;
      }

      // Transformar dados com validação
      const formattedTournaments = (data || []).map((item: any) => ({
        id: item.id || '',
        title: item.title || '',
        description: item.description || '',
        start_date: item.start_date || '',
        end_date: item.end_date || '',
        status: item.status || 'draft',
        prize_pool: Number(item.prize_pool) || 0,
        max_participants: Number(item.max_participants) || 0,
        total_participants: 0
      }));

      setTournaments(formattedTournaments);
      console.log('✅ Torneios carregados:', formattedTournaments.length);
    } catch (error: any) {
      console.error('❌ Erro ao carregar torneios:', error);
      toast({
        title: "Erro ao carregar torneios",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, []);

  const createNewTournament = async () => {
    setIsCreating(true);
    try {
      const newTournament = {
        title: `Torneio Semanal ${format(new Date(), 'dd/MM/yyyy', { locale: ptBR })}`,
        description: 'Novo torneio semanal criado automaticamente',
        competition_type: 'tournament',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'draft',
        prize_pool: 1000,
        max_participants: 100,
        theme: 'semanal',
        rules: {}
      };

      const { error } = await supabase
        .from('custom_competitions')
        .insert(newTournament as any);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Novo torneio criado com sucesso",
      });

      loadTournaments();
    } catch (error: any) {
      console.error('❌ Erro ao criar torneio:', error);
      toast({
        title: "Erro ao criar torneio",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const updateTournamentStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('custom_competitions')
        .update({
          status: status,
          prize_pool: 1000,
          max_participants: 100
        } as any)
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Status do torneio atualizado",
      });

      loadTournaments();
    } catch (error: any) {
      console.error('❌ Erro ao atualizar torneio:', error);
      toast({
        title: "Erro ao atualizar torneio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const deleteTournament = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este torneio?')) return;

    try {
      const { error } = await supabase
        .from('custom_competitions')
        .delete()
        .eq('id', id as any);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Torneio excluído com sucesso",
      });

      loadTournaments();
    } catch (error: any) {
      console.error('❌ Erro ao excluir torneio:', error);
      toast({
        title: "Erro ao excluir torneio",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      'active': 'default',
      'draft': 'secondary',
      'completed': 'outline',
      'scheduled': 'outline'
    };
    
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            <span className="ml-2">Carregando torneios...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-purple-600" />
              Torneios Semanais
            </CardTitle>
            <Button onClick={createNewTournament} disabled={isCreating}>
              <Plus className="h-4 w-4 mr-2" />
              {isCreating ? 'Criando...' : 'Novo Torneio'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tournaments.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Trophy className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum torneio encontrado</p>
              <p className="text-sm">Clique em "Novo Torneio" para criar o primeiro</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {tournaments.map((tournament) => (
                <Card key={tournament.id} className="border-l-4 border-l-purple-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{tournament.title}</h3>
                          {getStatusBadge(tournament.status)}
                        </div>
                        <p className="text-gray-600 text-sm mb-3">{tournament.description}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4 text-gray-500" />
                            <span>{format(new Date(tournament.start_date), 'dd/MM/yy', { locale: ptBR })}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>R$ {tournament.prize_pool}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-blue-500" />
                            <span>{tournament.total_participants || 0}/{tournament.max_participants}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {tournament.status === 'draft' && (
                          <Button
                            size="sm"
                            onClick={() => updateTournamentStatus(tournament.id, 'active')}
                          >
                            Ativar
                          </Button>
                        )}
                        {tournament.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateTournamentStatus(tournament.id, 'completed')}
                          >
                            Finalizar
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteTournament(tournament.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
