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

// Função para buscar palavras já existentes em uma categoria
const getExistingWordsForCategory = async (categoryName: string): Promise<string[]> => {
  try {
    console.log(`🔍 Buscando palavras existentes para categoria "${categoryName}"...`);
    
    const { data, error } = await supabase
      .from('level_words')
      .select('word')
      .eq('category', categoryName)
      .eq('is_active', true);

    if (error) {
      console.error(`❌ Erro ao buscar palavras existentes para "${categoryName}":`, error);
      return [];
    }

    const existingWords = data?.map(item => item.word) || [];
    console.log(`📋 Categoria "${categoryName}" já possui ${existingWords.length} palavras:`, existingWords.slice(0, 10));
    
    return existingWords;
  } catch (err) {
    console.error(`❌ Erro inesperado ao buscar palavras para "${categoryName}":`, err);
    return [];
  }
};

// Função para chamar a OpenAI API para uma categoria individual
const callOpenAIAPI = async (categoryName: string, count: number, apiKey: string, config: any): Promise<string[]> => {
  console.log('🤖 Iniciando chamada OpenAI individual com configurações:', {
    category: categoryName,
    count,
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  // Buscar palavras existentes para esta categoria
  const existingWords = await getExistingWordsForCategory(categoryName);
  
  // PROMPT MELHORADO com contexto das palavras existentes
  const existingWordsContext = existingWords.length > 0 
    ? `JÁ EXISTEM ${existingWords.length} palavras (exemplos: ${existingWords.slice(0, 10).join(', ')})`
    : 'categoria vazia';

  const prompt = `Gere EXATAMENTE ${count} palavras DIFERENTES e CRIATIVAS em português para a categoria: ${categoryName}

PALAVRAS JÁ EXISTENTES NO BANCO (EVITE ESTAS):
${categoryName}: ${existingWordsContext}

REGRAS OBRIGATÓRIAS:
- EXATAMENTE ${count} palavras DIFERENTES
- TODAS as palavras devem estar em MAIÚSCULAS
- NENHUMA palavra pode ter acentos (á, à, â, ã, é, è, ê, í, ì, î, ó, ò, ô, õ, ú, ù, û, ç, ñ)
- Apenas letras de A a Z (sem acentos, cedilhas ou til)
- Palavras de 3-8 letras para diferentes níveis de dificuldade
- NUNCA repetir palavras dentro da categoria
- EVITE palavras muito óbvias ou que já existem (veja lista acima)
- Seja CRIATIVO e use palavras menos comuns mas conhecidas

ESTRATÉGIA DE CRIATIVIDADE:
- Use sinônimos e variações menos óbvias
- Explore subcategorias dentro do tema
- Prefira palavras que jogadores não esperariam
- Evite as palavras mais comuns da categoria

DISTRIBUIÇÃO DE DIFICULDADE:
- 20% palavras de 3-4 letras (fácil)
- 30% palavras de 5 letras (médio) 
- 30% palavras de 6-7 letras (difícil)
- 20% palavras de 8+ letras (expert)

Exemplos de palavras CORRETAS: ZEBRA, VIOLINO, BADMINTON, ARQUITETO, TELESCOPIO
Exemplos de palavras INCORRETAS: ÁRVORE, CORAÇÃO, PÁSSARO (têm acentos)

Retorne APENAS as palavras, uma por linha, sem numeração ou texto adicional:

PALAVRA1
PALAVRA2
PALAVRA3`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Você é um especialista em gerar palavras únicas e criativas para jogos de caça-palavras. Retorne APENAS as palavras solicitadas, uma por linha, sem texto adicional. Seja criativo e evite palavras óbvias.'
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: config.maxTokens || 300,
    temperature: config.temperature || 0.8,
  };

  console.log('📤 Enviando requisição individual para OpenAI:', {
    model: requestBody.model,
    category: categoryName,
    expectedWords: count,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature,
    existingWordsCount: existingWords.length
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
    hasContent: !!data.choices?.[0]?.message?.content,
    contentLength: data.choices?.[0]?.message?.content?.length || 0
  });
  
  const content = data.choices[0].message.content;
  console.log('📄 Conteúdo COMPLETO recebido da OpenAI:', content);
  
  try {
    // Processar as palavras linha por linha
    const words = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((word: string) => removeAccents(word).toUpperCase())
      .filter((word: string) => isValidWord(word))
      .slice(0, count);

    console.log('✅ Palavras processadas:', {
      categoria: categoryName,
      esperadas: count,
      processadas: words.length,
      palavras: words
    });

    return words;
    
  } catch (parseError) {
    console.error('❌ Erro ao processar palavras da OpenAI:', parseError);
    console.log('📄 Conteúdo recebido que falhou no parse:', content);
    
    // Fallback: extrair palavras válidas do texto
    const fallbackWords = content
      .split(/[\n\r\s,]+/)
      .map((word: string) => removeAccents(word.trim()).toUpperCase())
      .filter((word: string) => isValidWord(word))
      .slice(0, count);
    
    console.log('🔄 Fallback para categoria:', categoryName, 'palavras extraídas:', fallbackWords.length);
    return fallbackWords;
  }
};

// Função para chamar a OpenAI API com múltiplas categorias e contexto melhorado
const callOpenAIAPIBatch = async (categories: Array<{id: string, name: string}>, countPerCategory: number, apiKey: string, config: any): Promise<Record<string, string[]>> => {
  console.log('🤖 Iniciando chamada OpenAI em lote com configurações:', {
    categoriesCount: categories.length,
    countPerCategory,
    hasKey: !!apiKey,
    keyLength: apiKey?.length || 0,
    model: config.model,
    maxTokens: config.maxTokens,
    temperature: config.temperature
  });

  // Buscar palavras existentes para cada categoria
  const existingWordsByCategory: Record<string, string[]> = {};
  for (const category of categories) {
    existingWordsByCategory[category.name] = await getExistingWordsForCategory(category.name);
  }

  const categoriesList = categories.map(cat => cat.name).join(', ');
  
  // PROMPT MELHORADO com contexto das palavras existentes
  const existingWordsContext = categories.map(cat => {
    const existing = existingWordsByCategory[cat.name];
    if (existing.length > 0) {
      return `${cat.name}: JÁ EXISTEM ${existing.length} palavras (exemplos: ${existing.slice(0, 5).join(', ')})`;
    }
    return `${cat.name}: categoria vazia`;
  }).join('\n');

  const prompt = `Gere EXATAMENTE ${countPerCategory} palavras DIFERENTES e CRIATIVAS em português para CADA UMA das seguintes categorias: ${categoriesList}

PALAVRAS JÁ EXISTENTES NO BANCO (EVITE ESTAS):
${existingWordsContext}

REGRAS OBRIGATÓRIAS:
- EXATAMENTE ${countPerCategory} palavras DIFERENTES para CADA categoria
- TODAS as palavras devem estar em MAIÚSCULAS
- NENHUMA palavra pode ter acentos (á, à, â, ã, é, è, ê, í, ì, î, ó, ò, ô, õ, ú, ù, û, ç, ñ)
- Apenas letras de A a Z (sem acentos, cedilhas ou til)
- Palavras de 3-8 letras para diferentes níveis de dificuldade
- PALAVRAS ÚNICAS - NUNCA repetir a mesma palavra em categorias diferentes
- NUNCA repetir palavras dentro da mesma categoria
- EVITE palavras muito óbvias ou que já existem (veja lista acima)
- Seja CRIATIVO e use palavras menos comuns mas conhecidas

ESTRATÉGIA DE CRIATIVIDADE:
- Use sinônimos e variações menos óbvias
- Explore subcategorias dentro do tema
- Prefira palavras que jogadores não esperariam
- Evite as palavras mais comuns da categoria

DISTRIBUIÇÃO DE DIFICULDADE:
- 20% palavras de 3-4 letras (fácil)
- 30% palavras de 5 letras (médio) 
- 30% palavras de 6-7 letras (difícil)
- 20% palavras de 8+ letras (expert)

Exemplos de palavras CORRETAS: ZEBRA, VIOLINO, BADMINTON, ARQUITETO, TELESCOPIO
Exemplos de palavras INCORRETAS: ÁRVORE, CORAÇÃO, PÁSSARO (têm acentos)

Retorne EXATAMENTE no formato JSON abaixo, SEM texto adicional antes ou depois:

{
${categories.map(cat => `  "${cat.name}": ["PALAVRA1", "PALAVRA2", "PALAVRA3"${countPerCategory > 3 ? ', "PALAVRA4", "PALAVRA5"' : ''}]`).join(',\n')}
}

IMPORTANTE: 
- Total esperado: ${categories.length} categorias × ${countPerCategory} palavras = ${categories.length * countPerCategory} palavras ÚNICAS
- Todas as ${categories.length * countPerCategory} palavras devem ser DIFERENTES entre si
- EVITE as palavras já existentes listadas acima
- SEM ACENTOS em nenhuma palavra`;

  const requestBody = {
    model: config.model || 'gpt-4o-mini',
    messages: [
      { 
        role: 'system', 
        content: 'Você é um especialista em gerar palavras únicas e criativas para jogos de caça-palavras. Retorne APENAS o JSON solicitado, sem texto adicional. Seja criativo e evite palavras óbvias.'
      },
      { role: 'user', content: prompt }
    ],
    max_tokens: config.maxTokens || 2500,
    temperature: config.temperature || 0.8, // Temperatura mais alta para mais criatividade
  };

  console.log('📤 Enviando requisição em lote para OpenAI:', {
    model: requestBody.model,
    categoriesCount: categories.length,
    expectedWords: categories.length * countPerCategory,
    maxTokens: requestBody.max_tokens,
    temperature: requestBody.temperature,
    existingWordsTotal: Object.values(existingWordsByCategory).flat().length
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
    hasContent: !!data.choices?.[0]?.message?.content,
    contentLength: data.choices?.[0]?.message?.content?.length || 0
  });
  
  const content = data.choices[0].message.content;
  console.log('📄 Conteúdo COMPLETO recebido da OpenAI:', content);
  
  try {
    // Limpar o conteúdo antes de tentar parsear
    const cleanContent = content.trim().replace(/^```json\s*/, '').replace(/\s*```$/, '');
    console.log('🧹 Conteúdo limpo para parse:', cleanContent);
    
    // Tentar parsear como JSON
    const jsonData = JSON.parse(cleanContent);
    console.log('✅ JSON parseado com sucesso:', jsonData);
    
    // Verificar se todas as categorias estão presentes
    const missingCategories = categories.filter(cat => !jsonData[cat.name]);
    if (missingCategories.length > 0) {
      console.warn('⚠️ Categorias ausentes na resposta:', missingCategories.map(c => c.name));
    }
    
    // Processar e validar cada categoria com verificação rigorosa
    const processedData: Record<string, string[]> = {};
    let totalWordsProcessed = 0;
    const allGeneratedWords = new Set<string>(); // Para detectar duplicatas globais
    
    for (const category of categories) {
      const categoryWords = jsonData[category.name] || [];
      const existingInCategory = existingWordsByCategory[category.name] || [];
      const existingSet = new Set(existingInCategory);
      
      console.log(`🔍 Processando categoria "${category.name}":`, {
        recebidas: categoryWords.length,
        esperadas: countPerCategory,
        jaExistemNoBanco: existingInCategory.length,
        palavrasRecebidas: categoryWords
      });
      
      const validWords: string[] = [];
      
      for (const word of categoryWords) {
        if (typeof word !== 'string') {
          console.warn(`⚠️ Palavra inválida (não é string) na categoria ${category.name}:`, word);
          continue;
        }
        
        // Remover acentos de forma mais rigorosa
        const cleaned = removeAccents(word.trim()).toUpperCase();
        
        // Validar palavra
        if (!isValidWord(cleaned)) {
          console.warn(`⚠️ Palavra inválida na categoria ${category.name}: "${word}" -> "${cleaned}"`);
          continue;
        }
        
        // Verificar se já existe no banco para esta categoria
        if (existingSet.has(cleaned)) {
          console.warn(`⚠️ Palavra "${cleaned}" já existe no banco para categoria "${category.name}" - pulando`);
          continue;
        }
        
        // Verificar duplicata global nesta geração
        if (allGeneratedWords.has(cleaned)) {
          console.warn(`⚠️ DUPLICATA GLOBAL detectada: "${cleaned}" já foi gerada em outra categoria desta sessão`);
          continue;
        }
        
        validWords.push(cleaned);
        allGeneratedWords.add(cleaned);
        
        if (validWords.length >= countPerCategory) {
          break;
        }
      }
      
      processedData[category.name] = validWords;
      totalWordsProcessed += validWords.length;
      
      console.log(`✅ Categoria "${category.name}": ${validWords.length}/${countPerCategory} palavras válidas processadas (sem acentos e sem duplicatas)`);
      console.log('🔍 Palavras finais da categoria:', validWords);
      
      // Aviso se não conseguiu o número exato
      if (validWords.length < countPerCategory) {
        console.warn(`⚠️ Categoria "${category.name}": esperado ${countPerCategory}, processado ${validWords.length}`);
      }
    }
    
    console.log(`📊 RESUMO FINAL DA GERAÇÃO:`, {
      totalEsperado: categories.length * countPerCategory,
      totalProcessado: totalWordsProcessed,
      palavrasUnicasGlobais: allGeneratedWords.size,
      eficiencia: `${Math.round((totalWordsProcessed / (categories.length * countPerCategory)) * 100)}%`
    });
    
    return processedData;
    
  } catch (parseError) {
    console.error('❌ Erro ao parsear JSON da OpenAI:', parseError);
    console.log('📄 Conteúdo recebido que falhou no parse:', content);
    
    // Fallback mais inteligente mantido igual
    console.log('🔄 Tentando fallback de extração de palavras...');
    const fallbackData: Record<string, string[]> = {};
    
    for (const category of categories) {
      const categoryPattern = new RegExp(`"?${category.name}"?\\s*[:\\[]([^\\]\\}]+)`, 'i');
      const match = content.match(categoryPattern);
      
      let words: string[] = [];
      if (match) {
        words = match[1]
          .split(/[,\n\r"'\[\]]+/)
          .map((word: string) => removeAccents(word.trim()).toUpperCase())
          .filter((word: string) => isValidWord(word))
          .slice(0, countPerCategory);
      }
      
      if (words.length < countPerCategory) {
        const allWords = content
          .split(/[\n\r\s,]+/)
          .map((word: string) => removeAccents(word.trim()).toUpperCase())
          .filter((word: string) => isValidWord(word))
          .slice(words.length, countPerCategory);
        
        words = [...words, ...allWords].slice(0, countPerCategory);
      }
      
      fallbackData[category.name] = words;
      console.log(`🔄 Fallback para ${category.name}: ${words.length} palavras extraídas`);
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
    console.log('🚀 Iniciando geração em lote MELHORADA para categorias:', categories.map(c => c.name), 'quantidade por categoria:', countPerCategory);
    
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
      temperature: temperatureSetting?.setting_value ? parseFloat(temperatureSetting.setting_value) : 0.8, // Padrão mais alto
      systemPrompt: systemPromptSetting?.setting_value || 'Você é um assistente especializado em gerar palavras para jogos de caça-palavras em português.'
    };

    const apiKey = apiKeySetting.setting_value.trim();
    
    console.log('🔧 Configurações carregadas para geração MELHORADA:', {
      hasApiKey: !!apiKey,
      keyLength: apiKey.length,
      model: config.model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      expectedTotalWords: categories.length * countPerCategory
    });
    
    return await callOpenAIAPIBatch(categories, countPerCategory, apiKey, config);
    
  } catch (error) {
    console.error('❌ Erro ao gerar palavras em lote MELHORADO:', error);
    throw error;
  }
};
