
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Tag,
  Bot,
  Zap
} from 'lucide-react';
import { useWordCategories } from '@/hooks/useWordCategories';
import { useAIWordGeneration } from '@/hooks/useAIWordGeneration';
import { useToast } from "@/hooks/use-toast";

export const CategoriesManagement = () => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDescription, setNewCategoryDescription] = useState('');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { toast } = useToast();
  const { categories, isLoading, createCategory, updateCategory, deleteCategory } = useWordCategories();
  const { generateWords, isGenerating } = useAIWordGeneration();

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      await createCategory({
        name: newCategoryName.trim(),
        description: newCategoryDescription.trim() || undefined,
      });
      setNewCategoryName('');
      setNewCategoryDescription('');
      toast({
        title: "Sucesso!",
        description: "Categoria criada com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateWords = async (categoryId: string, categoryName: string) => {
    try {
      await generateWords({
        categoryId,
        categoryName,
        count: 50, // Gerar 50 palavras por padrão
      });
    } catch (error) {
      console.error('Erro ao gerar palavras:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-slate-500">Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulário para criar nova categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Nova Categoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoryName">Nome da Categoria</Label>
                <Input
                  id="categoryName"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="Ex: Animais, Frutas, Esportes..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoryDescription">Descrição (opcional)</Label>
                <Textarea
                  id="categoryDescription"
                  value={newCategoryDescription}
                  onChange={(e) => setNewCategoryDescription(e.target.value)}
                  placeholder="Descrição da categoria..."
                  rows={3}
                />
              </div>
            </div>
            <Button 
              onClick={handleCreateCategory}
              disabled={isCreating || !newCategoryName.trim()}
              className="w-full md:w-auto"
            >
              {isCreating ? 'Criando...' : 'Criar Categoria'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de categorias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Categorias Existentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!categories || categories.length === 0 ? (
            <div className="text-center py-8">
              <Tag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-slate-500">Nenhuma categoria encontrada</p>
              <p className="text-sm text-slate-400 mt-1">
                Crie sua primeira categoria para começar
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[200px]">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>
                      {category.description || (
                        <span className="text-slate-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={category.is_active ? "default" : "secondary"}
                      >
                        {category.is_active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleGenerateWords(category.id, category.name)}
                          disabled={isGenerating}
                          className="h-8 w-8 p-0"
                          title="Gerar palavras com IA"
                        >
                          {isGenerating ? (
                            <Zap className="h-4 w-4 animate-pulse" />
                          ) : (
                            <Bot className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingCategory(category)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteCategory(category.id)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
