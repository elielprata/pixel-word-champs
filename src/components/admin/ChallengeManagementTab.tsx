import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Edit, Trash2, Target } from 'lucide-react';
import { useChallenges } from '@/hooks/useChallenges';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

export const ChallengeManagementTab = () => {
  const { challenges, isLoading, refetch } = useChallenges();
  const [isCreating, setIsCreating] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<any>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: 'default',
    color: 'blue',
    difficulty: 'medium',
    levels: 20,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      theme: 'default',
      color: 'blue',
      difficulty: 'medium',
      levels: 20,
      is_active: true
    });
  };

  const getNextId = () => {
    if (challenges.length === 0) return 1;
    return Math.max(...challenges.map(c => c.id)) + 1;
  };

  const handleCreate = async () => {
    try {
      const nextId = getNextId();
      const challengeData = {
        id: nextId,
        ...formData
      };

      const { error } = await supabase
        .from('challenges')
        .insert(challengeData);

      if (error) throw error;

      toast({
        title: "Desafio criado",
        description: `${formData.title} foi criado com sucesso.`,
      });

      resetForm();
      setIsCreating(false);
      refetch();
    } catch (error) {
      console.error('Error creating challenge:', error);
      toast({
        title: "Erro",
        description: "Erro ao criar desafio.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingChallenge) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .update(formData)
        .eq('id', editingChallenge.id);

      if (error) throw error;

      toast({
        title: "Desafio atualizado",
        description: `${formData.title} foi atualizado com sucesso.`,
      });

      resetForm();
      setEditingChallenge(null);
      refetch();
    } catch (error) {
      console.error('Error updating challenge:', error);
      toast({
        title: "Erro",
        description: "Erro ao atualizar desafio.",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (challenge: any) => {
    setFormData({
      title: challenge.title,
      description: challenge.description || '',
      theme: challenge.theme,
      color: challenge.color,
      difficulty: challenge.difficulty,
      levels: challenge.levels,
      is_active: challenge.is_active
    });
    setEditingChallenge(challenge);
  };

  const handleDelete = async (challengeId: number) => {
    if (!confirm('Tem certeza que deseja excluir este desafio?')) return;

    try {
      const { error } = await supabase
        .from('challenges')
        .delete()
        .eq('id', challengeId);

      if (error) throw error;

      toast({
        title: "Desafio excluído",
        description: "Desafio foi excluído com sucesso.",
        variant: "destructive",
      });

      refetch();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast({
        title: "Erro",
        description: "Erro ao excluir desafio.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Carregando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-xl">
            <Target className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Gestão de Desafios</h1>
            <p className="text-blue-100 text-sm">Configure e monitore todos os desafios da plataforma</p>
          </div>
        </div>
      </div>

      {/* Create/Edit Form */}
      {(isCreating || editingChallenge) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingChallenge ? 'Editar Desafio' : 'Criar Novo Desafio'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Animais do Brasil"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Dificuldade</Label>
                <Select value={formData.difficulty} onValueChange={(value) => setFormData(prev => ({ ...prev, difficulty: value }))}>
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

              <div className="space-y-2">
                <Label htmlFor="theme">Tema</Label>
                <Input
                  id="theme"
                  value={formData.theme}
                  onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                  placeholder="Ex: nature, geography"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="blue">Azul</SelectItem>
                    <SelectItem value="green">Verde</SelectItem>
                    <SelectItem value="orange">Laranja</SelectItem>
                    <SelectItem value="purple">Roxo</SelectItem>
                    <SelectItem value="red">Vermelho</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="levels">Níveis</Label>
                <Input
                  id="levels"
                  type="number"
                  value={formData.levels}
                  onChange={(e) => setFormData(prev => ({ ...prev, levels: parseInt(e.target.value) }))}
                  min="1"
                  max="100"
                />
              </div>

              <div className="space-y-2 flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                />
                <Label>Ativo</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descreva o tema do desafio..."
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={editingChallenge ? handleUpdate : handleCreate}
                disabled={!formData.title.trim()}
              >
                {editingChallenge ? 'Atualizar' : 'Criar'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsCreating(false);
                  setEditingChallenge(null);
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Button */}
      {!isCreating && !editingChallenge && (
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Desafio
        </Button>
      )}

      {/* Challenges List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {challenges.map((challenge) => (
          <Card key={challenge.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-lg">{challenge.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{challenge.description}</p>
                </div>
                <Badge variant={challenge.is_active ? 'default' : 'secondary'}>
                  {challenge.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              
              <div className="space-y-2 mb-4 text-sm text-gray-600">
                <div>Dificuldade: <span className="font-medium">{challenge.difficulty}</span></div>
                <div>Níveis: <span className="font-medium">{challenge.levels}</span></div>
                <div>Tema: <span className="font-medium">{challenge.theme}</span></div>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleEdit(challenge)}
                  className="flex-1"
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(challenge.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
