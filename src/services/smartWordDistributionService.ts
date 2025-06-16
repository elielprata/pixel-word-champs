
import { type Position, type PlacedWord } from '@/utils/boardUtils';
import { logger } from '@/utils/logger';

interface WordPlacementCandidate {
  word: string;
  row: number;
  col: number;
  direction: 'horizontal' | 'vertical' | 'diagonal';
  positions: Position[];
  score: number;
}

interface DistributionMetrics {
  horizontal: number;
  vertical: number;
  diagonal: number;
  centerDistance: number;
  wordSeparation: number;
}

export class SmartWordDistributionService {
  private height: number;
  private width: number;
  private board: string[][];
  private placedWords: PlacedWord[] = [];

  constructor(height: number, width: number = 8) {
    this.height = height;
    this.width = width;
    this.board = Array(height).fill(null).map(() => Array(width).fill(''));
  }

  public distributeWords(words: string[]): { board: string[][]; placedWords: PlacedWord[] } {
    logger.info('🎯 Iniciando distribuição inteligente de palavras', {
      wordsCount: words.length,
      boardSize: `${this.height}x${this.width}`
    }, 'SMART_DISTRIBUTION');

    // Ordenar palavras por tamanho (maiores primeiro para melhor colocação)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);

    for (const word of sortedWords) {
      this.placeWordOptimally(word);
    }

    // Preencher espaços vazios
    this.fillEmptySpaces();

    logger.info('✅ Distribuição inteligente concluída', {
      placedWords: this.placedWords.length,
      distribution: this.getDistributionStats()
    }, 'SMART_DISTRIBUTION');

    return {
      board: this.board.map(row => [...row]),
      placedWords: [...this.placedWords]
    };
  }

  private placeWordOptimally(word: string): boolean {
    const candidates = this.generatePlacementCandidates(word);
    
    if (candidates.length === 0) {
      logger.warn(`⚠️ Nenhuma posição válida encontrada para "${word}"`, undefined, 'SMART_DISTRIBUTION');
      return false;
    }

    // Ordenar candidatos por score (melhor distribuição primeiro)
    candidates.sort((a, b) => b.score - a.score);
    
    const bestCandidate = candidates[0];
    this.placeWord(bestCandidate);
    
    logger.debug(`✅ Palavra "${word}" colocada ${bestCandidate.direction} em (${bestCandidate.row}, ${bestCandidate.col}) com score ${bestCandidate.score.toFixed(2)}`, undefined, 'SMART_DISTRIBUTION');
    
    return true;
  }

