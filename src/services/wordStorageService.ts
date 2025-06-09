
import { supabase } from '@/integrations/supabase/client';
import { getDifficultyFromLength } from '@/utils/wordDifficultyUtils';

export const saveWordsToDatabase = async (
  words: string[], 
  categoryId: string, 
  categoryName: string
) => {
  console.log('📝 Palavras geradas:', words);

  // Salvar palavras no banco (sem nível específico, usando dificuldade)
  const wordsToInsert = words.map(word => ({
    word: word.toUpperCase(),
    category: categoryName,
    difficulty: getDifficultyFromLength(word.length),
    is_active: true
    // Removido o campo 'level' já que as palavras não são organizadas por nível
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
      level: 1, // Manter por compatibilidade, mas não é usado para organização
      words_generated: words.length,
      last_generation: new Date().toISOString()
    });

  if (logError) {
    console.error('❌ Erro ao registrar geração:', logError);
  }

  console.log('✅ Palavras salvas com sucesso:', insertedWords?.length);
  return { words: insertedWords, count: words.length };
};
