
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

// Função para determinar dificuldade baseada no tamanho da palavra
const getDifficultyFromLength = (length: number): string => {
  if (length === 3) return 'easy';
  if (length === 4) return 'medium';
  if (length === 5) return 'hard';
  if (length >= 8) return 'expert';
  return 'medium'; // fallback
};

// Simulação de geração de palavras por IA (será substituída por integração real)
const generateWordsForCategory = async (categoryName: string, level: number): Promise<string[]> => {
  // Esta é uma simulação - em produção seria uma chamada para a API da OpenAI
  const mockWords: Record<string, string[]> = {
    'animais': ['CAO', 'GATO', 'CAVALO', 'ELEFANTE', 'TARTARUGA'],
    'objetos': ['MESA', 'CADEIRA', 'TELEFONE', 'COMPUTADOR', 'TELEVISAO'],
    'cores': ['AZUL', 'VERDE', 'AMARELO', 'VERMELHO', 'LARANJA'],
    'profissões': ['MEDICO', 'PROFESSOR', 'ENGENHEIRO', 'ADVOGADO', 'DENTISTA'],
    'alimentos': ['PANE', 'ARROZ', 'FEIJAO', 'MACARRAO', 'CHOCOLATE'],
    'esportes': ['FUTEBOL', 'BASQUETE', 'VOLEIBOL', 'NATACAO', 'ATLETISMO'],
    'países': ['BRASIL', 'ARGENTINA', 'PORTUGAL', 'ALEMANHA', 'AUSTRALIA'],
    'cidades': ['PARIS', 'LONDRES', 'TOQUIO', 'NOVAIORQUE', 'BARCELONA']
  };

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 2000));

  const categoryWords = mockWords[categoryName] || ['PALAVRA', 'EXEMPLO', 'TESTE'];
  
  // Filtrar palavras por nível (baseado no comprimento)
  const filteredWords = categoryWords.filter(word => {
    const difficulty = getDifficultyFromLength(word.length);
    if (level <= 5) return difficulty === 'easy' || difficulty === 'medium';
    if (level <= 10) return difficulty === 'medium' || difficulty === 'hard';
    return true; // níveis altos podem ter qualquer dificuldade
  });

  return filteredWords.slice(0, 5); // Retornar até 5 palavras
};

export const useAIWordGeneration = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateWords = useMutation({
    mutationFn: async ({ categoryId, categoryName, level }: { 
      categoryId: string; 
      categoryName: string; 
      level: number;
    }) => {
      console.log('🤖 Gerando palavras por IA para categoria:', categoryName, 'nível:', level);

      // Gerar palavras usando IA (simulado)
      const generatedWords = await generateWordsForCategory(categoryName, level);
      
      console.log('📝 Palavras geradas:', generatedWords);

      // Salvar palavras no banco
      const wordsToInsert = generatedWords.map(word => ({
        word: word.toUpperCase(),
        level,
        category: categoryName,
        difficulty: getDifficultyFromLength(word.length),
        is_active: true
      }));

      const { data: insertedWords, error: insertError } = await supabase
        .from('level_words')
        .insert(wordsToInsert)
        .select();

      if (insertError) {
        console.error('❌ Erro ao salvar palavras:', insertError);
        throw insertError;
      }

      // Registrar a geração na tabela de controle
      const { error: logError } = await supabase
        .from('ai_word_generation')
        .insert({
          category_id: categoryId,
          level,
          words_generated: generatedWords.length,
          last_generation: new Date().toISOString()
        });

      if (logError) {
        console.error('❌ Erro ao registrar geração:', logError);
      }

      console.log('✅ Palavras salvas com sucesso:', insertedWords?.length);
      return { words: insertedWords, count: generatedWords.length };
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
        description: "Erro ao gerar palavras",
        variant: "destructive",
      });
    },
  });

  return {
    generateWords: generateWords.mutate,
    isGenerating: generateWords.isPending,
  };
};
