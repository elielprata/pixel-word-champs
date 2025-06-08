
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

// Função para chamar a OpenAI API
const callOpenAIAPI = async (categoryName: string, level: number, apiKey: string): Promise<string[]> => {
  const prompt = `Gere 5 palavras em português relacionadas à categoria "${categoryName}" adequadas para o nível ${level} de dificuldade. 
  
Critérios de dificuldade:
- Nível 1-5: palavras de 3-4 letras (fácil/médio)
- Nível 6-10: palavras de 4-5 letras (médio/difícil)  
- Nível 11+: palavras de 5-8+ letras (difícil/expert)

Retorne apenas as palavras, uma por linha, em MAIÚSCULAS, sem numeração ou pontuação.
Exemplo:
GATO
CACHORRO
PEIXE
CAVALO
COELHO`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.' },
        { role: 'user', content: prompt }
      ],
      max_tokens: 150,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  // Processar a resposta para extrair as palavras
  const words = content
    .split('\n')
    .map((word: string) => word.trim().toUpperCase())
    .filter((word: string) => word && word.length >= 3 && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/.test(word))
    .slice(0, 5); // Garantir máximo de 5 palavras

  return words;
};

// Simulação de geração de palavras (fallback quando não há API key)
const generateMockWords = async (categoryName: string, level: number): Promise<string[]> => {
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

// Função principal para gerar palavras
const generateWordsForCategory = async (categoryName: string, level: number): Promise<string[]> => {
  try {
    // Buscar a API key da OpenAI nas configurações
    const { data: openaiConfig, error } = await supabase
      .from('game_settings')
      .select('setting_value')
      .eq('setting_key', 'openai_api_key')
      .single();

    if (error || !openaiConfig?.setting_value) {
      console.log('🤖 OpenAI API key não encontrada, usando dados mock');
      return generateMockWords(categoryName, level);
    }

    const apiKey = openaiConfig.setting_value;
    console.log('🤖 Usando OpenAI API para gerar palavras');
    
    return await callOpenAIAPI(categoryName, level, apiKey);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras com OpenAI:', error);
    console.log('🔄 Fallback para dados mock');
    return generateMockWords(categoryName, level);
  }
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

      // Gerar palavras usando IA (OpenAI ou mock)
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
