import { supabase } from '@/integrations/supabase/client';

// Função para chamar a OpenAI API para uma única categoria
const callOpenAIAPI = async (categoryName: string, count: number, apiKey: string, config: any): Promise<string[]> => {
  console.log('🤖 Chamando OpenAI API para categoria:', categoryName, 'quantidade:', count);

  const prompt = `Gere ${count} palavras em português para a categoria "${categoryName}".

Retorne apenas as palavras, uma por linha, sem numeração ou formatação adicional.

REGRAS IMPORTANTES:
- Todas as palavras devem estar em MAIÚSCULAS
- Palavras variadas em tamanho (3-8 letras) para diferentes níveis de dificuldade
- Sem acentos, apenas letras A-Z
- Exatamente ${count} palavras
- Uma palavra por linha`;

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
    category: categoryName,
    count: count
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
  console.log('📊 Dados recebidos da OpenAI para', categoryName);
  
  const content = data.choices[0].message.content;
  
  // Processar as palavras retornadas
  const words = content
    .split('\n')
    .map((word: string) => word.trim().toUpperCase())
    .filter((word: string) => word && word.length >= 3 && /^[A-ZÁÀÂÃÉÈÊÍÏÓÔÕÖÚÇÑ]+$/.test(word))
    .slice(0, count);
  
  console.log(`✅ Categoria ${categoryName}: ${words.length} palavras processadas`);
  
  return words;
};

// Função para chamar a OpenAI API com múltiplas categorias
const callOpenAIAPIBatch = async (categories: Array<{id: string, name: string}>, countPerCategory: number, apiKey: string, config: any): Promise<Record<string, string[]>> => {
  console.log('🤖 Chamando OpenAI API em lote com configurações:', {
    categoriesCount: categories.length,
    countPerCategory,
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  const categoriesList = categories.map(cat => cat.name).join(', ');
  
  const prompt = `Gere ${countPerCategory} palavras em português para cada uma das seguintes categorias: ${categoriesList}

Retorne a resposta EXATAMENTE no formato JSON abaixo, sem texto adicional:

{
  "${categories[0]?.name || 'categoria1'}": ["PALAVRA1", "PALAVRA2", "PALAVRA3"],
  "${categories[1]?.name || 'categoria2'}": ["PALAVRA1", "PALAVRA2", "PALAVRA3"]
}

REGRAS OBRIGATÓRIAS:
- Todas as palavras devem estar em MAIÚSCULAS
- SEM ACENTOS - apenas letras A-Z (remover todos os acentos: Á, À, Â, Ã, É, È, Ê, Í, Ï, Ó, Ô, Õ, Ö, Ú, Ç, Ñ)
- Palavras variadas em tamanho (3-8 letras) para diferentes níveis de dificuldade
- Exatamente ${countPerCategory} palavras por categoria
- PALAVRAS ÚNICAS - não repetir palavras entre categorias ou dentro da mesma categoria
- Formato JSON válido
- Palavras válidas em português sem acentos`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: config.systemPrompt || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português. NUNCA use acentos nas palavras - converta todas para letras simples (A-Z). Garanta que todas as palavras sejam únicas e não repetidas.' 
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: config.maxTokens || 1000,
    temperature: config.temperature || 0.7,
  };

  console.log('📤 Enviando requisição em lote para OpenAI:', {
    model: requestBody.model,
    categoriesCount: categories.length,
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
  
  try {
    // Tentar parsear como JSON
    const jsonData = JSON.parse(content);
    
    // Processar e validar cada categoria
    const processedData: Record<string, string[]> = {};
    
    for (const category of categories) {
      const categoryWords = jsonData[category.name] || [];
      const validWords = categoryWords
        .map((word: string) => word.trim().toUpperCase())
        .filter((word: string) => word && word.length >= 3 && /^[A-Z]+$/.test(word))
        .slice(0, countPerCategory);
      
      processedData[category.name] = validWords;
      
      console.log(`✅ Categoria ${category.name}: ${validWords.length} palavras válidas`);
    }
    
    return processedData;
    
  } catch (parseError) {
    console.error('❌ Erro ao parsear JSON da OpenAI:', parseError);
    console.log('📄 Conteúdo recebido:', content);
    
    // Fallback: tentar extrair palavras do texto livre
    const fallbackData: Record<string, string[]> = {};
    
    for (const category of categories) {
      // Tentar encontrar palavras relacionadas à categoria no texto
      const words = content
        .split(/[\n\r\s,]+/)
        .map((word: string) => word.trim().toUpperCase())
        .filter((word: string) => word && word.length >= 3 && /^[A-Z]+$/.test(word))
        .slice(0, countPerCategory);
      
      fallbackData[category.name] = words;
    }
    
    return fallbackData;
  }
};

// Função para gerar palavras para uma única categoria (mantida para compatibilidade)
export const generateWordsForCategory = async (categoryName: string, count: number): Promise<string[]> => {
  console.log('🚀 Iniciando geração de palavras para categoria:', categoryName, 'quantidade:', count);
  
  // Buscar a API key e configurações da OpenAI
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
    systemPrompt: systemPromptSetting?.setting_value || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
  };

  const apiKey = apiKeySetting.setting_value.trim();
  
  console.log('🔧 Configurações carregadas:', {
    hasApiKey: !!apiKey,
    keyLength: apiKey.length,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature,
    systemPromptLength: config.systemPrompt.length
  });
  
  return await callOpenAIAPI(categoryName, count, apiKey, config);
};

// Nova função para gerar palavras para múltiplas categorias
export const generateWordsForCategories = async (categories: Array<{id: string, name: string}>, countPerCategory: number): Promise<Record<string, string[]>> => {
  try {
    console.log('🚀 Iniciando geração em lote para categorias:', categories.map(c => c.name), 'quantidade por categoria:', countPerCategory);
    
    // Buscar a API key e configurações da OpenAI
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
      maxTokens: maxTokensSetting?.setting_value ? parseInt(maxTokensSetting.setting_value) : 1000,
      temperature: temperatureSetting?.setting_value ? parseFloat(temperatureSetting.setting_value) : 0.7,
      systemPrompt: systemPromptSetting?.setting_value || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
    };

    const apiKey = apiKeySetting.setting_value.trim();
    
    console.log('🔧 Configurações carregadas para geração em lote:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey.length,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      systemPromptLength: config.systemPrompt.length
    });
    
    return await callOpenAIAPIBatch(categories, countPerCategory, apiKey, config);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras em lote com OpenAI:', error);
    throw error;
  }
};
