
import { supabase } from '@/integrations/supabase/client';
import { getDifficultyFromLength } from '@/utils/wordDifficultyUtils';

export const saveWordsToDatabase = async (
  words: string[], 
  categoryId: string, 
  categoryName: string
) => {
  console.log('📝 Palavras geradas:', words);

  if (!words || words.length === 0) {
    console.log('ℹ️ Nenhuma palavra para salvar');
    return { words: [], count: 0 };
  }

  // Normalizar palavras (maiúsculas e sem espaços)
  const normalizedWords = words
    .map(word => word.trim().toUpperCase())
    .filter(word => word.length >= 3 && /^[A-Z]+$/.test(word));

  console.log('📊 Palavras normalizadas:', normalizedWords);

  if (normalizedWords.length === 0) {
    console.log('⚠️ Nenhuma palavra válida após normalização');
    return { words: [], count: 0 };
  }

  // Verificar quais palavras já existem no banco PARA ESTA CATEGORIA ESPECÍFICA
  const { data: existingWords, error: checkError } = await supabase
    .from('level_words')
    .select('word')
    .in('word', normalizedWords)
    .eq('category', categoryName)
    .eq('is_active', true);

  if (checkError) {
    console.error('❌ Erro ao verificar palavras existentes:', checkError);
    throw checkError;
  }

  // Criar um Set das palavras que já existem NESTA CATEGORIA
  const existingWordsSet = new Set(
    existingWords?.map(item => item.word) || []
  );

  // Filtrar apenas palavras que realmente não existem NESTA CATEGORIA
  const newWords = normalizedWords.filter(word => !existingWordsSet.has(word));

  // Remover duplicatas dentro do próprio array de palavras novas
  const uniqueNewWords = [...new Set(newWords)];

  console.log(`📊 Total original: ${words.length}, Normalizadas: ${normalizedWords.length}, Novas únicas para categoria "${categoryName}": ${uniqueNewWords.length}, Já existem na categoria: ${normalizedWords.length - uniqueNewWords.length}`);

  if (uniqueNewWords.length === 0) {
    console.log(`ℹ️ Todas as palavras já existem na categoria "${categoryName}"`);
    return { words: [], count: 0 };
  }

  // Preparar palavras para inserção
  const wordsToInsert = uniqueNewWords.map(word => ({
    word: word,
    category: categoryName,
    difficulty: getDifficultyFromLength(word.length),
    level: 1, // Campo obrigatório no banco
    is_active: true
  }));

  console.log('💾 Inserindo palavras na categoria:', categoryName, '- Quantidade:', wordsToInsert.length);

  // Inserir palavras uma por vez para evitar conflitos de constraint
  const insertedWords = [];
  let successCount = 0;

  for (const wordData of wordsToInsert) {
    try {
      const { data, error } = await supabase
        .from('level_words')
        .insert([wordData])
        .select()
        .single();

      if (error) {
        // Se for erro de duplicata, apenas avisar e continuar
        if (error.code === '23505') {
          console.log(`⚠️ Palavra já existe na categoria "${categoryName}" (ignorando): ${wordData.word}`);
        } else {
          console.error(`❌ Erro ao inserir palavra ${wordData.word}:`, error);
        }
      } else {
        insertedWords.push(data);
        successCount++;
        console.log(`✅ Palavra inserida na categoria "${categoryName}": ${wordData.word}`);
      }
    } catch (err) {
      console.error(`❌ Erro inesperado ao inserir palavra ${wordData.word}:`, err);
    }
  }

  // Registrar a geração na tabela de controle
  if (successCount > 0) {
    const { error: logError } = await supabase
      .from('ai_word_generation')
      .insert({
        category_id: categoryId,
        level: 1,
        words_generated: successCount,
        last_generation: new Date().toISOString()
      });

    if (logError) {
      console.error('❌ Erro ao registrar geração:', logError);
    }
  }

  console.log(`✅ Palavras salvas com sucesso na categoria "${categoryName}": ${successCount} de ${uniqueNewWords.length} tentativas`);
  return { words: insertedWords, count: successCount };
};
