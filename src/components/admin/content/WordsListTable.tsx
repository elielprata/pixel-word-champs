
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { WordsListHeader } from './WordsListHeader';
import { WordsListEmpty } from './WordsListEmpty';

interface Word {
  id: string;
  word: string;
  category: string;
  difficulty: string;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
}

export const WordsListTable = () => {
  const [words, setWords] = useState<Word[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredWords, setFilteredWords] = useState<Word[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const { toast } = useToast();

  const loadWords = async () => {
    setIsLoading(true);
    try {
      console.log('📝 Carregando palavras ativas...');
      
      const { data, error } = await supabase
        .from('level_words')
        .select('id, word, category, difficulty, created_at')
        .eq('is_active', true as any)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao carregar palavras:', error);
        throw error;
      }

      // Transformar dados com validação
      const formattedWords = (data || [])
        .filter((item: any) => item && typeof item === 'object' && !('error' in item))
        .map((item: any) => ({
          id: item?.id || '',
          word: item?.word || '',
          category: item?.category || 'Sem categoria',
          difficulty: item?.difficulty || 'medium',
          created_at: item?.created_at || new Date().toISOString()
        }))
        .filter(word => word.word && word.id);

      setWords(formattedWords);
      console.log('✅ Palavras carregadas:', formattedWords.length);
    } catch (error: any) {
      console.error('❌ Erro ao carregar palavras:', error);
      toast({
        title: "Erro ao carregar palavras",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('📂 Carregando categorias...');
      
      const { data, error } = await supabase
        .from('word_categories')
        .select('id, name')
        .eq('is_active', true as any)
        .order('name');

      if (error) {
        console.error('❌ Erro ao carregar categorias:', error);
        throw error;
      }

      const formattedCategories = (data || [])
        .filter((item: any) => item && typeof item === 'object' && !('error' in item))
        .map((item: any) => ({
          id: item?.id || '',
          name: item?.name || ''
        }))
        .filter(cat => cat.name && cat.id);

      setCategories(formattedCategories);
      console.log('✅ Categorias carregadas:', formattedCategories.length);
    } catch (error: any) {
      console.error('❌ Erro ao carregar categorias:', error);
    }
  };

  useEffect(() => {
    loadWords();
    loadCategories();
  }, []);

  // Filtrar palavras
  useEffect(() => {
    let filtered = words;

    if (searchTerm) {
      filtered = filtered.filter(word => 
        word.word.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(word => 
        word.category === selectedCategory
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(word => 
        word.difficulty === selectedDifficulty
      );
    }

    setFilteredWords(filtered);
  }, [words, searchTerm, selectedCategory, selectedDifficulty]);

  const deleteAllWords = async () => {
    if (!confirm('Tem certeza que deseja excluir TODAS as palavras ativas? Esta ação não pode ser desfeita!')) {
      return;
    }

    setIsDeletingAll(true);
    try {
      console.log('🗑️ Excluindo todas as palavras ativas...');
      
      const { error } = await supabase
        .from('level_words')
        .delete()
        .eq('is_active', true as any);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Todas as palavras foram excluídas",
      });

      setWords([]);
      setFilteredWords([]);
      console.log('✅ Todas as palavras excluídas');
    } catch (error: any) {
      console.error('❌ Erro ao excluir palavras:', error);
      toast({
        title: "Erro ao excluir palavras",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeletingAll(false);
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", color: string }> = {
      'easy': { variant: 'outline', color: 'text-green-600' },
      'medium': { variant: 'secondary', color: 'text-yellow-600' },
      'hard': { variant: 'default', color: 'text-orange-600' },
      'expert': { variant: 'destructive', color: 'text-red-600' }
    };
    
    const config = variants[difficulty] || variants.medium;
    return (
      <Badge variant={config.variant} className={config.color}>
        {difficulty}
      </Badge>
    );
  };

  const hasFilters = searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all';

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-purple-600 border-t-transparent"></div>
            <span className="ml-2">Carregando palavras...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <WordsListHeader
        filteredWordsLength={filteredWords.length}
        totalWordsLength={words.length}
        categoriesLength={categories.length}
        onRefresh={loadWords}
        onDeleteAll={deleteAllWords}
        isDeletingAll={isDeletingAll}
        hasWords={words.length > 0}
      />

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Filter className="h-5 w-5" />
            Filtros
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Buscar palavra</label>
              <Input
                placeholder="Digite para buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Categoria</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Dificuldade</label>
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma dificuldade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as dificuldades</SelectItem>
                  <SelectItem value="easy">Fácil</SelectItem>
                  <SelectItem value="medium">Médio</SelectItem>
                  <SelectItem value="hard">Difícil</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de palavras */}
      <Card>
        <CardContent className="p-6">
          {filteredWords.length === 0 ? (
            <WordsListEmpty hasFilters={hasFilters} />
          ) : (
            <div className="grid gap-3">
              {filteredWords.map((word) => (
                <div key={word.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{word.word}</span>
                    <Badge variant="outline">{word.category}</Badge>
                    {getDifficultyBadge(word.difficulty)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(word.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
