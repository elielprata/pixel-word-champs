
import { useState, useCallback, useEffect } from 'react';
import { getBoardSize, getLevelWords, type PlacedWord, type Position } from '@/utils/boardUtils';

interface BoardData {
  board: string[][];
  placedWords: PlacedWord[];
}

export const useBoard = (level: number) => {
  const generateSmartBoard = useCallback((size: number, words: string[]): BoardData => {
    let attempts = 0;
    const maxBoardAttempts = 5;
    
    while (attempts < maxBoardAttempts) {
      attempts++;
      console.log(`Tentativa ${attempts} de gerar o tabuleiro para o nível ${level}`);
      
      const result = generateSingleBoard(size, words);
      
      // Verificar se todas as palavras foram colocadas
      if (result.placedWords.length === words.length) {
        console.log(`✅ Tabuleiro gerado com sucesso! Todas as ${words.length} palavras foram colocadas.`);
        return result;
      } else {
        console.warn(`⚠️ Tentativa ${attempts} falhou. Colocadas: ${result.placedWords.length}/${words.length} palavras`);
      }
    }
    
    // Se todas as tentativas falharam, usar método de força bruta
    console.log('🔄 Usando método de força bruta para garantir todas as palavras...');
    return generateBruteForceBoard(size, words);
  }, [level]);

  const generateSingleBoard = (size: number, words: string[]): BoardData => {
    const board: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const placedWords: PlacedWord[] = [];
    const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
    
    // Ordenar palavras por tamanho (maiores primeiro para melhor aproveitamento do espaço)
    const sortedWords = [...words].sort((a, b) => b.length - a.length);
    
    // Função para verificar se uma palavra pode ser colocada em uma posição
    const canPlaceWord = (word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): boolean => {
      const positions = getWordPositions(word, startRow, startCol, direction);
      
      // Verificar se todas as posições estão dentro dos limites
      if (!positions.every(pos => pos.row >= 0 && pos.row < size && pos.col >= 0 && pos.col < size)) {
        return false;
      }
      
      // Verificar conflitos com letras já colocadas
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        const existingLetter = board[pos.row][pos.col];
        
        if (existingLetter !== '' && existingLetter !== word[i]) {
          return false;
        }
      }
      
      return true;
    };
    
    const getWordPositions = (word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): Position[] => {
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
        
        positions.push({ row, col });
      }
      
      return positions;
    };
    
    // Função para colocar uma palavra no tabuleiro
    const placeWord = (word: string, startRow: number, startCol: number, direction: 'horizontal' | 'vertical' | 'diagonal'): Position[] => {
      const positions = getWordPositions(word, startRow, startCol, direction);
      
      for (let i = 0; i < positions.length; i++) {
        const pos = positions[i];
        board[pos.row][pos.col] = word[i];
      }
      
      return positions;
    };
    
    // Tentar colocar cada palavra
    for (const word of sortedWords) {
      let placed = false;
      let attempts = 0;
      const maxAttempts = 300;
      
      while (!placed && attempts < maxAttempts) {
        attempts++;
        
        // Embaralhar direções
        const shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
        
        for (const direction of shuffledDirections) {
          // Calcular limites baseados na direção
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
          
          // Tentar múltiplas posições
          for (let posAttempt = 0; posAttempt < 50; posAttempt++) {
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
              break;
            }
          }
          
          if (placed) break;
        }
      }
      
      if (!placed) {
        console.warn(`Não foi possível colocar a palavra: ${word}`);
        break; // Sair do loop principal se uma palavra não puder ser colocada
      }
    }
    
    // Preencher espaços vazios com letras aleatórias
    fillEmptySpaces(board, size);
    
    return { board, placedWords };
  };

  const generateBruteForceBoard = (size: number, words: string[]): BoardData => {
    const board: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    const placedWords: PlacedWord[] = [];
    
    // Colocar palavras uma por vez, garantindo que todas sejam colocadas
    for (let wordIndex = 0; wordIndex < words.length; wordIndex++) {
      const word = words[wordIndex];
      let placed = false;
      
      // Tentar todas as posições e direções possíveis
      const directions: Array<'horizontal' | 'vertical' | 'diagonal'> = ['horizontal', 'vertical', 'diagonal'];
      
      for (const direction of directions) {
        if (placed) break;
        
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
        
        for (let row = 0; row < maxRow && !placed; row++) {
          for (let col = 0; col < maxCol && !placed; col++) {
            // Verificar se pode colocar a palavra nesta posição
            let canPlace = true;
            const positions: Position[] = [];
            
            for (let i = 0; i < word.length; i++) {
              let checkRow = row;
              let checkCol = col;
              
              switch (direction) {
                case 'horizontal':
                  checkCol += i;
                  break;
                case 'vertical':
                  checkRow += i;
                  break;
                case 'diagonal':
                  checkRow += i;
                  checkCol += i;
                  break;
              }
              
              positions.push({ row: checkRow, col: checkCol });
              
              if (board[checkRow][checkCol] !== '' && board[checkRow][checkCol] !== word[i]) {
                canPlace = false;
                break;
              }
            }
            
            if (canPlace) {
              // Colocar a palavra
              for (let i = 0; i < word.length; i++) {
                const pos = positions[i];
                board[pos.row][pos.col] = word[i];
              }
              
              placedWords.push({
                word,
                startRow: row,
                startCol: col,
                direction,
                positions
              });
              
              placed = true;
              console.log(`✅ Palavra "${word}" colocada com força bruta em ${direction}`);
            }
          }
        }
      }
      
      if (!placed) {
        console.error(`❌ ERRO CRÍTICO: Não foi possível colocar a palavra "${word}" mesmo com força bruta!`);
      }
    }
    
    // Preencher espaços vazios
    fillEmptySpaces(board, size);
    
    console.log(`🎯 Resultado final: ${placedWords.length}/${words.length} palavras colocadas`);
    return { board, placedWords };
  };

  const fillEmptySpaces = (board: string[][], size: number) => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (let row = 0; row < size; row++) {
      for (let col = 0; col < size; col++) {
        if (board[row][col] === '') {
          board[row][col] = letters[Math.floor(Math.random() * letters.length)];
        }
      }
    }
  };

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
