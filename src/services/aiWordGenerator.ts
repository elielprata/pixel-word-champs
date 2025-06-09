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

  const prompt = `Gere EXATAMENTE ${count} palavras em português para a categoria "${categoryName}".

REGRAS OBRIGATÓRIAS:
- EXATAMENTE ${count} palavras
- TODAS as palavras devem estar em MAIÚSCULAS
- NENHUMA palavra pode ter acentos (á, à, â, ã, é, è, ê, í, ì, î, ó, ò, ô, õ, ú, ù, û, ç, ñ)
- Apenas letras de A a Z (sem acentos, cedilhas ou til)
- Palavras de 3-8 letras para diferentes níveis de dificuldade
- Uma palavra por linha
- Sem numeração ou formatação adicional

Exemplos de palavras CORRETAS: CASA, ARVORE, PEIXE, LIVRO
Exemplos de palavras INCORRETAS: ÁRVORE, CORAÇÃO, PÁSSARO (têm acentos)

Retorne apenas as palavras, uma por linha:`;

  const requestBody = {
    model: config.model || 'gpt-4.1-2025-04-14',
    messages: [
      { 
        role: 'system', 
        content: config.systemPrompt || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
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
  console.log('🚀 Iniciando geração individual garantida para cada categoria:', {
    categoriesCount: categories.length,
    countPerCategory,
    expectedTotal: categories.length * countPerCategory
  });

  const allResults: Record<string, string[]> = {};
  let totalWordsGenerated = 0;

  // Gerar cada categoria individualmente para garantir quantidade
  for (const category of categories) {
    console.log(`🎯 Processando categoria: ${category.name}`);
    
    let attempts = 0;
    let categoryWords: string[] = [];
    
    // Tentar até 3 vezes para conseguir a quantidade completa
    while (categoryWords.length < countPerCategory && attempts < 3) {
      attempts++;
      const needed = countPerCategory - categoryWords.length;
      
      console.log(`🔄 Tentativa ${attempts} para ${category.name}: gerando ${needed} palavras`);
      
      try {
        const newWords = await callOpenAIAPI(category.name, needed, apiKey, config);
        
        // Filtrar palavras que já temos para evitar duplicatas
        const existingWordsSet = new Set(categoryWords);
        const uniqueNewWords = newWords.filter(word => !existingWordsSet.has(word));
        
        categoryWords.push(...uniqueNewWords);
        
        console.log(`📈 Categoria ${category.name}: ${categoryWords.length}/${countPerCategory} palavras (adicionou ${uniqueNewWords.length})`);
        
        // Pequena pausa entre requisições para evitar rate limit
        if (attempts < 3 && categoryWords.length < countPerCategory) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
      } catch (error) {
        console.error(`❌ Erro na tentativa ${attempts} para ${category.name}:`, error);
        if (attempts === 3) {
          console.warn(`⚠️ Usando ${categoryWords.length} palavras para ${category.name} (não conseguiu completar)`);
        }
      }
    }
    
    // Garantir que não temos mais palavras que o solicitado
    categoryWords = categoryWords.slice(0, countPerCategory);
    
    allResults[category.name] = categoryWords;
    totalWordsGenerated += categoryWords.length;
    
    console.log(`✅ Categoria ${category.name} finalizada: ${categoryWords.length}/${countPerCategory} palavras`);
    
    // Pausa entre categorias para ser gentil com a API
    if (categories.indexOf(category) < categories.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  }
  
  console.log(`🎉 GERAÇÃO COMPLETA: ${totalWordsGenerated}/${categories.length * countPerCategory} palavras`);
  console.log('📊 Resumo por categoria:', Object.entries(allResults).map(([name, words]) => `${name}: ${words.length}`));
  
  return allResults;
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
    model: modelSetting?.setting_value || 'gpt-4.1-2025-04-14',
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
    console.log('🚀 Iniciando geração garantida para categorias:', categories.map(c => c.name), 'quantidade por categoria:', countPerCategory);
    
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
      model: modelSetting?.setting_value || 'gpt-4.1-2025-04-14',
      maxTokens: maxTokensSetting?.setting_value ? parseInt(maxTokensSetting.setting_value) : 300,
      temperature: temperatureSetting?.setting_value ? parseFloat(temperatureSetting.setting_value) : 0.7,
      systemPrompt: systemPromptSetting?.setting_value || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
    };

    const apiKey = apiKeySetting.setting_value.trim();
    
    console.log('🔧 Configurações carregadas para geração garantida:', {
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
    console.error('❌ Erro ao gerar palavras com estratégia garantida:', error);
    throw error;
  }
};
