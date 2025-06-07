
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
    
    // Tentar colocar cada palavra no tabuleiro
    for (const word of words) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Escolher direção aleatória
        const direction = directions[Math.floor(Math.random() * directions.length)];
        
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
        
        // Posição inicial aleatória
        const startRow = Math.floor(Math.random() * maxRow);
        const startCol = Math.floor(Math.random() * maxCol);
        
        // Verificar se a posição está livre
        const positions: Position[] = [];
        let canPlace = true;
        
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
          
          positions.push({ row, col });
          
          // Verificar se a posição está ocupada por outra palavra
          if (board[row][col] !== '' && board[row][col] !== word[i]) {
            canPlace = false;
            break;
          }
        }
        
        if (canPlace) {
          // Colocar a palavra
          positions.forEach((pos, i) => {
            board[pos.row][pos.col] = word[i];
          });
          
          placedWords.push({
            word,
            startRow,
            startCol,
            direction,
            positions
          });
          
          placed = true;
        }
      }
      
      // Se não conseguiu colocar a palavra, forçar horizontalmente
      if (!placed) {
        console.warn(`Não foi possível colocar a palavra ${word} aleatoriamente, forçando posição`);
        const startRow = Math.floor(Math.random() * size);
        const startCol = Math.min(Math.floor(Math.random() * size), size - word.length);
        
        for (let i = 0; i < word.length; i++) {
          board[startRow][startCol + i] = word[i];
        }
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
