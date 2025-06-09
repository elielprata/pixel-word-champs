
import { supabase } from '@/integrations/supabase/client';

// Função para remover acentos de uma palavra
const removeAccents = (word: string): string => {
  return word
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacríticos
    .replace(/[ÁÀÂÃÄ]/g, 'A')
    .replace(/[ÉÈÊË]/g, 'E')
    .replace(/[ÍÌÎÏ]/g, 'I')
    .replace(/[ÓÒÔÕÖ]/g, 'O')
    .replace(/[ÚÙÛÜ]/g, 'U')
    .replace(/[Ç]/g, 'C')
    .replace(/[Ñ]/g, 'N')
    .replace(/[áàâãä]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[íìîï]/g, 'i')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[úùûü]/g, 'u')
    .replace(/[ç]/g, 'c')
    .replace(/[ñ]/g, 'n');
};

// Função para validar se uma palavra está no formato correto (sem acentos)
const isValidWord = (word: string): boolean => {
  const trimmed = word.trim().toUpperCase();
  return trimmed.length >= 3 && /^[A-Z]+$/.test(trimmed);
};

// Função para chamar a OpenAI API para uma única categoria
const callOpenAIAPI = async (categoryName: string, count: number, apiKey: string, config: any): Promise<string[]> => {
  console.log('🤖 Chamando OpenAI API para categoria:', categoryName, 'quantidade:', count);

  const prompt = `Gere ${count} palavras em português para a categoria "${categoryName}".

REGRAS OBRIGATÓRIAS:
- TODAS as palavras devem estar em MAIÚSCULAS
- NENHUMA palavra pode ter acentos (á, à, â, ã, é, è, ê, í, ì, î, ó, ò, ô, õ, ú, ù, û, ç, ñ)
- Apenas letras de A a Z (sem acentos, cedilhas ou til)
- Palavras de 3-8 letras para diferentes níveis de dificuldade
- Exatamente ${count} palavras
- Uma palavra por linha
- Sem numeração ou formatação adicional

Exemplos de palavras CORRETAS: CASA, ARVORE, PEIXE, LIVRO
Exemplos de palavras INCORRETAS: ÁRVORE, CORAÇÃO, PÁSSARO (têm acentos)

Retorne apenas as palavras, uma por linha:`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: config.systemPrompt || 'Você são um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
      },
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
  
  // Processar as palavras retornadas com remoção rigorosa de acentos
  const words = content
    .split('\n')
    .map((word: string) => {
      const cleaned = removeAccents(word.trim()).toUpperCase();
      return cleaned;
    })
    .filter((word: string) => isValidWord(word))
    .slice(0, count);
  
  console.log(`✅ Categoria ${categoryName}: ${words.length} palavras processadas (sem acentos)`);
  console.log('🔍 Palavras geradas:', words);
  
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
  
  const prompt = `Gere EXATAMENTE ${countPerCategory} palavras em português para CADA UMA das seguintes categorias: ${categoriesList}

REGRAS OBRIGATÓRIAS:
- EXATAMENTE ${countPerCategory} palavras para CADA categoria
- TODAS as palavras devem estar em MAIÚSCULAS
- NENHUMA palavra pode ter acentos (á, à, â, ã, é, è, ê, í, ì, î, ó, ò, ô, õ, ú, ù, û, ç, ñ)
- Apenas letras de A a Z (sem acentos, cedilhas ou til)
- Palavras de 3-8 letras para diferentes níveis de dificuldade
- PALAVRAS ÚNICAS - não repetir palavras entre categorias ou dentro da mesma categoria
- Formato JSON válido

Exemplos de palavras CORRETAS: CASA, ARVORE, PEIXE, LIVRO, CACHORRO
Exemplos de palavras INCORRETAS: ÁRVORE, CORAÇÃO, PÁSSARO (têm acentos)

Retorne EXATAMENTE no formato JSON abaixo, sem texto adicional:

{
${categories.map(cat => `  "${cat.name}": ["PALAVRA1", "PALAVRA2", "PALAVRA3"${countPerCategory > 3 ? ', ...]' : ']'}`).join(',\n')}
}

Total esperado: ${categories.length} categorias × ${countPerCategory} palavras = ${categories.length * countPerCategory} palavras SEM ACENTOS`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: config.systemPrompt || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: config.maxTokens || 2500,
    temperature: config.temperature || 0.7,
  };

  console.log('📤 Enviando requisição em lote para OpenAI:', {
    model: requestBody.model,
    categoriesCount: categories.length,
    expectedWords: categories.length * countPerCategory,
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
  console.log('📄 Conteúdo completo recebido:', content);
  
  try {
    // Tentar parsear como JSON
    const jsonData = JSON.parse(content);
    console.log('✅ JSON parseado com sucesso:', jsonData);
    
    // Processar e validar cada categoria com remoção rigorosa de acentos
    const processedData: Record<string, string[]> = {};
    let totalWordsProcessed = 0;
    
    for (const category of categories) {
      const categoryWords = jsonData[category.name] || [];
      console.log(`🔍 Categoria ${category.name}: recebeu ${categoryWords.length} palavras`, categoryWords);
      
      const validWords = categoryWords
        .map((word: string) => {
          // Remover acentos de forma mais rigorosa
          const cleaned = removeAccents(word.trim()).toUpperCase();
          return cleaned;
        })
        .filter((word: string) => isValidWord(word))
        .slice(0, countPerCategory);
      
      processedData[category.name] = validWords;
      totalWordsProcessed += validWords.length;
      
      console.log(`✅ Categoria ${category.name}: ${validWords.length}/${countPerCategory} palavras válidas processadas (sem acentos)`);
      console.log('🔍 Palavras da categoria:', validWords);
      
      // Aviso se não conseguiu o número exato
      if (validWords.length < countPerCategory) {
        console.warn(`⚠️ Categoria ${category.name}: esperado ${countPerCategory}, processado ${validWords.length}`);
      }
    }
    
    console.log(`📊 RESUMO FINAL: ${totalWordsProcessed}/${categories.length * countPerCategory} palavras processadas (sem acentos)`);
    return processedData;
    
  } catch (parseError) {
    console.error('❌ Erro ao parsear JSON da OpenAI:', parseError);
    console.log('📄 Conteúdo recebido que falhou no parse:', content);
    
    // Fallback mais inteligente: tentar extrair palavras do texto livre
    console.log('🔄 Tentando fallback de extração de palavras...');
    const fallbackData: Record<string, string[]> = {};
    
    // Tentar encontrar padrões de categoria no texto
    for (const category of categories) {
      const categoryPattern = new RegExp(`"?${category.name}"?\\s*[:\\[]([^\\]\\}]+)`, 'i');
      const match = content.match(categoryPattern);
      
      let words: string[] = [];
      if (match) {
        // Extrair palavras do match
        words = match[1]
          .split(/[,\n\r"'\[\]]+/)
          .map((word: string) => removeAccents(word.trim()).toUpperCase())
          .filter((word: string) => isValidWord(word))
          .slice(0, countPerCategory);
      }
      
      // Se não encontrou palavras suficientes, tentar extrair do texto geral
      if (words.length < countPerCategory) {
        const allWords = content
          .split(/[\n\r\s,]+/)
          .map((word: string) => removeAccents(word.trim()).toUpperCase())
          .filter((word: string) => isValidWord(word))
          .slice(words.length, countPerCategory);
        
        words = [...words, ...allWords].slice(0, countPerCategory);
      }
      
      fallbackData[category.name] = words;
      console.log(`🔄 Fallback para ${category.name}: ${words.length} palavras extraídas (sem acentos)`);
      console.log('🔍 Palavras extraídas:', words);
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
      maxTokens: maxTokensSetting?.setting_value ? parseInt(maxTokensSetting.setting_value) : 2500,
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
      systemPromptLength: config.systemPrompt.length,
      expectedTotalWords: categories.length * countPerCategory
    });
    
    return await callOpenAIAPIBatch(categories, countPerCategory, apiKey, config);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras em lote com OpenAI:', error);
    throw error;
  }
};
