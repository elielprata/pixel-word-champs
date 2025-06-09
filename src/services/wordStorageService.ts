
import { supabase } from '@/integrations/supabase/client';
import { getDifficultyFromLength } from '@/utils/wordDifficultyUtils';

export const saveWordsToDatabase = async (
  words: string[], 
  categoryId: string, 
  categoryName: string
) => {
  console.log('📝 Palavras geradas:', words);

  // Verificar quais palavras já existem no banco para evitar duplicatas
  const { data: existingWords, error: checkError } = await supabase
    .from('level_words')
    .select('word, level')
    .in('word', words.map(w => w.toUpperCase()))
    .eq('is_active', true);

  if (checkError) {
    console.error('❌ Erro ao verificar palavras existentes:', checkError);
  }

  // Criar um Set das palavras existentes para verificação rápida
  const existingWordsSet = new Set(
    existingWords?.map(item => `${item.word}_${item.level}`) || []
  );

  // Filtrar palavras que não existem ainda
  const newWords = words.filter(word => {
    const wordKey = `${word.toUpperCase()}_1`; // level 1 é o padrão
    return !existingWordsSet.has(wordKey);
  });

  console.log(`📊 Total de palavras: ${words.length}, Novas: ${newWords.length}, Já existem: ${words.length - newWords.length}`);

  if (newWords.length === 0) {
    console.log('ℹ️ Todas as palavras já existem no banco');
    return { words: [], count: 0 };
  }

  // Salvar apenas palavras novas no banco organizadas por dificuldade
  const wordsToInsert = newWords.map(word => ({
    word: word.toUpperCase(),
    category: categoryName,
    difficulty: getDifficultyFromLength(word.length),
    level: 1, // Campo obrigatório no banco, mas não usado para organização
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
      level: 1, // Manter por compatibilidade com o banco
      words_generated: newWords.length,
      last_generation: new Date().toISOString()
    });

  if (logError) {
    console.error('❌ Erro ao registrar geração:', logError);
  }

  console.log('✅ Palavras salvas com sucesso:', insertedWords?.length);
  return { words: insertedWords, count: newWords.length };
};
