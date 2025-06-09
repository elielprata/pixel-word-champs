
import { supabase } from '@/integrations/supabase/client';

// Função para chamar a OpenAI API com uma categoria
const callOpenAIAPI = async (categoryName: string, count: number, apiKey: string, config: any): Promise<string[]> => {
  console.log('🤖 Chamando OpenAI API com configurações:', {
    categoryName,
    count,
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  const prompt = `Gere ${count} palavras em português relacionadas à categoria "${categoryName}". 
  
Retorne apenas as palavras, uma por linha, em MAIÚSCULAS, sem numeração ou pontuação.
As palavras devem ser variadas em tamanho (3-8 letras) para diferentes níveis de dificuldade.

Exemplo:
GATO
CACHORRO
PEIXE
CAVALO
COELHO`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: config.systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: config.maxTokens || 300,
    temperature: config.temperature || 0.7,
  };

  console.log('📤 Enviando requisição para OpenAI:', {
    model: requestBody.model,
    systemPromptLength: config.systemPrompt?.length || 0,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  console.log('📥 Resposta da OpenAI:', response.status, response.statusText);

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro da OpenAI API:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  console.log('📊 Dados recebidos da OpenAI:', {
    choices: data.choices?.length || 0,
    hasContent: !!data.choices?.[0]?.message?.content
  });
  
  const content = data.choices[0].message.content;
  
  // Processar a resposta para extrair as palavras
  const words = content
    .split('\n')
    .map((word: string) => word.trim().toUpperCase())
    .filter((word: string) => word && word.length >= 3 && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/.test(word))
    .slice(0, count); // Garantir a quantidade solicitada

  console.log('✅ Palavras processadas:', {
    totalEncontradas: words.length,
    palavras: words.slice(0, 5) // Mostrar apenas as primeiras 5 para log
  });

  return words;
};

// Nova função para gerar palavras para todas as categorias em uma única requisição
const callOpenAIAPIForAllCategories = async (
  categories: Array<{ id: string; name: string }>, 
  count: number, 
  apiKey: string, 
  config: any
): Promise<Record<string, string[]>> => {
  console.log('🚀 Chamando OpenAI API para múltiplas categorias:', {
    totalCategories: categories.length,
    wordsPerCategory: count,
    hasKey: !!apiKey,
    model: config.model
  });

  // Montar o prompt com todas as categorias
  const categoriesList = categories.map(cat => `- ${cat.name}: ${count} palavras`).join('\n');
  
  const prompt = `Gere palavras em português para as seguintes categorias:

${categoriesList}

INSTRUÇÕES IMPORTANTES:
1. Gere exatamente ${count} palavras para cada categoria
2. Retorne apenas palavras em MAIÚSCULAS, sem acentos
3. Palavras devem ter entre 3-8 letras para diferentes níveis de dificuldade
4. Use o formato exato abaixo:

CATEGORIA: ${categories[0]?.name || 'exemplo'}
PALAVRA1
PALAVRA2
PALAVRA3

CATEGORIA: ${categories[1]?.name || 'exemplo2'}
PALAVRA1
PALAVRA2
PALAVRA3

Importante: Siga exatamente esse formato para cada categoria.`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: config.systemPrompt },
      { role: 'user', content: prompt }
    ],
    max_tokens: Math.max(config.maxTokens || 300, categories.length * count * 10), // Mais tokens para múltiplas categorias
    temperature: config.temperature || 0.7,
  };

  console.log('📤 Enviando requisição em lote para OpenAI:', {
    model: requestBody.model,
    maxTokens: requestBody.max_tokens,
    categoriesCount: categories.length
  });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Erro da OpenAI API em lote:', errorText);
    throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  
  console.log('📊 Resposta recebida da OpenAI (primeiros 200 chars):', content.slice(0, 200));
  
  // Processar a resposta para extrair palavras por categoria
  const result: Record<string, string[]> = {};
  const lines = content.split('\n');
  let currentCategory = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('CATEGORIA:')) {
      currentCategory = trimmedLine.replace('CATEGORIA:', '').trim().toLowerCase();
      if (!result[currentCategory]) {
        result[currentCategory] = [];
      }
    } else if (currentCategory && trimmedLine && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/.test(trimmedLine)) {
      if (result[currentCategory].length < count) {
        result[currentCategory].push(trimmedLine);
      }
    }
  }
  
  console.log('✅ Palavras processadas por categoria:', {
    categorias: Object.keys(result),
    totalPalavras: Object.values(result).reduce((sum, words) => sum + words.length, 0)
  });

  return result;
};

// Função principal para gerar palavras (mantém compatibilidade)
export const generateWordsForCategory = async (categoryName: string, count: number): Promise<string[]> => {
  try {
    console.log('🚀 Iniciando geração de palavras para categoria:', categoryName, 'quantidade:', count);
    
    const config = await getOpenAIConfig();
    const apiKey = config.apiKey;
    
    return await callOpenAIAPI(categoryName, count, apiKey, config);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras com OpenAI:', error);
    throw error;
  }
};

// Nova função principal para gerar palavras para todas as categorias
export const generateWordsForAllCategories = async (
  categories: Array<{ id: string; name: string }>, 
  count: number
): Promise<Record<string, string[]>> => {
  try {
    console.log('🚀 Iniciando geração em lote para categorias:', categories.map(c => c.name), 'quantidade por categoria:', count);
    
    const config = await getOpenAIConfig();
    const apiKey = config.apiKey;
    
    return await callOpenAIAPIForAllCategories(categories, count, apiKey, config);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras em lote com OpenAI:', error);
    throw error;
  }
};

// Função auxiliar para buscar configurações da OpenAI
async function getOpenAIConfig() {
  const { data: openaiSettings, error } = await supabase
    .from('game_settings')
    .select('setting_key, setting_value')
    .in('setting_key', [
      'openai_api_key', 
      'openai_system_prompt', 
      'openai_model', 
      'openai_max_tokens', 
      'openai_temperature'
    ])
    .eq('category', 'integrations');

  if (error) {
    console.error('❌ Erro ao buscar configurações:', error);
    throw new Error('Configurações da OpenAI não encontradas');
  }

  console.log('📋 Configurações encontradas:', openaiSettings?.length || 0);

  const apiKeySetting = openaiSettings?.find(s => s.setting_key === 'openai_api_key');
  const systemPromptSetting = openaiSettings?.find(s => s.setting_key === 'openai_system_prompt');
  const modelSetting = openaiSettings?.find(s => s.setting_key === 'openai_model');
  const maxTokensSetting = openaiSettings?.find(s => s.setting_key === 'openai_max_tokens');
  const temperatureSetting = openaiSettings?.find(s => s.setting_key === 'openai_temperature');

  if (!apiKeySetting?.setting_value || apiKeySetting.setting_value.trim().length === 0) {
    console.error('❌ API key da OpenAI não encontrada ou vazia');
    throw new Error('API key da OpenAI não configurada. Configure na aba Integrações.');
  }

  const config = {
    model: modelSetting?.setting_value || 'gpt-4o-mini',
    maxTokens: maxTokensSetting?.setting_value ? parseInt(maxTokensSetting.setting_value) : 300,
    temperature: temperatureSetting?.setting_value ? parseFloat(temperatureSetting.setting_value) : 0.7,
    systemPrompt: systemPromptSetting?.setting_value || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.',
    apiKey: apiKeySetting.setting_value.trim()
  };

  console.log('🔧 Configurações carregadas:', {
    hasApiKey: !!config.apiKey,
    keyLength: config.apiKey.length,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    systemPromptLength: config.systemPrompt.length
  });

  return config;
}
