
import { supabase } from '@/integrations/supabase/client';
import { normalizeText, isValidGameWord } from '@/utils/levelConfiguration';
import { selectRandomWords } from '@/utils/simpleWordDistribution';
import { logger } from '@/utils/logger';

export const intelligentWordServiceDatabase = {
  async tryOptimizedDatabaseSelection(count: number, maxLength: number): Promise<string[] | null> {
    try {
      logger.debug('🔍 Tentando seleção otimizada do banco de dados', { count, maxLength }, 'INTELLIGENT_WORD_SERVICE');
      
      // Query otimizada com filtros mais inteligentes
      const { data: words, error } = await supabase
        .from('level_words')
        .select('word, difficulty')
        .eq('is_active', true)
        .order('created_at', { ascending: false }) // Palavras mais recentes primeiro
        .limit(Math.min(200, count * 20)); // Limite dinâmico baseado na necessidade

      if (error) {
        logger.warn('⚠️ Erro na consulta otimizada do banco', { error }, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      if (!words || words.length === 0) {
        logger.warn('📭 Nenhuma palavra encontrada no banco otimizado', undefined, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      // Filtrar e normalizar palavras válidas com priorização por dificuldade
      const processedWords = words
        .filter(w => w.word && typeof w.word === 'string')
        .map(w => ({
          word: normalizeText(w.word),
          difficulty: w.difficulty || 'medium'
        }))
        .filter(w => isValidGameWord(w.word, maxLength));

      if (processedWords.length === 0) {
        logger.warn('⚠️ Nenhuma palavra válida após filtros otimizados', { 
          totalWords: words.length,
          maxLength 
        }, 'INTELLIGENT_WORD_SERVICE');
        return null;
      }

      // Seleção inteligente baseada em dificuldade
      const selectedWords = this.intelligentWordSelection(processedWords, count);
      
      logger.info('✅ Seleção otimizada do banco concluída', { 
        totalWords: words.length,
        validWords: processedWords.length,
        selectedWords: selectedWords.length
      }, 'INTELLIGENT_WORD_SERVICE');

      return selectedWords;

    } catch (error) {
      logger.error('❌ Erro na seleção otimizada do banco de dados', { error }, 'INTELLIGENT_WORD_SERVICE');
      return null;
    }
  },

  intelligentWordSelection(
    words: { word: string; difficulty: string }[], 
    count: number
  ): string[] {
    // Distribuição equilibrada de dificuldades
    const easyWords = words.filter(w => w.difficulty === 'easy');
    const mediumWords = words.filter(w => w.difficulty === 'medium');
    const hardWords = words.filter(w => w.difficulty === 'hard');
    
    const selected: string[] = [];
    const targetDistribution = {
      easy: Math.ceil(count * 0.4),   // 40% fáceis
      medium: Math.ceil(count * 0.4), // 40% médias
      hard: Math.floor(count * 0.2)   // 20% difíceis
    };
    
    // Selecionar de cada categoria
    selected.push(...selectRandomWords(easyWords.map(w => w.word), targetDistribution.easy));
    selected.push(...selectRandomWords(mediumWords.map(w => w.word), targetDistribution.medium));
    selected.push(...selectRandomWords(hardWords.map(w => w.word), targetDistribution.hard));
    
    // Se não temos palavras suficientes, completar com qualquer uma disponível
    if (selected.length < count) {
      const remaining = words
        .map(w => w.word)
        .filter(word => !selected.includes(word));
      selected.push(...selectRandomWords(remaining, count - selected.length));
    }
    
    return selected.slice(0, count);
  }
};