  private generatePlacementCandidates(word: string): WordPlacementCandidate[] {
    const candidates: WordPlacementCandidate[] = [];

    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        // Tentar todas as direções
        const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
        
        for (const direction of directions) {
          const positions = this.getWordPositions(word, row, col, direction);
          
          if (this.canPlaceWord(word, positions)) {
            const score = this.calculatePlacementScore(word, row, col, direction, positions);
            
            candidates.push({
              word,
              row,
              col,
              direction,
              positions,
              score
            });
          }
        }
      }
    }

    return candidates;
  }

  private calculatePlacementScore(
    word: string, 
    row: number, 
    col: number, 
    direction: 'horizontal' | 'vertical' | 'diagonal',
    positions: Position[]
  ): number {
    let score = 0;

    // 1. Pontuação por distribuição de direções (evitar concentração)
    const currentDistribution = this.getDistributionStats();
    const directionBalance = this.calculateDirectionBalance(direction, currentDistribution);
    score += directionBalance * 40;

    // 2. Pontuação por distância de outras palavras (evitar proximidade)
    const separationScore = this.calculateSeparationScore(positions);
    score += separationScore * 30;

    // 3. Pontuação por distância do centro (distribuir pelo tabuleiro)
    const centerDistance = this.calculateCenterDistance(row, col, word.length, direction);
    const centerScore = this.calculateCenterScore(centerDistance);
    score += centerScore * 20;

    // 4. Penalizar bordas excessivas
    const borderPenalty = this.calculateBorderPenalty(positions);
    score -= borderPenalty * 10;

    // 5. Bonificar intersecções controladas
    const intersectionBonus = this.calculateIntersectionBonus(word, positions);
    score += intersectionBonus * 15;

    return score;
  }

  private calculateDirectionBalance(
    direction: 'horizontal' | 'vertical' | 'diagonal',
    currentDistribution: DistributionMetrics
  ): number {
    const total = currentDistribution.horizontal + currentDistribution.vertical + currentDistribution.diagonal;
    
    if (total === 0) return 1; // Primeira palavra sempre tem score máximo
    
    const currentRatio = {
      horizontal: currentDistribution.horizontal / total,
      vertical: currentDistribution.vertical / total,
      diagonal: currentDistribution.diagonal / total
    };

    // Preferir direção menos utilizada
    const idealRatio = 1/3; // 33% para cada direção
    const currentDirectionRatio = currentRatio[direction];
    
    return Math.max(0, idealRatio - currentDirectionRatio) * 3;
  }

  private calculateSeparationScore(positions: Position[]): number {
    let minDistance = Infinity;

    for (const placedWord of this.placedWords) {
      for (const newPos of positions) {
        for (const existingPos of placedWord.positions) {
          const distance = Math.sqrt(
            Math.pow(newPos.row - existingPos.row, 2) + 
            Math.pow(newPos.col - existingPos.col, 2)
          );
          minDistance = Math.min(minDistance, distance);
        }
      }
    }

    if (minDistance === Infinity) return 1; // Primeira palavra

    // Bonificar distâncias maiores que 2, penalizar menores
    return Math.min(1, Math.max(0, (minDistance - 1) / 3));
  }

  private calculateCenterDistance(
    row: number, 
    col: number, 
    wordLength: number, 
    direction: 'horizontal' | 'vertical' | 'diagonal'
  ): number {
    const centerRow = this.height / 2;
    const centerCol = this.width / 2;
    
    let wordCenterRow = row;
    let wordCenterCol = col;

    switch (direction) {
      case 'horizontal':
        wordCenterCol = col + wordLength / 2;
        break;
      case 'vertical':
        wordCenterRow = row + wordLength / 2;
        break;
      case 'diagonal':
        wordCenterRow = row + wordLength / 2;
        wordCenterCol = col + wordLength / 2;
        break;
    }

    return Math.sqrt(
      Math.pow(wordCenterRow - centerRow, 2) + 
      Math.pow(wordCenterCol - centerCol, 2)
    );
  }

  private calculateCenterScore(distance: number): number {
    const maxDistance = Math.sqrt(Math.pow(this.height/2, 2) + Math.pow(this.width/2, 2));
    
    // Preferir posições não muito centrais nem muito nas bordas
    const normalizedDistance = distance / maxDistance;
    const idealDistance = 0.4; // 40% da distância máxima
    
    return 1 - Math.abs(normalizedDistance - idealDistance);
  }

  private calculateBorderPenalty(positions: Position[]): number {
    let borderCells = 0;
    
    for (const pos of positions) {
      if (pos.row === 0 || pos.row === this.height - 1 || 
          pos.col === 0 || pos.col === this.width - 1) {
        borderCells++;
      }
    }
    
    return borderCells / positions.length;
  }

  private calculateIntersectionBonus(word: string, positions: Position[]): number {
    let intersections = 0;
    
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const currentLetter = this.board[pos.row][pos.col];
      
      if (currentLetter !== '' && currentLetter === word[i]) {
        intersections++;
      }
    }
    
    // Bonificar intersecções limitadas (máximo 2 por palavra)
    return Math.min(intersections / positions.length, 0.3);
  }

  private canPlaceWord(word: string, positions: Position[]): boolean {
    // Verificar limites do tabuleiro
    for (const pos of positions) {
      if (pos.row < 0 || pos.row >= this.height || 
          pos.col < 0 || pos.col >= this.width) {
        return false;
      }
    }

    // Verificar conflitos (permitir intersecções apenas com letras iguais)
    for (let i = 0; i < positions.length; i++) {
      const pos = positions[i];
      const currentLetter = this.board[pos.row][pos.col];
      
      if (currentLetter !== '' && currentLetter !== word[i]) {
        return false;
      }
    }

    return true;
  }

  private getWordPositions(
    word: string, 
    row: number, 
    col: number, 
    direction: 'horizontal' | 'vertical' | 'diagonal'
  ): Position[] {
    const positions: Position[] = [];
    
    for (let i = 0; i < word.length; i++) {
      let newRow = row;
      let newCol = col;
      
      switch (direction) {
        case 'horizontal':
          newCol = col + i;
          break;
        case 'vertical':
          newRow = row + i;
          break;
        case 'diagonal':
          newRow = row + i;
          newCol = col + i;
          break;
      }
      
      positions.push({ row: newRow, col: newCol });
    }
    
    return positions;
  }

  private placeWord(candidate: WordPlacementCandidate): void {
    // Colocar letras no tabuleiro
    for (let i = 0; i < candidate.positions.length; i++) {
      const pos = candidate.positions[i];
      this.board[pos.row][pos.col] = candidate.word[i];
    }

    // Adicionar à lista de palavras colocadas
    this.placedWords.push({
      word: candidate.word,
      startRow: candidate.row,
      startCol: candidate.col,
      direction: candidate.direction,
      positions: [...candidate.positions]
    });
  }

  private getDistributionStats(): DistributionMetrics {
    const stats = {
      horizontal: 0,
      vertical: 0,
      diagonal: 0,
      centerDistance: 0,
      wordSeparation: 0
    };

    for (const word of this.placedWords) {
      stats[word.direction]++;
    }

    return stats;
  }

  private fillEmptySpaces(): void {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let filledCount = 0;
    
    for (let row = 0; row < this.height; row++) {
      for (let col = 0; col < this.width; col++) {
        if (this.board[row][col] === '') {
          this.board[row][col] = letters[Math.floor(Math.random() * letters.length)];
          filledCount++;
        }
      }
    }
    
    logger.debug(`🔤 Preenchidas ${filledCount} células vazias`, undefined, 'SMART_DISTRIBUTION');
  }
}
