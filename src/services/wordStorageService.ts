
import { supabase } from '@/integrations/supabase/client';
import { getDifficultyFromLength } from '@/utils/wordDifficultyUtils';

export const saveWordsToDatabase = async (
  words: string[], 
  categoryId: string, 
  categoryName: string
) => {
  console.log('📝 Iniciando salvamento de palavras:', {
    category: categoryName,
    wordsReceived: words.length,
    words: words
  });

  if (!words || words.length === 0) {
    console.log('ℹ️ Nenhuma palavra para salvar');
    return { words: [], count: 0 };
  }

  // Normalizar palavras (maiúsculas e sem espaços)
  const normalizedWords = words
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length >= 3 && /^[A-Z]+$/.test(word));

  console.log('📊 Palavras após normalização:', {
    category: categoryName,
    original: words.length,
    normalized: normalizedWords.length,
    normalizedWords
  });

  if (normalizedWords.length === 0) {
    console.log('⚠️ Nenhuma palavra válida após normalização');
    return { words: [], count: 0 };
  }

  // VERIFICAÇÃO MELHORADA: Buscar palavras existentes APENAS nesta categoria
  console.log(`🔍 Verificando palavras existentes na categoria "${categoryName}"...`);
  
  const { data: existingWords, error: checkError } = await supabase
    .from('level_words')
    .select('word, id, created_at')
    .in('word', normalizedWords)
    .eq('category', categoryName)
    .eq('is_active', true);

  if (checkError) {
    console.error('❌ Erro ao verificar palavras existentes:', checkError);
    throw checkError;
  }

  console.log(`📋 Palavras já existentes na categoria "${categoryName}":`, {
    count: existingWords?.length || 0,
    words: existingWords?.map(w => w.word) || []
  });

  // Criar um Set das palavras que já existem NESTA CATEGORIA
  const existingWordsSet = new Set(
    existingWords?.map(item => item.word) || []
  );

  // Filtrar apenas palavras que realmente não existem NESTA CATEGORIA
  const newWords = normalizedWords.filter(word => {
    const exists = existingWordsSet.has(word);
    if (exists) {
      console.log(`⚠️ Palavra "${word}" já existe na categoria "${categoryName}" - pulando`);
    }
    return !exists;
  });

  // Remover duplicatas dentro do próprio array de palavras novas
  const uniqueNewWords = [...new Set(newWords)];

  console.log(`📊 Análise final para categoria "${categoryName}":`, {
    palavrasOriginais: words.length,
    palavrasNormalizadas: normalizedWords.length,
    palavrasJaExistentes: normalizedWords.length - newWords.length,
    palavrasNovasUnicas: uniqueNewWords.length,
    palavrasParaInserir: uniqueNewWords
  });

  if (uniqueNewWords.length === 0) {
    console.log(`ℹ️ Todas as palavras já existem na categoria "${categoryName}"`);
    return { words: [], count: 0 };
  }

  // Preparar palavras para inserção com validação extra
  const wordsToInsert = uniqueNewWords.map(word => {
    const wordData = {
      word: word,
      category: categoryName,
      difficulty: getDifficultyFromLength(word.length),
      level: 1,
      is_active: true
    };
    
    console.log(`🎯 Preparando para inserir: "${word}" na categoria "${categoryName}" com dificuldade "${wordData.difficulty}"`);
    return wordData;
  });

  console.log('💾 Iniciando inserção no banco de dados...', {
    category: categoryName,
    totalToInsert: wordsToInsert.length
  });

  // INSERÇÃO MELHORADA: Usar upsert com melhor tratamento de erros
  const insertedWords = [];
  let successCount = 0;
  let duplicateCount = 0;
  let errorCount = 0;

  for (const [index, wordData] of wordsToInsert.entries()) {
    try {
      console.log(`💽 [${index + 1}/${wordsToInsert.length}] Inserindo: "${wordData.word}" na categoria "${categoryName}"`);
      
      const { data, error } = await supabase
        .from('level_words')
        .insert([wordData])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          // Erro de duplicata - pode ser constraint única que não conhecemos
          duplicateCount++;
          console.warn(`⚠️ DUPLICATA detectada: "${wordData.word}" na categoria "${categoryName}" (erro ${error.code})`);
          console.warn('🔍 Detalhes do erro de duplicata:', error);
        } else {
          errorCount++;
          console.error(`❌ Erro inesperado ao inserir "${wordData.word}":`, error);
        }
      } else {
        insertedWords.push(data);
        successCount++;
        console.log(`✅ [${successCount}] Palavra inserida com sucesso: "${wordData.word}" na categoria "${categoryName}"`);
      }
    } catch (err) {
      errorCount++;
      console.error(`❌ Erro inesperado ao inserir palavra "${wordData.word}":`, err);
    }
  }

  // Registrar a geração na tabela de controle SE houve sucesso
  if (successCount > 0) {
    try {
      const { error: logError } = await supabase
        .from('ai_word_generation')
        .insert({
          category_id: categoryId,
          level: 1,
          words_generated: successCount,
          last_generation: new Date().toISOString()
        });

      if (logError) {
        console.error('❌ Erro ao registrar geração na tabela de controle:', logError);
      } else {
        console.log('📊 Geração registrada na tabela de controle');
      }
    } catch (logErr) {
      console.error('❌ Erro inesperado ao registrar geração:', logErr);
    }
  }

  const finalResult = {
    category: categoryName,
    totalReceived: words.length,
    normalizedWords: normalizedWords.length,
    duplicatesSkipped: duplicateCount,
    errors: errorCount,
    successfulInserts: successCount,
    insertedWords: insertedWords,
    count: successCount
  };

  console.log(`🎯 RESULTADO FINAL para categoria "${categoryName}":`, finalResult);

  return { words: insertedWords, count: successCount };
};
