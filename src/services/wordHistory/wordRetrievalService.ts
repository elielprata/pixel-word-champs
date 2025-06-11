
import { supabase } from '@/integrations/supabase/client';

export class WordRetrievalService {
  // Buscar palavras já usadas por um jogador
  async getUserWordHistory(
    userId: string, 
    daysBack: number = 7
  ): Promise<Set<string>> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const { data: history, error } = await supabase
        .from('user_word_history')
        .select('word')
        .eq('user_id', userId)
        .gte('used_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Erro ao buscar histórico do usuário:', error);
        return new Set();
      }

      const usedWords = new Set(history?.map(h => h.word.toUpperCase()) || []);
      console.log(`📊 Usuário já usou ${usedWords.size} palavras nos últimos ${daysBack} dias`);
      
      return usedWords;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico:', error);
      return new Set();
    }
  }

  // Buscar palavras usadas globalmente em uma competição
  async getCompetitionWordHistory(competitionId: string): Promise<Set<string>> {
    try {
      const { data: history, error } = await supabase
        .from('user_word_history')
        .select('word')
        .eq('competition_id', competitionId);

      if (error) {
        console.error('❌ Erro ao buscar histórico da competição:', error);
        return new Set();
      }

      const usedWords = new Set(history?.map(h => h.word.toUpperCase()) || []);
      console.log(`🏆 Competição já usou ${usedWords.size} palavras únicas`);
      
      return usedWords;
    } catch (error) {
      console.error('❌ Erro ao buscar histórico da competição:', error);
      return new Set();
    }
  }
}

export const wordRetrievalService = new WordRetrievalService();
