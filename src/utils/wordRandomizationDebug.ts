
import { supabase } from '@/integrations/supabase/client';

export class WordRandomizationDebug {
  // Analisar distribuição de palavras por usuário
  static async analyzeUserWordDistribution(userId: string, days: number = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data: history, error } = await supabase
        .from('user_word_history')
        .select('word, category, level, used_at')
        .eq('user_id', userId)
        .gte('used_at', cutoffDate.toISOString())
        .order('used_at', { ascending: false });

      if (error || !history) {
        console.error('❌ Erro ao buscar histórico:', error);
        return null;
      }

      const analysis = {
        totalWords: history.length,
        uniqueWords: new Set(history.map(h => h.word)).size,
        categoryDistribution: {} as Record<string, number>,
        levelDistribution: {} as Record<number, number>,
        repetitions: {} as Record<string, number>,
        timeline: history.map(h => ({
          word: h.word,
          category: h.category,
          level: h.level,
          date: h.used_at
        }))
      };

      // Analisar distribuição por categoria
      history.forEach(item => {
        analysis.categoryDistribution[item.category] = 
          (analysis.categoryDistribution[item.category] || 0) + 1;
      });

      // Analisar distribuição por nível
      history.forEach(item => {
        analysis.levelDistribution[item.level] = 
          (analysis.levelDistribution[item.level] || 0) + 1;
      });

      // Analisar repetições
      history.forEach(item => {
        analysis.repetitions[item.word] = 
          (analysis.repetitions[item.word] || 0) + 1;
      });

      console.log(`📊 Análise de randomização (${days} dias):`, analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Erro na análise:', error);
      return null;
    }
  }

  // Verificar eficácia da randomização global
  static async analyzeGlobalRandomization(competitionId?: string) {
    try {
      let query = supabase
        .from('user_word_history')
        .select('word, category, user_id');

      if (competitionId) {
        query = query.eq('competition_id', competitionId);
      }

      const { data: history, error } = await query;

      if (error || !history) {
        console.error('❌ Erro ao buscar dados globais:', error);
        return null;
      }

      const analysis = {
        totalEntries: history.length,
        uniqueWords: new Set(history.map(h => h.word)).size,
        uniqueUsers: new Set(history.map(h => h.user_id)).size,
        categorySpread: {} as Record<string, Set<string>>,
        userWordOverlap: 0
      };

      // Analisar spread de categorias por usuário
      history.forEach(item => {
        if (!analysis.categorySpread[item.category]) {
          analysis.categorySpread[item.category] = new Set();
        }
        analysis.categorySpread[item.category].add(item.user_id);
      });

      // Calcular overlap de palavras entre usuários
      const userWords = {} as Record<string, Set<string>>;
      history.forEach(item => {
        if (!userWords[item.user_id]) {
          userWords[item.user_id] = new Set();
        }
        userWords[item.user_id].add(item.word);
      });

      const users = Object.keys(userWords);
      let totalComparisons = 0;
      let overlappingPairs = 0;

      for (let i = 0; i < users.length; i++) {
        for (let j = i + 1; j < users.length; j++) {
          totalComparisons++;
          const user1Words = userWords[users[i]];
          const user2Words = userWords[users[j]];
          
          const intersection = new Set([...user1Words].filter(w => user2Words.has(w)));
          if (intersection.size > 0) {
            overlappingPairs++;
          }
        }
      }

      analysis.userWordOverlap = totalComparisons > 0 
        ? (overlappingPairs / totalComparisons) * 100 
        : 0;

      console.log('🌍 Análise global de randomização:', analysis);
      return analysis;
    } catch (error) {
      console.error('❌ Erro na análise global:', error);
      return null;
    }
  }

  // Gerar relatório de performance da randomização
  static async generateRandomizationReport() {
    try {
      console.log('📋 Gerando relatório de performance da randomização...');

      // Análise dos últimos 7 dias
      const { data: recentHistory } = await supabase
        .from('user_word_history')
        .select('*')
        .gte('used_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

      if (!recentHistory) return null;

      const report = {
        periodAnalyzed: '7 dias',
        totalWordUsages: recentHistory.length,
        uniqueWords: new Set(recentHistory.map(h => h.word)).size,
        activeUsers: new Set(recentHistory.map(h => h.user_id)).size,
        categoriesUsed: new Set(recentHistory.map(h => h.category)).size,
        averageWordsPerUser: 0,
        repetitionRate: 0,
        categoryBalance: {} as Record<string, number>
      };

      // Calcular médias
      const userWordCount = {} as Record<string, number>;
      recentHistory.forEach(item => {
        userWordCount[item.user_id] = (userWordCount[item.user_id] || 0) + 1;
      });

      report.averageWordsPerUser = report.activeUsers > 0 
        ? report.totalWordUsages / report.activeUsers 
        : 0;

      // Taxa de repetição
      const wordCounts = {} as Record<string, number>;
      recentHistory.forEach(item => {
        wordCounts[item.word] = (wordCounts[item.word] || 0) + 1;
      });

      const repeatedWords = Object.values(wordCounts).filter(count => count > 1).length;
      report.repetitionRate = (repeatedWords / report.uniqueWords) * 100;

      // Balanço de categorias
      recentHistory.forEach(item => {
        report.categoryBalance[item.category] = 
          (report.categoryBalance[item.category] || 0) + 1;
      });

      console.log('📊 Relatório de randomização:', report);
      return report;
    } catch (error) {
      console.error('❌ Erro ao gerar relatório:', error);
      return null;
    }
  }
}
