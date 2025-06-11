
import { supabase } from '@/integrations/supabase/client';
import type { WordUsageRecord } from '@/types/wordHistory';

export class WordUsageService {
  // Marcar palavras como usadas por um jogador
  async recordWordsUsage(
    userId: string, 
    words: string[], 
    level: number, 
    competitionId?: string
  ): Promise<void> {
    try {
      console.log(`📝 Registrando uso de ${words.length} palavras para usuário ${userId}`);
      
      // Buscar categorias das palavras
      const { data: wordCategories, error } = await supabase
        .from('level_words')
        .select('word, category')
        .in('word', words)
        .eq('is_active', true);

      if (error) {
        console.error('❌ Erro ao buscar categorias das palavras:', error);
        return;
      }

      const categoryMap = new Map(
        wordCategories?.map(wc => [wc.word, wc.category]) || []
      );

      // Preparar registros de uso
      const usageRecords: WordUsageRecord[] = words.map(word => ({
        user_id: userId,
        word: word.toUpperCase(),
        competition_id: competitionId,
        level,
        category: categoryMap.get(word) || 'unknown',
        used_at: new Date().toISOString()
      }));

      // Inserir no histórico
      const { error: insertError } = await supabase
        .from('user_word_history')
        .insert(usageRecords);

      if (insertError) {
        console.error('❌ Erro ao registrar histórico de palavras:', insertError);
      } else {
        console.log(`✅ Histórico de ${words.length} palavras registrado com sucesso`);
      }
    } catch (error) {
      console.error('❌ Erro inesperado ao registrar palavras:', error);
    }
  }
}

export const wordUsageService = new WordUsageService();
