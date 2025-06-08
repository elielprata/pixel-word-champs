
import { supabase } from '@/integrations/supabase/client';

// Função para chamar a OpenAI API
const callOpenAIAPI = async (categoryName: string, count: number, apiKey: string, systemPrompt: string): Promise<string[]> => {
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
        { role: 'system', content: systemPrompt },
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

// Função principal para gerar palavras
export const generateWordsForCategory = async (categoryName: string, count: number): Promise<string[]> => {
  try {
    // Buscar a API key e configurações da OpenAI
    const { data: openaiSettings, error } = await supabase
      .from('game_settings')
      .select('setting_key, setting_value')
      .in('setting_key', ['openai_api_key', 'openai_system_prompt'])
      .eq('category', 'integrations');

    if (error) {
      console.error('❌ Erro ao buscar configurações:', error);
      throw new Error('Configurações da OpenAI não encontradas');
    }

    const apiKeySetting = openaiSettings?.find(s => s.setting_key === 'openai_api_key');
    const systemPromptSetting = openaiSettings?.find(s => s.setting_key === 'openai_system_prompt');

    if (!apiKeySetting?.setting_value) {
      throw new Error('API key da OpenAI não configurada');
    }

    const apiKey = apiKeySetting.setting_value;
    const systemPrompt = systemPromptSetting?.setting_value || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.';
    
    console.log('🤖 Usando OpenAI API para gerar palavras');
    
    return await callOpenAIAPI(categoryName, count, apiKey, systemPrompt);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras com OpenAI:', error);
    throw error;
  }
};
