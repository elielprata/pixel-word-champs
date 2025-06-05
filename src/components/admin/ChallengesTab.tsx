
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';

interface Challenge {
  id: number;
  title: string;
  status: string;
  players: number;
  avgScore: number;
  description?: string;
  difficulty?: string;
  createdAt?: string;
}

interface ChallengesTabProps {
  challenges: Challenge[];
}

export const ChallengesTab = ({ challenges }: ChallengesTabProps) => {
  const [challengeList, setChallengeList] = useState(challenges);
  const [selectedChallenge, setSelectedChallenge] = useState<Challenge | null>(null);
  const [isNewChallengeOpen, setIsNewChallengeOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    difficulty: 'medium',
    status: 'Agendado'
  });

  const handleCreateChallenge = () => {
    const challenge: Challenge = {
      id: Date.now(),
      title: newChallenge.title,
      status: newChallenge.status,
      players: 0,
      avgScore: 0,
      description: newChallenge.description,
      difficulty: newChallenge.difficulty,
      createdAt: new Date().toLocaleDateString('pt-BR')
    };
    
    setChallengeList([...challengeList, challenge]);
    setNewChallenge({
      title: '',
      description: '',
      difficulty: 'medium',
      status: 'Agendado'
    });
    setIsNewChallengeOpen(false);
    console.log('Novo desafio criado:', challenge);
  };

  const handleViewDetails = (challenge: Challenge) => {
    setSelectedChallenge(challenge);
    setIsDetailsOpen(true);
    console.log('Visualizando detalhes do desafio:', challenge);
  };

  const handleStatusChange = (challengeId: number, newStatus: string) => {
    setChallengeList(challengeList.map(challenge => 
      challenge.id === challengeId 
        ? { ...challenge, status: newStatus }
        : challenge
    ));
    console.log(`Status do desafio ${challengeId} alterado para: ${newStatus}`);
  };

  const handleDeleteChallenge = (challengeId: number) => {
    setChallengeList(challengeList.filter(challenge => challenge.id !== challengeId));
    console.log(`Desafio ${challengeId} removido`);
  };

  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'Ativo': return 'default';
      case 'Agendado': return 'secondary';
      case 'Finalizado': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestão de Desafios</h2>
        <Dialog open={isNewChallengeOpen} onOpenChange={setIsNewChallengeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Desafio
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Criar Novo Desafio</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge({...newChallenge, title: e.target.value})}
                  placeholder="Nome do desafio"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge({...newChallenge, description: e.target.value})}
                  placeholder="Descreva o desafio"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={newChallenge.difficulty} onValueChange={(value) => setNewChallenge({...newChallenge, difficulty: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="easy">Fácil</SelectItem>
                    <SelectItem value="medium">Médio</SelectItem>
                    <SelectItem value="hard">Difícil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={newChallenge.status} onValueChange={(value) => setNewChallenge({...newChallenge, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Agendado">Agendado</SelectItem>
                    <SelectItem value="Ativo">Ativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewChallengeOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateChallenge} disabled={!newChallenge.title}>
                Criar Desafio
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Desafios Criados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {challengeList.map(challenge => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-semibold">{challenge.title}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>{challenge.players} jogadores</span>
                    <span>Média: {challenge.avgScore} pts</span>
                    {challenge.createdAt && <span>Criado: {challenge.createdAt}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getBadgeVariant(challenge.status)}>
                    {challenge.status}
                  </Badge>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleViewDetails(challenge)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {challenge.status !== 'Finalizado' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleStatusChange(challenge.id, challenge.status === 'Ativo' ? 'Agendado' : 'Ativo')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleDeleteChallenge(challenge.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog para detalhes do desafio */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Desafio</DialogTitle>
          </DialogHeader>
          {selectedChallenge && (
            <div className="grid gap-4 py-4">
              <div>
                <Label className="text-sm font-medium">Título</Label>
                <p className="text-sm text-gray-600">{selectedChallenge.title}</p>
              </div>
              {selectedChallenge.description && (
                <div>
                  <Label className="text-sm font-medium">Descrição</Label>
                  <p className="text-sm text-gray-600">{selectedChallenge.description}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <p className="text-sm text-gray-600">{selectedChallenge.status}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Jogadores</Label>
                  <p className="text-sm text-gray-600">{selectedChallenge.players}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Pontuação Média</Label>
                  <p className="text-sm text-gray-600">{selectedChallenge.avgScore} pts</p>
                </div>
                {selectedChallenge.difficulty && (
                  <div>
                    <Label className="text-sm font-medium">Dificuldade</Label>
                    <p className="text-sm text-gray-600 capitalize">{selectedChallenge.difficulty}</p>
                  </div>
                )}
              </div>
              {selectedChallenge.createdAt && (
                <div>
                  <Label className="text-sm font-medium">Data de Criação</Label>
                  <p className="text-sm text-gray-600">{selectedChallenge.createdAt}</p>
                </div>
              )}
            </div>
          )}
          <div className="flex justify-end">
            <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
