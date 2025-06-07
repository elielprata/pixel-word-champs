
import { useState, useCallback, useEffect } from 'react';
import { getBoardSize, getLevelWords, type PlacedWord, type Position } from '@/utils/boardUtils';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number) => {
  const generateSmartBoard = useCallback((size: number, words: string[]): BoardData => {
    const board: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const placedWords: PlacedWord[] = [];
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    // Função para verificar se uma palavra pode ser colocada em uma posição
    const canPlaceWord = (word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): boolean => {
      for (let i = 0; i < word.length; i++) {
        let row = startRow;
        let col = startCol;
        
        switch (direction) {
          case 'horizontal':
            col += i;
            break;
          case 'vertical':
            row += i;
            break;
          case 'diagonal':
            row += i;
            col += i;
            break;
        }
        
        // Verificar se está dentro dos limites
        if (row >= size || col >= size || row < 0 || col < 0) {
          return false;
        }
        
        // Verificar se a posição está ocupada por uma letra diferente
        if (board[row][col] !== '' && board[row][col] !== word[i]) {
          return false;
        }
      }
      return true;
    };
    
    // Função para colocar uma palavra no tabuleiro
    const placeWord = (word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): Position[] => {
      const positions: Position[] = [];
      
      for (let i = 0; i < word.length; i++) {
        let row = startRow;
        let col = startCol;
        
        switch (direction) {
          case 'horizontal':
            col += i;
            break;
          case 'vertical':
            row += i;
            break;
          case 'diagonal':
            row += i;
            col += i;
            break;
        }
        
        board[row][col] = word[i];
        positions.push({ row, col });
      }
      
      return positions;
    };
    
    // Tentar colocar cada palavra no tabuleiro com múltiplas tentativas
    for (const word of words) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 200; // Aumentar tentativas
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Embaralhar direções para variedade
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        for (const direction of shuffledDirections) {
          // Calcular limites baseados na direção e tamanho da palavra
          let maxRow, maxCol;
          switch (direction) {
            case 'horizontal':
              maxRow = size;
              maxCol = size - word.length + 1;
              break;
            case 'vertical':
              maxRow = size - word.length + 1;
              maxCol = size;
              break;
            case 'diagonal':
              maxRow = size - word.length + 1;
              maxCol = size - word.length + 1;
              break;
          }
          
          if (maxRow <= 0 || maxCol <= 0) continue;
          
          // Tentar várias posições aleatórias
          for (let posAttempt = 0; posAttempt < 20; posAttempt++) {
            const startRow = Math.floor(Math.random() * maxRow);
            const startCol = Math.floor(Math.random() * maxCol);
            
            if (canPlaceWord(word, startRow, startCol, direction)) {
              const positions = placeWord(word, startRow, startCol, direction);
              
              placedWords.push({
                word,
                startRow,
                startCol,
                direction,
                positions
              });
              
              placed = true;
              console.log(`Palavra "${word}" colocada com sucesso na direção ${direction}`);
              break;
            }
          }
          
          if (placed) break;
        }
      }
      
      // Se ainda não conseguiu colocar, forçar colocação simples
      if (!placed) {
        console.warn(`Forçando colocação da palavra ${word}`);
        
        // Tentar colocação horizontal simples
        const maxCol = Math.max(0, size - word.length);
        for (let row = 0; row < size && !placed; row++) {
          for (let col = 0; col <= maxCol && !placed; col++) {
            // Verificar se há espaço livre
            let canPlace = true;
            for (let i = 0; i < word.length; i++) {
              if (board[row][col + i] !== '') {
                canPlace = false;
                break;
              }
            }
            
            if (canPlace) {
              const positions: Position[] = [];
              for (let i = 0; i < word.length; i++) {
                board[row][col + i] = word[i];
                positions.push({ row, col: col + i });
              }
              
              placedWords.push({
                word,
                startRow: row,
                startCol: col,
                direction: 'horizontal',
                positions
              });
              
              placed = true;
              console.log(`Palavra "${word}" forçada horizontalmente`);
            }
          }
        }
      }
      
      if (!placed) {
        console.error(`Não foi possível colocar a palavra: ${word}`);
      }
    }
    
    // Preencher espaços vazios com letras aleatórias
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '') {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
    
    // Verificar se todas as palavras foram colocadas
    console.log(`Palavras colocadas: ${placedWords.length}/${words.length}`);
    placedWords.forEach(pw => {
      console.log(`- ${pw.word}: ${pw.direction} em (${pw.startRow}, ${pw.startCol})`);
    });
    
    return { board, placedWords };
  }, []);

  const size = getBoardSize(level);
  const levelWords = getLevelWords(level);
  const [boardData, setBoardData] = useState<BoardData>(() => generateSmartBoard(size, levelWords));

  // Regenera o tabuleiro quando o nível muda
  useEffect(() => {
    const newSize = getBoardSize(level);
    const newLevelWords = getLevelWords(level);
    setBoardData(generateSmartBoard(newSize, newLevelWords));
  }, [level, generateSmartBoard]);

  return {
    boardData,
    size,
    levelWords
  };
};
