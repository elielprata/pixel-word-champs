
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

export const useActiveWords = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: words, isLoading, error, refetch } = useQuery({
    queryKey: ['activeWords'],
    queryFn: async () => {
      console.log('🔍 Buscando palavras ativas...');
      
      const { data, error } = await supabase
        .from('level_words')
        .select('id, word, category, difficulty, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Erro ao buscar palavras:', error);
        throw error;
      }

      console.log('📝 Palavras ativas encontradas:', data?.length, data);
      return data || [];
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const deleteAllWords = useMutation({
    mutationFn: async ({ password }: { password: string }) => {
      // Aqui você pode adicionar validação da senha se necessário
      // Por exemplo, verificar se a senha está correta antes de prosseguir
      
      console.log('🗑️ Excluindo todas as palavras ativas permanentemente...');
      
      const { error } = await supabase
        .from('level_words')
        .delete()
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erro ao excluir palavras:', error);
        throw error;
      }
      
      console.log('✅ Todas as palavras ativas foram excluídas permanentemente');
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Todas as palavras foram excluídas permanentemente",
      });
      queryClient.invalidateQueries({ queryKey: ['activeWords'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: "Erro ao excluir palavras",
        variant: "destructive",
      });
      console.error('❌ Erro ao excluir palavras:', error);
    },
  });

  return {
    words: words || [],
    isLoading,
    error,
    refetch,
    deleteAllWords: (password: string) => deleteAllWords.mutate({ password }),
    isDeletingAll: deleteAllWords.isPending,
  };
};
