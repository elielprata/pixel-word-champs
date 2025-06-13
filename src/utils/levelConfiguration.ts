
// Distribuição desejada por dificuldade (sem relação com tamanho)
export const DIFFICULTY_DISTRIBUTION = {
  easy: 2,    // 2 palavras fáceis
  medium: 1,  // 1 palavra média
  hard: 1,    // 1 palavra difícil
  expert: 1   // 1 palavra expert
};

// Normalizar texto removendo acentos e caracteres especiais
export const normalizeText = (text: string): string => {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .toUpperCase()
    .replace(/[^A-Z]/g, ''); // Remove caracteres não alfabéticos
};

// Palavras padrão otimizadas para tabuleiro 10x10 (sem acentos)
export const getDefaultWordsForSize = (boardSize: number): string[] => {
  console.log(`🎯 Gerando palavras padrão para tabuleiro ${boardSize}x${boardSize}`);
  
  // Para tabuleiro 10x10 fixo, sempre usar essas palavras testadas
  const defaultWords10x10 = [
    'CASA',      // 4 letras
    'AMOR',      // 4 letras  
    'VIDA',      // 4 letras
    'TEMPO',     // 5 letras
    'MUNDO',     // 5 letras
    'AGUA',      // 4 letras (sem acento)
    'TERRA',     // 5 letras
    'FOGO',      // 4 letras
    'VENTO',     // 5 letras
    'PEDRA'      // 5 letras
  ];
  
  // Selecionar 5 palavras das 10 disponíveis
  const shuffled = [...defaultWords10x10].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 5);
  
  console.log(`✅ Palavras padrão selecionadas:`, selected);
  return selected;
};

// Validar se uma palavra é adequada para o jogo
export const isValidGameWord = (word: string, maxLength: number = 10): boolean => {
  if (!word || typeof word !== 'string') {
    console.warn(`❌ Palavra inválida (não é string):`, word);
    return false;
  }
  
  const normalizedWord = normalizeText(word);
  
  if (normalizedWord.length < 3) {
    console.warn(`❌ Palavra "${word}" muito pequena (${normalizedWord.length} letras)`);
    return false;
  }
  
  if (normalizedWord.length > maxLength) {
    console.warn(`❌ Palavra "${word}" muito grande (${normalizedWord.length} letras) para tabuleiro ${maxLength}x${maxLength}`);
    return false;
  }
  
  if (!/^[A-Z]+$/.test(normalizedWord)) {
    console.warn(`❌ Palavra "${word}" contém caracteres inválidos após normalização: "${normalizedWord}"`);
    return false;
  }
  
  console.log(`✅ Palavra "${word}" → "${normalizedWord}" é válida`);
  return true;
};
