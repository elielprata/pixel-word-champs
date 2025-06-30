
import { SmartWordDistributionService } from '@/services/smartWordDistributionService';
import { type Position, getBoardWidth, getMobileBoardWidth } from '@/utils/boardUtils';
import { isValidGameWord, normalizeText } from '@/utils/levelConfiguration';
import { logger } from '@/utils/logger';

export interface WordPlacementResult {
  board: string[][];
  placedWords: Array<{
    word: string;
    startRow: number;
    startCol: number;
    direction: 'horizontal' | 'vertical' | 'diagonal';
    positions: Position[];
  }>;
}

export class BoardGenerator {
  static generateSmartBoard(height: number, words: string[]): WordPlacementResult {
    const width = 12; // largura fixa agora é 12
    logger.log(`🚀 Iniciando geração do tabuleiro ${height}x${width} com distribuição inteligente (8 direções):`, words);
    
    // Normalizar e validar palavras - ajustar para nova largura máxima
    const normalizedWords = words
      .map(word => normalizeText(word))
      .filter(word => {
        const isValid = isValidGameWord(word, Math.max(height, width)); // Usar a dimensão maior
        if (!isValid) {
          logger.warn(`⚠️ Palavra "${word}" rejeitada na validação`);
        }
        return isValid;
      });
    
    if (normalizedWords.length === 0) {
      logger.error(`❌ CRÍTICO: Nenhuma palavra válida para tabuleiro ${height}x${width}`);
      
      // Gerar tabuleiro vazio mas funcional
      const emptyBoard = Array(height).fill(null).map(() => 
        Array(width).fill(null).map(() => 
          String.fromCharCode(65 + Math.floor(Math.random() * 26))
        )
      );
      
      return {
        board: emptyBoard,
        placedWords: []
      };
    }
    
    // Usar serviço de distribuição inteligente com 8 direções
    const distributionService = new SmartWordDistributionService(height, width);
    const result = distributionService.distributeWords(normalizedWords);
    
    // Validar resultado
    if (result.placedWords.length === 0) {
      logger.error(`❌ ERRO: Nenhuma palavra foi colocada no tabuleiro ${height}x${width}`);
    } else {
      logger.log(`✅ Tabuleiro gerado com distribuição inteligente (8 direções): ${result.placedWords.length}/${normalizedWords.length} palavras colocadas`);
      
      // Log da distribuição final
      const distribution = this.analyzeDistribution(result.placedWords);
      logger.log(`📊 Distribuição final:`, distribution);
    }
    
    return result;
  }

  private static analyzeDistribution(placedWords: Array<{ direction: string }>): object {
    const distribution = {
      horizontal: 0,
      vertical: 0,
      diagonal: 0,
      total: placedWords.length
    };

    for (const word of placedWords) {
      if (word.direction in distribution) {
        (distribution as any)[word.direction]++;
      }
    }

    return {
      ...distribution,
      percentages: {
        horizontal: ((distribution.horizontal / distribution.total) * 100).toFixed(1) + '%',
        vertical: ((distribution.vertical / distribution.total) * 100).toFixed(1) + '%',
        diagonal: ((distribution.diagonal / distribution.total) * 100).toFixed(1) + '%'
      }
    };
  }
}
