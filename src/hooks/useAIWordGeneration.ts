
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
      console.log('🤖 Iniciando geração de palavras por IA:', {
        categoryId,
        categoryName,
        count
      });

      try {
        // Gerar palavras usando IA (OpenAI)
        const generatedWords = await generateWordsForCategory(categoryName, count);
        
        if (!generatedWords || generatedWords.length === 0) {
          throw new Error('Nenhuma palavra foi gerada pela IA');
        }
        
        console.log('✅ Palavras geradas pela IA:', generatedWords.length);
        
        // Salvar palavras no banco
        const result = await saveWordsToDatabase(generatedWords, categoryId, categoryName);
        
        console.log('💾 Palavras salvas no banco:', result.count);
        
        return result;
      } catch (error) {
        console.error('❌ Erro na geração de palavras:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Geração de palavras concluída com sucesso:', data.count);
      toast({
        title: "Sucesso!",
        description: `${data.count} palavras geradas e salvas com sucesso`,
      });
      queryClient.invalidateQueries({ queryKey: ['levelWords'] });
      queryClient.invalidateQueries({ queryKey: ['wordCategories'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na geração:', error);
      
      let errorMessage = "Erro ao gerar palavras";
      
      if (error.message.includes('API key')) {
        errorMessage = "API key da OpenAI não configurada. Verifique na aba Integrações.";
      } else if (error.message.includes('API error')) {
        errorMessage = "Erro na API da OpenAI. Verifique se a chave está correta.";
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  return {
    generateWords: generateWords.mutate,
    isGenerating: generateWords.isPending,
  };
};
