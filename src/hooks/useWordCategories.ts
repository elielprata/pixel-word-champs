import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface WordCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWordCategories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['wordCategories'],
    queryFn: async (): Promise<WordCategory[]> => {
      console.log('🔍 Buscando categorias de palavras...');
      
      const { data, error } = await supabase
        .from('word_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) {
        console.error('❌ Erro ao buscar categorias:', error);
        throw error;
      }

      console.log('📋 Categorias encontradas:', data?.length);
      return data || [];
    },
  });

  const createCategory = useMutation({
    mutationFn: async ({ name, description }: { name: string; description?: string }) => {
      const normalizedName = name.toLowerCase().trim();
      
      // Verificar se já existe uma categoria com esse nome
      const { data: existingCategory } = await supabase
        .from('word_categories')
        .select('id, name')
        .eq('name', normalizedName)
        .eq('is_active', true)
        .single();

      if (existingCategory) {
        throw new Error(`Já existe uma categoria com o nome "${name}"`);
      }

      const { data, error } = await supabase
        .from('word_categories')
        .insert({
          name: normalizedName,
          description: description || null
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Categoria criada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['wordCategories'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro ao criar categoria:', error);
      
      let errorMessage = "Erro ao criar categoria";
      
      if (error.message && error.message.includes('Já existe uma categoria')) {
        errorMessage = error.message;
      } else if (error.code === '23505') {
        errorMessage = "Já existe uma categoria com este nome";
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const updateCategory = useMutation({
    mutationFn: async ({ id, name, description }: { id: string; name: string; description?: string }) => {
      const { data, error } = await supabase
        .from('word_categories')
        .update({
          name: name.toLowerCase(),
          description: description || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Categoria atualizada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['wordCategories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar categoria",
        variant: "destructive",
      });
      console.error('❌ Erro ao atualizar categoria:', error);
    },
  });

  const deleteCategory = useMutation({
    mutationFn: async ({ id, password }: { id: string; password: string }) => {
      // Aqui você pode adicionar validação da senha se necessário
      // Por exemplo, verificar se a senha está correta antes de prosseguir
      
      const { error } = await supabase
        .from('word_categories')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Categoria removida com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['wordCategories'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao remover categoria",
        variant: "destructive",
      });
      console.error('❌ Erro ao remover categoria:', error);
    },
  });

  return {
    categories,
    isLoading,
    createCategory: createCategory.mutate,
    updateCategory: updateCategory.mutate,
    deleteCategory: (id: string, password: string) => deleteCategory.mutate({ id, password }),
    isCreating: createCategory.isPending,
    isUpdating: updateCategory.isPending,
    isDeleting: deleteCategory.isPending,
  };
};

export type { WordCategory };
