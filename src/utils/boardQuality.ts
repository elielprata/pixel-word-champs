
import { type Position, type PlacedWord } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface RegionDensity {
  quadrant: number;
  wordCount: number;
  density: number;
}

interface QualityMetrics {
  uniformDistribution: number;
  averageDistance: number;
  regionBalance: number;
  overallQuality: number;
}

export class BoardQualityAnalyzer {
  private height: number;
  private width: number;

  constructor(height: number, width: number) {
    this.height = height;
    this.width = width;
  }

  public analyzeQuality(placedWords: PlacedWord[]): QualityMetrics {
    const uniformDistribution = this.calculateUniformDistribution(placedWords);
    const averageDistance = this.calculateAverageDistance(placedWords);
    const regionBalance = this.calculateRegionBalance(placedWords);
    
    const overallQuality = (uniformDistribution + averageDistance + regionBalance) / 3;

    return {
      uniformDistribution,
      averageDistance,
      regionBalance,
      overallQuality
    };
  }

  public shouldRegenerate(placedWords: PlacedWord[]): boolean {
    const metrics = this.analyzeQuality(placedWords);
    const threshold = 0.6; // Qualidade mínima aceitável (60%)
    
    logger.debug('📊 Análise de qualidade do tabuleiro', {
      metrics,
      threshold,
      shouldRegenerate: metrics.overallQuality < threshold
    }, 'BOARD_QUALITY');

    return metrics.overallQuality < threshold;
  }

  public calculateMinimumDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.row - pos2.row, 2) + 
      Math.pow(pos1.col - pos2.col, 2)
    );
  }

  private calculateUniformDistribution(placedWords: PlacedWord[]): number {
    if (placedWords.length === 0) return 0;

    const quadrants = this.analyzeQuadrants(placedWords);
    const expectedWordsPerQuadrant = placedWords.length / 4;
    
    let uniformityScore = 0;
    for (const quadrant of quadrants) {
      const deviation = Math.abs(quadrant.wordCount - expectedWordsPerQuadrant);
      const normalizedDeviation = deviation / expectedWordsPerQuadrant;
      uniformityScore += Math.max(0, 1 - normalizedDeviation);
    }

    return uniformityScore / 4;
  }

  private calculateAverageDistance(placedWords: PlacedWord[]): number {
    if (placedWords.length < 2) return 1;

    let totalDistance = 0;
    let pairCount = 0;

    for (let i = 0; i < placedWords.length; i++) {
      for (let j = i + 1; j < placedWords.length; j++) {
        const word1Start = { row: placedWords[i].startRow, col: placedWords[i].startCol };
        const word2Start = { row: placedWords[j].startRow, col: placedWords[j].startCol };
        
        totalDistance += this.calculateMinimumDistance(word1Start, word2Start);
        pairCount++;
      }
    }

    const averageDistance = totalDistance / pairCount;
    const maxPossibleDistance = Math.sqrt(
      Math.pow(this.height, 2) + Math.pow(this.width, 2)
    );

    return Math.min(1, averageDistance / (maxPossibleDistance * 0.3));
  }

  private calculateRegionBalance(placedWords: PlacedWord[]): number {
    const quadrants = this.analyzeQuadrants(placedWords);
    const densities = quadrants.map(q => q.density);
    
    const maxDensity = Math.max(...densities);
    const minDensity = Math.min(...densities);
    
    if (maxDensity === 0) return 1;
    
    return 1 - (maxDensity - minDensity) / maxDensity;
  }

  private analyzeQuadrants(placedWords: PlacedWord[]): RegionDensity[] {
    const midRow = this.height / 2;
    const midCol = this.width / 2;
    const quadrants: RegionDensity[] = [
      { quadrant: 1, wordCount: 0, density: 0 }, // Superior esquerdo
      { quadrant: 2, wordCount: 0, density: 0 }, // Superior direito
      { quadrant: 3, wordCount: 0, density: 0 }, // Inferior esquerdo
      { quadrant: 4, wordCount: 0, density: 0 }  // Inferior direito
    ];

    for (const word of placedWords) {
      const startRow = word.startRow;
      const startCol = word.startCol;

      if (startRow < midRow && startCol < midCol) {
        quadrants[0].wordCount++;
      } else if (startRow < midRow && startCol >= midCol) {
        quadrants[1].wordCount++;
      } else if (startRow >= midRow && startCol < midCol) {
        quadrants[2].wordCount++;
      } else {
        quadrants[3].wordCount++;
      }
    }

    // Calcular densidade (palavras por área)
    const quadrantArea = (this.height * this.width) / 4;
    for (const quadrant of quadrants) {
      quadrant.density = quadrant.wordCount / quadrantArea;
    }

    return quadrants;
  }
}

// Utilitário para embaralhar arrays
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}
