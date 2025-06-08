
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { generateWordsForCategory } from '@/services/aiWordGenerator';
import { saveWordsToDatabase } from '@/services/wordStorageService';

export const useAIWordGeneration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateWords = useMutation({
    mutationFn: async ({ categoryId, categoryName, count }: { 
      categoryId: string; 
      categoryName: string; 
      count: number;
    }) => {
      console.log('🤖 Gerando palavras por IA para categoria:', categoryName, 'quantidade:', count);

      // Gerar palavras usando IA (OpenAI ou mock)
      const generatedWords = await generateWordsForCategory(categoryName, count);
      
      // Salvar palavras no banco
      return await saveWordsToDatabase(generatedWords, categoryId, categoryName);
    },
    onSuccess: (data) => {
      toast({
        title: "Sucesso!",
        description: `${data.count} palavras geradas e salvas com sucesso`,
      });
      queryClient.invalidateQueries({ queryKey: ['levelWords'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na geração:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar palavras. Verifique se a API key da OpenAI está configurada.",
        variant: "destructive",
      });
    },
  });

  return {
    generateWords: generateWords.mutate,
    isGenerating: generateWords.isPending,
  };
};
