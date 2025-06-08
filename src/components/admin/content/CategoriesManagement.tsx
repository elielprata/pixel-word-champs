
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Tag, Wand2, Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { useWordCategories } from '@/hooks/useWordCategories';
import { useAIWordGeneration } from '@/hooks/useAIWordGeneration';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CategoriesManagement = () => {
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [selectedLevel, setSelectedLevel] = useState(1);

  const { 
    categories, 
    isLoading, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    isCreating,
    isUpdating,
    isDeleting
  } = useWordCategories();

  const { generateWords, isGenerating } = useAIWordGeneration();

  // Verificar se a API key da OpenAI está configurada
  const { data: openaiConfigured } = useQuery({
    queryKey: ['openaiConfig'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('game_settings')
        .select('setting_value')
        .eq('setting_key', 'openai_api_key')
        .single();
      
      return !error && data?.setting_value && data.setting_value.length > 0;
    },
  });

  const handleCreate = () => {
    if (!newCategory.name.trim()) return;
    
    createCategory({
      name: newCategory.name.trim(),
      description: newCategory.description.trim()
    });
    
    setNewCategory({ name: '', description: '' });
  };

  const handleEdit = (category: any) => {
    setEditingId(category.id);
    setEditForm({ name: category.name, description: category.description || '' });
  };

  const handleUpdate = () => {
    if (!editingId || !editForm.name.trim()) return;
    
    updateCategory({
      id: editingId,
      name: editForm.name.trim(),
      description: editForm.description.trim()
    });
    
    setEditingId(null);
    setEditForm({ name: '', description: '' });
  };

  const handleGenerateWords = (categoryId: string, categoryName: string) => {
    generateWords({
      categoryId,
      categoryName,
      level: selectedLevel
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-slate-600">Carregando categorias...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status da integração OpenAI */}
      <Card className={openaiConfigured ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {openaiConfigured ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">OpenAI Configurada</p>
                  <p className="text-xs text-green-600">As palavras serão geradas usando inteligência artificial</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="h-5 w-5 text-amber-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-800">OpenAI não configurada</p>
                  <p className="text-xs text-amber-600">Configure a API key na aba "Integrações" para usar IA real</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 border-amber-300 hover:bg-amber-100"
                  onClick={() => window.open('/admin-panel?tab=integrations', '_blank')}
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Configurar
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Formulário para nova categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Categoria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700">Nome</label>
              <Input
                placeholder="Ex: animais, objetos..."
                value={newCategory.name}
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Descrição (opcional)</label>
              <Input
                placeholder="Descrição da categoria"
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <Button 
            onClick={handleCreate}
            disabled={!newCategory.name.trim() || isCreating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            {isCreating ? 'Criando...' : 'Criar Categoria'}
          </Button>
        </CardContent>
      </Card>

      {/* Controle de nível para geração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Configuração de Geração IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700">Nível para geração:</label>
            <Input
              type="number"
              min="1"
              max="50"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(Number(e.target.value))}
              className="w-24"
            />
            <div className="text-xs text-slate-500">
              Nível define a complexidade das palavras geradas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de categorias */}
      <div className="grid gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Categorias Existentes</h3>
        
        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Tag className="h-12 w-12 text-slate-400 mx-auto mb-2" />
              <p className="text-slate-500">Nenhuma categoria encontrada</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {categories.map((category) => (
              <Card key={category.id} className="border-slate-200">
                <CardContent className="p-4">
                  {editingId === category.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <Input
                          value={editForm.name}
                          onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Nome da categoria"
                        />
                        <Input
                          value={editForm.description}
                          onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Descrição"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={handleUpdate}
                          disabled={isUpdating}
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Salvar
                        </Button>
                        <Button 
                          onClick={() => setEditingId(null)}
                          variant="outline"
                          size="sm"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {category.name}
                          </Badge>
                          {category.description && (
                            <span className="text-sm text-slate-600">{category.description}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleGenerateWords(category.id, category.name)}
                          disabled={isGenerating}
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700"
                        >
                          <Wand2 className="h-4 w-4 mr-1" />
                          {isGenerating ? 'Gerando...' : 'Gerar Palavras'}
                        </Button>
                        <Button
                          onClick={() => handleEdit(category)}
                          variant="outline"
                          size="sm"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => deleteCategory(category.id)}
                          variant="outline"
                          size="sm"
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Informações sobre dificuldade */}
      <Card className="bg-amber-50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-800 text-sm">Sistema de Dificuldade Automática</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-800 border-green-200">Fácil</Badge>
              <span className="text-slate-600">3 letras</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Médio</Badge>
              <span className="text-slate-600">4 letras</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-100 text-orange-800 border-orange-200">Difícil</Badge>
              <span className="text-slate-600">5 letras</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-100 text-red-800 border-red-200">Expert</Badge>
              <span className="text-slate-600">8+ letras</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
