
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WordCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useWordCategories = () => {
  const [categories, setCategories] = useState<WordCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('word_categories')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;

      // Type-safe filtering and mapping
      const validCategories = (data || [])
        .filter((item): item is any => item && typeof item === 'object' && !('error' in item))
        .map((item): WordCategory => ({
          id: item.id,
          name: item.name,
          description: item.description,
          is_active: item.is_active,
          created_at: item.created_at,
          updated_at: item.updated_at
        }));

      setCategories(validCategories);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as categorias.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createCategory = async (name: string, description?: string) => {
    try {
      const { data, error } = await supabase
        .from('word_categories')
        .insert([{
          name,
          description,
          is_active: true
        }])
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object' && !('error' in data)) {
        const newCategory: WordCategory = {
          id: data.id,
          name: data.name,
          description: data.description,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        setCategories(prev => [...prev, newCategory]);
        
        toast({
          title: "Sucesso",
          description: "Categoria criada com sucesso.",
        });

        return newCategory;
      }

      throw new Error('Failed to create category');
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateCategory = async (id: string, updates: Partial<WordCategory>) => {
    try {
      const { data, error } = await supabase
        .from('word_categories')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      if (data && typeof data === 'object' && !('error' in data)) {
        const updatedCategory: WordCategory = {
          id: data.id,
          name: data.name,
          description: data.description,
          is_active: data.is_active,
          created_at: data.created_at,
          updated_at: data.updated_at
        };

        setCategories(prev => 
          prev.map(cat => cat.id === id ? updatedCategory : cat)
        );

        toast({
          title: "Sucesso",
          description: "Categoria atualizada com sucesso.",
        });

        return updatedCategory;
      }

      throw new Error('Failed to update category');
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from('word_categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCategories(prev => prev.filter(cat => cat.id !== id));
      
      toast({
        title: "Sucesso",
        description: "Categoria removida com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao remover categoria:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover a categoria.",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    isLoading,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: loadCategories
  };
};
