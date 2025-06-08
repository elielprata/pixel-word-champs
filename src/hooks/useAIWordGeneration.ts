
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
const callOpenAIAPI = async (categoryName: string, count: number, apiKey: string): Promise<string[]> => {
  const prompt = `Gere ${count} palavras em português relacionadas à categoria "${categoryName}". 
  
Retorne apenas as palavras, uma por linha, em MAIÚSCULAS, sem numeração ou pontuação.
As palavras devem ser variadas em tamanho (3-8 letras) para diferentes níveis de dificuldade.

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
      max_tokens: 300,
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
    .slice(0, count); // Garantir a quantidade solicitada

  return words;
};

// Simulação de geração de palavras (fallback quando não há API key)
const generateMockWords = async (categoryName: string, count: number): Promise<string[]> => {
  const mockWords: Record<string, string[]> = {
    'animais': ['CAO', 'GATO', 'CAVALO', 'ELEFANTE', 'TARTARUGA', 'PEIXE', 'COELHO', 'PASSARO', 'RATO', 'TIGRE'],
    'objetos': ['MESA', 'CADEIRA', 'TELEFONE', 'COMPUTADOR', 'TELEVISAO', 'LIVRO', 'CANETA', 'RELOGIO', 'ESPELHO', 'QUADRO'],
    'cores': ['AZUL', 'VERDE', 'AMARELO', 'VERMELHO', 'LARANJA', 'ROSA', 'ROXO', 'PRETO', 'BRANCO', 'CINZA'],
    'profissões': ['MEDICO', 'PROFESSOR', 'ENGENHEIRO', 'ADVOGADO', 'DENTISTA', 'CHEF', 'PINTOR', 'MUSICO', 'JORNALISTA', 'PILOTO'],
    'alimentos': ['PANE', 'ARROZ', 'FEIJAO', 'MACARRAO', 'CHOCOLATE', 'PIZZA', 'SALADA', 'FRUTA', 'LEITE', 'QUEIJO'],
    'esportes': ['FUTEBOL', 'BASQUETE', 'VOLEIBOL', 'NATACAO', 'ATLETISMO', 'TENIS', 'BOXE', 'CICLISMO', 'CORRIDA', 'GINASTICA'],
    'países': ['BRASIL', 'ARGENTINA', 'PORTUGAL', 'ALEMANHA', 'AUSTRALIA', 'FRANCA', 'ITALIA', 'ESPANHA', 'JAPAO', 'CHINA'],
    'cidades': ['PARIS', 'LONDRES', 'TOQUIO', 'NOVAIORQUE', 'BARCELONA', 'ROMA', 'MADRI', 'BERLIM', 'SIDNEY', 'LISBOA']
  };

  // Simular delay da API
  await new Promise(resolve => setTimeout(resolve, 1000));

  const categoryWords = mockWords[categoryName] || ['PALAVRA', 'EXEMPLO', 'TESTE', 'MOCK', 'SIMULACAO'];
  
  // Embaralhar e retornar a quantidade solicitada
  const shuffled = [...categoryWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

// Função principal para gerar palavras
const generateWordsForCategory = async (categoryName: string, count: number): Promise<string[]> => {
  try {
    // Buscar a API key da OpenAI nas configurações
    const { data: openaiConfig, error } = await supabase
      .from('game_settings')
      .select('setting_value')
      .eq('setting_key', 'openai_api_key')
      .single();

    if (error || !openaiConfig?.setting_value) {
      console.log('🤖 OpenAI API key não encontrada, usando dados mock');
      return generateMockWords(categoryName, count);
    }

    const apiKey = openaiConfig.setting_value;
    console.log('🤖 Usando OpenAI API para gerar palavras');
    
    return await callOpenAIAPI(categoryName, count, apiKey);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras com OpenAI:', error);
    console.log('🔄 Fallback para dados mock');
    return generateMockWords(categoryName, count);
  }
};

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
      
      console.log('📝 Palavras geradas:', generatedWords);

      // Salvar palavras no banco
      const wordsToInsert = generatedWords.map(word => ({
        word: word.toUpperCase(),
        level: 1, // Nível padrão, será determinado pela dificuldade automática
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
          level: 1,
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
