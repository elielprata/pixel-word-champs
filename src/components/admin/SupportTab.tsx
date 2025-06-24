
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, MessageSquare, Clock, CheckCircle, AlertCircle, Filter } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { createBrasiliaTimestamp, formatBrasiliaDate } from '@/utils/brasiliaTimeUnified';

interface SupportTicket {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  username?: string;
  resolution?: string;
}

export const SupportTab = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const isAdmin = useIsAdmin();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [newTicket, setNewTicket] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const loadTickets = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_user_id_fkey(username)
        `);

      // Se não for admin, mostrar apenas os próprios tickets
      if (!isAdmin) {
        query = query.eq('user_id', user?.id);
      }

      // Aplicar filtros
      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTickets = data?.map(ticket => ({
        ...ticket,
        username: ticket.profiles?.username || 'Usuário',
        status: ticket.status as 'open' | 'in_progress' | 'resolved',
        priority: ticket.priority as 'low' | 'medium' | 'high'
      })) || [];

      setTickets(formattedTickets);
    } catch (error) {
      console.error('Erro ao carregar tickets:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tickets de suporte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createTicket = async () => {
    if (!user || !newTicket.title || !newTicket.description) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          title: newTicket.title,
          description: newTicket.description,
          priority: newTicket.priority,
          status: 'open',
          user_id: user.id,
          created_at: createBrasiliaTimestamp(new Date().toString()),
          updated_at: createBrasiliaTimestamp(new Date().toString())
        });

      if (error) throw error;

      setNewTicket({ title: '', description: '', priority: 'medium' });
      loadTickets();
      
      toast({
        title: "Sucesso",
        description: "Ticket de suporte criado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o ticket de suporte",
        variant: "destructive",
      });
    }
  };

  const updateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          updated_at: createBrasiliaTimestamp(new Date().toString())
        })
        .eq('id', ticketId);

      if (error) throw error;

      loadTickets();
      toast({
        title: "Sucesso",
        description: "Status do ticket atualizado",
      });
    } catch (error) {
      console.error('Erro ao atualizar ticket:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o ticket",
        variant: "destructive",
      });
    }
  };

  const addResolution = async (ticketId: string, resolution: string) => {
    if (!resolution.trim()) return;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          resolution,
          status: 'resolved',
          updated_at: createBrasiliaTimestamp(new Date().toString())
        })
        .eq('id', ticketId);

      if (error) throw error;

      loadTickets();
      toast({
        title: "Sucesso",
        description: "Resolução adicionada e ticket resolvido",
      });
    } catch (error) {
      console.error('Erro ao adicionar resolução:', error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a resolução",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter, priorityFilter]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'resolved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStats = () => {
    const stats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      in_progress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      high_priority: tickets.filter(t => t.priority === 'high').length
    };
    return stats;
  };

  const stats = getTicketStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="h-5 w-5" />
        <h2 className="text-xl font-semibold">
          {isAdmin ? 'Gerenciar Suporte Técnico' : 'Suporte Técnico'}
        </h2>
      </div>

      {/* Estatísticas do Sistema (apenas para admins) */}
      {isAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-red-600">{stats.open}</div>
              <div className="text-sm text-gray-600">Abertos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-yellow-600">{stats.in_progress}</div>
              <div className="text-sm text-gray-600">Em Andamento</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
              <div className="text-sm text-gray-600">Resolvidos</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3">
              <div className="text-2xl font-bold text-red-700">{stats.high_priority}</div>
              <div className="text-sm text-gray-600">Alta Prioridade</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário para criar novo ticket */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {isAdmin ? 'Criar Ticket para Usuário' : 'Criar Novo Ticket'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newTicket.title}
                onChange={(e) => setNewTicket({ ...newTicket, title: e.target.value })}
                placeholder="Título do problema"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Prioridade</Label>
              <select
                id="priority"
                value={newTicket.priority}
                onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full p-2 border rounded-md"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={newTicket.description}
              onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
              placeholder="Descreva o problema em detalhes"
              rows={4}
            />
          </div>
          <Button onClick={createTicket} className="w-full">
            Criar Ticket
          </Button>
        </CardContent>
      </Card>

      {/* Filtros (apenas para admins) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todos</option>
                  <option value="open">Abertos</option>
                  <option value="in_progress">Em Andamento</option>
                  <option value="resolved">Resolvidos</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label>Prioridade</Label>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="all">Todas</option>
                  <option value="high">Alta</option>
                  <option value="medium">Média</option>
                  <option value="low">Baixa</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de tickets */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              {isAdmin ? 'Todos os Tickets de Suporte' : 'Meus Tickets de Suporte'}
            </CardTitle>
            <Button variant="outline" onClick={loadTickets} disabled={isLoading}>
              {isLoading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {tickets.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Nenhum ticket encontrado</p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <TicketCard 
                  key={ticket.id} 
                  ticket={ticket} 
                  isAdmin={isAdmin}
                  onStatusUpdate={updateTicketStatus}
                  onAddResolution={addResolution}
                  getStatusIcon={getStatusIcon}
                  getStatusColor={getStatusColor}
                  getPriorityColor={getPriorityColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Componente separado para o card do ticket
const TicketCard = ({ 
  ticket, 
  isAdmin, 
  onStatusUpdate, 
  onAddResolution,
  getStatusIcon,
  getStatusColor,
  getPriorityColor
}: {
  ticket: SupportTicket;
  isAdmin: boolean;
  onStatusUpdate: (id: string, status: string) => void;
  onAddResolution: (id: string, resolution: string) => void;
  getStatusIcon: (status: string) => React.ReactNode;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
}) => {
  const [showResolution, setShowResolution] = useState(false);
  const [resolution, setResolution] = useState('');

  const handleAddResolution = () => {
    onAddResolution(ticket.id, resolution);
    setResolution('');
    setShowResolution(false);
  };

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            {getStatusIcon(ticket.status)}
            <h3 className="font-semibold">{ticket.title}</h3>
            <Badge className={getPriorityColor(ticket.priority)}>
              {ticket.priority === 'high' ? 'Alta' : ticket.priority === 'medium' ? 'Média' : 'Baixa'}
            </Badge>
          </div>
          <p className="text-gray-600 mb-2">{ticket.description}</p>
          {ticket.resolution && (
            <div className="bg-green-50 p-3 rounded-md mb-2">
              <h4 className="font-semibold text-green-800 mb-1">Resolução:</h4>
              <p className="text-green-700">{ticket.resolution}</p>
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {isAdmin && <span>Por: {ticket.username || 'Usuário'}</span>}
            <span>Criado: {formatBrasiliaDate(new Date(ticket.created_at))}</span>
            <span>Atualizado: {formatBrasiliaDate(new Date(ticket.updated_at))}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getStatusColor(ticket.status)}>
            {ticket.status === 'open' ? 'Aberto' : 
             ticket.status === 'in_progress' ? 'Em Andamento' : 'Resolvido'}
          </Badge>
          {isAdmin && ticket.status !== 'resolved' && (
            <div className="flex gap-1">
              {ticket.status === 'open' && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onStatusUpdate(ticket.id, 'in_progress')}
                >
                  Iniciar
                </Button>
              )}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowResolution(!showResolution)}
              >
                Resolver
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Formulário de resolução para admins */}
      {isAdmin && showResolution && (
        <div className="border-t pt-3 space-y-3">
          <Label htmlFor={`resolution-${ticket.id}`}>Resolução</Label>
          <Textarea
            id={`resolution-${ticket.id}`}
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
            placeholder="Descreva como o problema foi resolvido..."
            rows={3}
          />
          <div className="flex gap-2">
            <Button onClick={handleAddResolution} disabled={!resolution.trim()}>
              Marcar como Resolvido
            </Button>
            <Button variant="outline" onClick={() => setShowResolution(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
