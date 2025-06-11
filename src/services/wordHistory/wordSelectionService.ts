
import { supabase } from '@/integrations/supabase/client';
import { wordRetrievalService } from './wordRetrievalService';
import type { WordSelectionCriteria, WordWithMetadata } from '@/types/wordHistory';

export class WordSelectionService {
  // Selecionar palavras com máxima randomização
  async selectRandomizedWords(criteria: WordSelectionCriteria): Promise<string[]> {
    try {
      const { userId, level, competitionId, excludeCategories = [], maxWordsNeeded } = criteria;
      
      console.log(`🎲 Iniciando seleção randomizada para usuário ${userId}, nível ${level}`);

      // Buscar histórico pessoal (últimos 14 dias)
      const userHistory = await wordRetrievalService.getUserWordHistory(userId, 14);
      
      // Buscar histórico da competição se especificada
      const competitionHistory = competitionId 
        ? await wordRetrievalService.getCompetitionWordHistory(competitionId)
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
        const recentHistory = await wordRetrievalService.getUserWordHistory(userId, 3);
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
  private randomizeSelection(words: WordWithMetadata[], count: number): string[] {
    if (words.length === 0) return [];
    
    // Agrupar por categoria para garantir diversidade
    const wordsByCategory = words.reduce((acc, word) => {
      const category = word.category || 'geral';
      if (!acc[category]) acc[category] = [];
      acc[category].push(word);
      return acc;
    }, {} as Record<string, WordWithMetadata[]>);

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
    wordsByCategory: Record<string, WordWithMetadata[]>
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
}

export const wordSelectionService = new WordSelectionService();
