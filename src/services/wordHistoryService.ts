
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

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
  // CORREÇÃO: Obter user_id real e tornar registro opcional
  async recordWordsUsage(
    userId: string, 
    words: string[], 
    level: number, 
    competitionId?: string
  ): Promise<void> {
    try {
      // CORREÇÃO: Verificar se temos um user_id válido
      if (!userId || userId === 'system' || !this.isValidUUID(userId)) {
        logger.warn('User ID inválido para registro de histórico de palavras', { userId, words: words.length }, 'WORD_HISTORY_SERVICE');
        
        // Tentar obter o user_id do usuário autenticado
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          logger.warn('Usuário não autenticado - ignorando registro de histórico', { words: words.length }, 'WORD_HISTORY_SERVICE');
          return; // Retornar sem falhar
        }
        userId = user.id;
      }

      logger.debug(`Registrando uso de ${words.length} palavras para usuário ${userId}`, undefined, 'WORD_HISTORY_SERVICE');
      
      // Buscar categorias das palavras
      const { data: wordCategories, error } = await supabase
        .from('level_words')
        .select('word, category')
        .in('word', words)
        .eq('is_active', true);

      if (error) {
        logger.error('Erro ao buscar categorias das palavras', { error }, 'WORD_HISTORY_SERVICE');
        return; // Continuar sem registrar histórico
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

      // Inserir no histórico
      const { error: insertError } = await supabase
        .from('user_word_history')
        .insert(usageRecords);

      if (insertError) {
        logger.error('Erro ao registrar histórico de palavras', { error: insertError }, 'WORD_HISTORY_SERVICE');
        // Não falhar - apenas logar o erro
      } else {
        logger.debug(`Histórico de ${words.length} palavras registrado com sucesso`, undefined, 'WORD_HISTORY_SERVICE');
      }
    } catch (error) {
      logger.error('Erro inesperado ao registrar palavras', { error }, 'WORD_HISTORY_SERVICE');
      // Não falhar - apenas logar o erro
    }
  }

  // CORREÇÃO: Função para validar UUID
  private isValidUUID(uuid: string): boolean {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }

  // Buscar palavras já usadas por um jogador
  async getUserWordHistory(
    userId: string, 
    daysBack: number = 7
  ): Promise<Set<string>> {
    try {
      if (!userId || !this.isValidUUID(userId)) {
        logger.warn('User ID inválido para busca de histórico', { userId }, 'WORD_HISTORY_SERVICE');
        return new Set();
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      const { data: history, error } = await supabase
        .from('user_word_history')
        .select('word')
        .eq('user_id', userId)
        .gte('used_at', cutoffDate.toISOString());

      if (error) {
        logger.error('Erro ao buscar histórico do usuário', { error }, 'WORD_HISTORY_SERVICE');
        return new Set();
      }

      const usedWords = new Set(history?.map(h => h.word.toUpperCase()) || []);
      logger.debug(`Usuário já usou ${usedWords.size} palavras nos últimos ${daysBack} dias`, undefined, 'WORD_HISTORY_SERVICE');
      
      return usedWords;
    } catch (error) {
      logger.error('Erro ao buscar histórico', { error }, 'WORD_HISTORY_SERVICE');
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
        logger.error('Erro ao buscar histórico da competição', { error }, 'WORD_HISTORY_SERVICE');
        return new Set();
      }

      const usedWords = new Set(history?.map(h => h.word.toUpperCase()) || []);
      logger.debug(`Competição já usou ${usedWords.size} palavras únicas`, undefined, 'WORD_HISTORY_SERVICE');
      
      return usedWords;
    } catch (error) {
      logger.error('Erro ao buscar histórico da competição', { error }, 'WORD_HISTORY_SERVICE');
      return new Set();
    }
  }

  // Selecionar palavras com máxima randomização
  async selectRandomizedWords(criteria: WordSelectionCriteria): Promise<string[]> {
    try {
      const { userId, level, competitionId, excludeCategories = [], maxWordsNeeded } = criteria;
      
      if (!this.isValidUUID(userId)) {
        logger.warn('User ID inválido para seleção de palavras', { userId }, 'WORD_HISTORY_SERVICE');
        return this.selectBasicWords(maxWordsNeeded);
      }

      logger.debug(`Iniciando seleção randomizada para usuário ${userId}, nível ${level}`, undefined, 'WORD_HISTORY_SERVICE');

      // Buscar histórico pessoal (últimos 14 dias)
      const userHistory = await this.getUserWordHistory(userId, 14);
      
      // Buscar histórico da competição se especificada
      const competitionHistory = competitionId 
        ? await this.getCompetitionWordHistory(competitionId)
        : new Set<string>();

      // Combinar exclusões
      const excludedWords = new Set([...userHistory, ...competitionHistory]);
      
      logger.debug(`Excluindo ${excludedWords.size} palavras já usadas`, undefined, 'WORD_HISTORY_SERVICE');

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
        logger.error('Erro ao buscar palavras', { error }, 'WORD_HISTORY_SERVICE');
        return [];
      }

      if (!allWords || allWords.length === 0) {
        logger.warn('Nenhuma palavra encontrada', undefined, 'WORD_HISTORY_SERVICE');
        return [];
      }

      // Filtrar palavras não usadas
      const availableWords = allWords.filter(w => 
        !excludedWords.has(w.word.toUpperCase())
      );

      logger.debug(`${availableWords.length}/${allWords.length} palavras disponíveis após filtros`, undefined, 'WORD_HISTORY_SERVICE');

      // Se poucas palavras disponíveis, relaxar critérios
      if (availableWords.length < maxWordsNeeded * 2) {
        logger.warn('Poucas palavras disponíveis, relaxando critérios...', undefined, 'WORD_HISTORY_SERVICE');
        
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
      logger.error('Erro na seleção randomizada', { error }, 'WORD_HISTORY_SERVICE');
      return this.selectBasicWords(criteria.maxWordsNeeded);
    }
  }

  // Fallback para seleção básica sem histórico
  private async selectBasicWords(count: number): Promise<string[]> {
    try {
      logger.warn('Usando seleção básica de palavras (sem histórico)', undefined, 'WORD_HISTORY_SERVICE');
      
      const { data: words, error } = await supabase
        .from('level_words')
        .select('word')
        .eq('is_active', true)
        .limit(count * 3); // Buscar mais para ter opções

      if (error || !words) {
        logger.error('Erro ao buscar palavras básicas', { error }, 'WORD_HISTORY_SERVICE');
        return [];
      }

      // Embaralhar e selecionar
      const shuffled = this.shuffleArray(words);
      return shuffled.slice(0, count).map(w => w.word.toUpperCase());
    } catch (error) {
      logger.error('Erro na seleção básica de palavras', { error }, 'WORD_HISTORY_SERVICE');
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
    
    logger.debug(`Selecionadas ${selectedWords.length} palavras com máxima diversidade`, undefined, 'WORD_HISTORY_SERVICE');
    logger.debug(`Distribuição por categoria:`, this.analyzeSelection(selectedWords, wordsByCategory), 'WORD_HISTORY_SERVICE');
    
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
        logger.error('Erro ao limpar histórico antigo', { error }, 'WORD_HISTORY_SERVICE');
      } else {
        logger.info(`Histórico antigo limpo (mantidos últimos ${daysToKeep} dias)`, undefined, 'WORD_HISTORY_SERVICE');
      }
    } catch (error) {
      logger.error('Erro na limpeza do histórico', { error }, 'WORD_HISTORY_SERVICE');
    }
  }
}

export const wordHistoryService = new WordHistoryService();
