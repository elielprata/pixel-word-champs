
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface LevelWord {
  id: string;
  word: string;
  level: number;
  category: string | null;
  difficulty: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface WordsQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  difficulty?: string;
  level?: number;
}

export const useLevelWords = (options: WordsQueryOptions = {}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { page = 1, limit = 50, search, category, difficulty, level } = options;

  const { data: wordsData, isLoading, error } = useQuery({
    queryKey: ['levelWords', { page, limit, search, category, difficulty, level }],
    queryFn: async () => {
      console.log('🔍 Buscando palavras do banco:', { page, limit, search, category, difficulty, level });
      
      let query = supabase
        .from('level_words')
        .select('*', { count: 'exact' })
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      // Aplicar filtros
      if (search) {
        query = query.ilike('word', `%${search}%`);
      }

      if (category) {
        query = query.eq('category', category);
      }

      if (difficulty) {
        query = query.eq('difficulty', difficulty);
      }

      if (level) {
        query = query.eq('level', level);
      }

      // Aplicar paginação
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ Erro ao buscar palavras:', error);
        throw error;
      }

      console.log('📋 Palavras encontradas:', data?.length, 'Total:', count);
      
      return {
        words: data || [],
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
        currentPage: page,
        hasNextPage: page * limit < (count || 0),
        hasPreviousPage: page > 1
      };
    },
  });

  const deleteWord = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('level_words')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Palavra removida com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['levelWords'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao remover palavra",
        variant: "destructive",
      });
      console.error('❌ Erro ao remover palavra:', error);
    },
  });

  const updateWord = useMutation({
    mutationFn: async ({ id, word, category, difficulty }: { 
      id: string; 
      word: string; 
      category?: string; 
      difficulty?: string; 
    }) => {
      const { error } = await supabase
        .from('level_words')
        .update({ 
          word: word.toUpperCase(),
          category,
          difficulty,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Palavra atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['levelWords'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar palavra",
        variant: "destructive",
      });
      console.error('❌ Erro ao atualizar palavra:', error);
    },
  });

  return {
    wordsData,
    isLoading,
    error,
    deleteWord: deleteWord.mutate,
    updateWord: updateWord.mutate,
    isDeleting: deleteWord.isPending,
    isUpdating: updateWord.isPending,
  };
};

export type { LevelWord };
