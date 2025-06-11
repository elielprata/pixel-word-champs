
import { supabase } from '@/integrations/supabase/client';

interface WordUsageRecord {
  user_id: string;
  word: string;
  competition_id?: string;
  level: number;
  category: string;
  used_at: string;
}

interface WordSelectionCriteria {
  userId: string;
  level: number;
  competitionId?: string;
  excludeCategories?: string[];
  maxWordsNeeded: number;
}

class WordHistoryService {
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
      const usageRecords = words.map(word => ({
        user_id: userId,
        word: word.toUpperCase(),
        competition_id: competitionId,
        level,
        category: categoryMap.get(word) || 'unknown',
        used_at: new Date().toISOString()
      }));

      // Inserir no histórico (criar tabela se necessário via migration)
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

  // Selecionar palavras com máxima randomização
  async selectRandomizedWords(criteria: WordSelectionCriteria): Promise<string[]> {
    try {
      const { userId, level, competitionId, excludeCategories = [], maxWordsNeeded } = criteria;
      
      console.log(`🎲 Iniciando seleção randomizada para usuário ${userId}, nível ${level}`);

      // Buscar histórico pessoal (últimos 14 dias)
      const userHistory = await this.getUserWordHistory(userId, 14);
      
      // Buscar histórico da competição se especificada
      const competitionHistory = competitionId 
        ? await this.getCompetitionWordHistory(competitionId)
        : new Set<string>();

      // Combinar exclusões
      const excludedWords = new Set([...userHistory, ...competitionHistory]);
      
      console.log(`🚫 Excluindo ${excludedWords.size} palavras já usadas`);

      // Buscar todas as palavras disponíveis
      let query = supabase
        .from('level_words')
        .select('word, category, difficulty')
        .eq('is_active', true);

      // Excluir categorias se especificado
      if (excludeCategories.length > 0) {
        query = query.not('category', 'in', `(${excludeCategories.join(',')})`);
      }

      const { data: allWords, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar palavras:', error);
        return [];
      }

      if (!allWords || allWords.length === 0) {
        console.log('⚠️ Nenhuma palavra encontrada');
        return [];
      }

      // Filtrar palavras não usadas
      const availableWords = allWords.filter(w => 
        !excludedWords.has(w.word.toUpperCase())
      );

      console.log(`📊 ${availableWords.length}/${allWords.length} palavras disponíveis após filtros`);

      // Se poucas palavras disponíveis, relaxar critérios
      if (availableWords.length < maxWordsNeeded * 2) {
        console.log('⚠️ Poucas palavras disponíveis, relaxando critérios...');
        
        // Usar apenas histórico pessoal dos últimos 3 dias
        const recentHistory = await this.getUserWordHistory(userId, 3);
        const relaxedWords = allWords.filter(w => 
          !recentHistory.has(w.word.toUpperCase())
        );
        
        if (relaxedWords.length >= maxWordsNeeded) {
          return this.randomizeSelection(relaxedWords, maxWordsNeeded);
        }
      }

      // Seleção normal com máxima randomização
      return this.randomizeSelection(availableWords, maxWordsNeeded);
      
    } catch (error) {
      console.error('❌ Erro na seleção randomizada:', error);
      return [];
    }
  }

  // Algoritmo de randomização avançada
  private randomizeSelection(words: Array<{word: string, category: string, difficulty: string}>, count: number): string[] {
    if (words.length === 0) return [];
    
    // Agrupar por categoria para garantir diversidade
    const wordsByCategory = words.reduce((acc, word) => {
      const category = word.category || 'geral';
      if (!acc[category]) acc[category] = [];
      acc[category].push(word);
      return acc;
    }, {} as Record<string, typeof words>);

    const categories = Object.keys(wordsByCategory);
    const selectedWords: string[] = [];
    
    // Primeira passada: uma palavra de cada categoria
    const shuffledCategories = this.shuffleArray([...categories]);
    
    for (const category of shuffledCategories) {
      if (selectedWords.length >= count) break;
      
      const categoryWords = this.shuffleArray([...wordsByCategory[category]]);
      if (categoryWords.length > 0) {
        selectedWords.push(categoryWords[0].word.toUpperCase());
      }
    }
    
    // Segunda passada: completar com palavras aleatórias restantes
    const remainingWords = words.filter(w => 
      !selectedWords.includes(w.word.toUpperCase())
    );
    
    const shuffledRemaining = this.shuffleArray(remainingWords);
    
    for (const word of shuffledRemaining) {
      if (selectedWords.length >= count) break;
      selectedWords.push(word.word.toUpperCase());
    }
    
    console.log(`🎯 Selecionadas ${selectedWords.length} palavras com máxima diversidade`);
    console.log(`📊 Distribuição por categoria:`, this.analyzeSelection(selectedWords, wordsByCategory));
    
    return selectedWords.slice(0, count);
  }

  // Analisar distribuição da seleção
  private analyzeSelection(
    selectedWords: string[], 
    wordsByCategory: Record<string, Array<{word: string, category: string}>>
  ): Record<string, number> {
    const distribution: Record<string, number> = {};
    
    for (const [category, words] of Object.entries(wordsByCategory)) {
      const count = words.filter(w => 
        selectedWords.includes(w.word.toUpperCase())
      ).length;
      
      if (count > 0) {
        distribution[category] = count;
      }
    }
    
    return distribution;
  }

  // Embaralhar array usando Fisher-Yates
  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Limpar histórico antigo (manutenção)
  async cleanOldHistory(daysToKeep: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const { error } = await supabase
        .from('user_word_history')
        .delete()
        .lt('used_at', cutoffDate.toISOString());

      if (error) {
        console.error('❌ Erro ao limpar histórico antigo:', error);
      } else {
        console.log(`🧹 Histórico antigo limpo (mantidos últimos ${daysToKeep} dias)`);
      }
    } catch (error) {
      console.error('❌ Erro na limpeza do histórico:', error);
    }
  }
}

export const wordHistoryService = new WordHistoryService();
