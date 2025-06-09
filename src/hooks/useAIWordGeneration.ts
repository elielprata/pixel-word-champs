
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";
import { generateWordsForCategory, generateWordsForAllCategories } from '@/services/aiWordGenerator';
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

  const generateWordsForAllCategoriesMutation = useMutation({
    mutationFn: async ({ categories, count }: { 
      categories: Array<{ id: string; name: string }>; 
      count: number;
    }) => {
      console.log('🚀 Iniciando geração em lote para todas as categorias:', {
        totalCategories: categories.length,
        wordsPerCategory: count
      });

      try {
        // Gerar palavras para todas as categorias em uma única requisição
        const allGeneratedWords = await generateWordsForAllCategories(categories, count);
        
        if (!allGeneratedWords || Object.keys(allGeneratedWords).length === 0) {
          throw new Error('Nenhuma palavra foi gerada pela IA');
        }
        
        console.log('✅ Palavras geradas para categorias:', Object.keys(allGeneratedWords).length);
        
        // Salvar palavras no banco para cada categoria
        const results = [];
        let totalSaved = 0;
        
        for (const [categoryName, words] of Object.entries(allGeneratedWords)) {
          const category = categories.find(c => c.name === categoryName);
          if (category && words.length > 0) {
            const result = await saveWordsToDatabase(words, category.id, categoryName);
            results.push(result);
            totalSaved += result.count;
            console.log(`💾 Salvas ${result.count} palavras para categoria: ${categoryName}`);
          }
        }
        
        return {
          totalWords: totalSaved,
          categoriesProcessed: results.length,
          results
        };
      } catch (error) {
        console.error('❌ Erro na geração em lote:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Geração em lote concluída:', data);
      toast({
        title: "Sucesso!",
        description: `${data.totalWords} palavras geradas para ${data.categoriesProcessed} categorias`,
      });
      queryClient.invalidateQueries({ queryKey: ['levelWords'] });
      queryClient.invalidateQueries({ queryKey: ['wordCategories'] });
      queryClient.invalidateQueries({ queryKey: ['activeWords'] });
    },
    onError: (error: any) => {
      console.error('❌ Erro na geração em lote:', error);
      
      let errorMessage = "Erro ao gerar palavras em lote";
      
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
    generateWordsForAllCategories: generateWordsForAllCategoriesMutation.mutate,
    isGeneratingAll: generateWordsForAllCategoriesMutation.isPending,
  };
};
