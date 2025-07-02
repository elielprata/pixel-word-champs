
import { 
  Zap, 
  Flame, 
  Puzzle, 
  Target, 
  Crown, 
  Star, 
  Rocket, 
  Trophy, 
  Diamond, 
  Sword,
  Shield,
  Gem,
  LucideIcon
} from 'lucide-react';

interface CompetitionIconConfig {
  icon: LucideIcon;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    border: string;
  };
}

// Pool expandido de ícones e cores
const iconPool: CompetitionIconConfig[] = [
  {
    icon: Zap,
    colors: {
      primary: 'bg-yellow-500',
      secondary: 'from-yellow-50 to-yellow-100',
      background: 'bg-gradient-to-br from-yellow-50 to-amber-100',
      border: 'border-yellow-200'
    }
  },
  {
    icon: Flame,
    colors: {
      primary: 'bg-red-500',
      secondary: 'from-red-50 to-red-100',
      background: 'bg-gradient-to-br from-red-50 to-orange-100',
      border: 'border-red-200'
    }
  },
  {
    icon: Puzzle,
    colors: {
      primary: 'bg-blue-500',
      secondary: 'from-blue-50 to-blue-100',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      border: 'border-blue-200'
    }
  },
  {
    icon: Target,
    colors: {
      primary: 'bg-green-500',
      secondary: 'from-green-50 to-green-100',
      background: 'bg-gradient-to-br from-green-50 to-emerald-100',
      border: 'border-green-200'
    }
  },
  {
    icon: Crown,
    colors: {
      primary: 'bg-purple-500',
      secondary: 'from-purple-50 to-purple-100',
      background: 'bg-gradient-to-br from-purple-50 to-violet-100',
      border: 'border-purple-200'
    }
  },
  {
    icon: Star,
    colors: {
      primary: 'bg-amber-500',
      secondary: 'from-amber-50 to-amber-100',
      background: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      border: 'border-amber-200'
    }
  },
  {
    icon: Rocket,
    colors: {
      primary: 'bg-cyan-500',
      secondary: 'from-cyan-50 to-cyan-100',
      background: 'bg-gradient-to-br from-cyan-50 to-teal-100',
      border: 'border-cyan-200'
    }
  },
  {
    icon: Trophy,
    colors: {
      primary: 'bg-orange-500',
      secondary: 'from-orange-50 to-orange-100',
      background: 'bg-gradient-to-br from-orange-50 to-amber-100',
      border: 'border-orange-200'
    }
  },
  {
    icon: Diamond,
    colors: {
      primary: 'bg-pink-500',
      secondary: 'from-pink-50 to-pink-100',
      background: 'bg-gradient-to-br from-pink-50 to-rose-100',
      border: 'border-pink-200'
    }
  },
  {
    icon: Sword,
    colors: {
      primary: 'bg-slate-500',
      secondary: 'from-slate-50 to-slate-100',
      background: 'bg-gradient-to-br from-slate-50 to-gray-100',
      border: 'border-slate-200'
    }
  },
  {
    icon: Shield,
    colors: {
      primary: 'bg-emerald-500',
      secondary: 'from-emerald-50 to-emerald-100',
      background: 'bg-gradient-to-br from-emerald-50 to-green-100',
      border: 'border-emerald-200'
    }
  },
  {
    icon: Gem,
    colors: {
      primary: 'bg-indigo-500',
      secondary: 'from-indigo-50 to-indigo-100',
      background: 'bg-gradient-to-br from-indigo-50 to-blue-100',
      border: 'border-indigo-200'
    }
  }
];

// Estado global para rastrear ícones em uso por competições ativas
const activeCompetitionIcons = new Map<string, number>();

// Função hash melhorada para garantir distribuição uniforme
const generateHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
};

// Função para encontrar um índice de ícone único para competições ativas
const findUniqueIconIndex = (competitionId: string, usedIndices: Set<number>): number => {
  let hash = generateHash(competitionId);
  let index = hash % iconPool.length;
  let attempts = 0;
  
  // Se o índice já está em uso, encontrar o próximo disponível
  while (usedIndices.has(index) && attempts < iconPool.length) {
    hash = generateHash(`${competitionId}_${attempts}`);
    index = hash % iconPool.length;
    attempts++;
  }
  
  return index;
};

// Função para obter configuração única baseada no ID da competição
export const getCompetitionIconConfig = (competitionId: string): CompetitionIconConfig => {
  // Se já tem um ícone atribuído, usar o mesmo
  if (activeCompetitionIcons.has(competitionId)) {
    const storedIndex = activeCompetitionIcons.get(competitionId)!;
    return iconPool[storedIndex];
  }
  
  // Obter todos os índices já em uso
  const usedIndices = new Set(Array.from(activeCompetitionIcons.values()));
  
  // Encontrar um índice único
  const uniqueIndex = findUniqueIconIndex(competitionId, usedIndices);
  
  // Armazenar o índice para esta competição
  activeCompetitionIcons.set(competitionId, uniqueIndex);
  
  return iconPool[uniqueIndex];
};

// Função para liberar um ícone quando uma competição termina
export const releaseCompetitionIcon = (competitionId: string): void => {
  activeCompetitionIcons.delete(competitionId);
};

// Função para limpar ícones de competições inativas
export const cleanupInactiveCompetitionIcons = (activeCompetitionIds: string[]): void => {
  const activeIds = new Set(activeCompetitionIds);
  
  // Remover ícones de competições que não estão mais ativas
  for (const [competitionId] of activeCompetitionIcons) {
    if (!activeIds.has(competitionId)) {
      activeCompetitionIcons.delete(competitionId);
    }
  }
};

// Manter compatibilidade com função baseada em ID
export const getCompetitionIconById = (competitionId: string): CompetitionIconConfig => {
  return getCompetitionIconConfig(competitionId);
};
