
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

// Mapeamento de ícones baseado no título/tipo da competição
const competitionIconMap: Record<string, CompetitionIconConfig> = {
  // Palavras-chave para diferentes tipos de competição
  'relampago': {
    icon: Zap,
    colors: {
      primary: 'bg-yellow-500',
      secondary: 'from-yellow-50 to-yellow-100',
      background: 'bg-gradient-to-br from-yellow-50 to-amber-100',
      border: 'border-yellow-200'
    }
  },
  'furia': {
    icon: Flame,
    colors: {
      primary: 'bg-red-500',
      secondary: 'from-red-50 to-red-100',
      background: 'bg-gradient-to-br from-red-50 to-orange-100',
      border: 'border-red-200'
    }
  },
  'quebra': {
    icon: Puzzle,
    colors: {
      primary: 'bg-blue-500',
      secondary: 'from-blue-50 to-blue-100',
      background: 'bg-gradient-to-br from-blue-50 to-indigo-100',
      border: 'border-blue-200'
    }
  },
  'desafio': {
    icon: Target,
    colors: {
      primary: 'bg-green-500',
      secondary: 'from-green-50 to-green-100',
      background: 'bg-gradient-to-br from-green-50 to-emerald-100',
      border: 'border-green-200'
    }
  },
  'campeonato': {
    icon: Crown,
    colors: {
      primary: 'bg-purple-500',
      secondary: 'from-purple-50 to-purple-100',
      background: 'bg-gradient-to-br from-purple-50 to-violet-100',
      border: 'border-purple-200'
    }
  },
  'estrela': {
    icon: Star,
    colors: {
      primary: 'bg-amber-500',
      secondary: 'from-amber-50 to-amber-100',
      background: 'bg-gradient-to-br from-amber-50 to-yellow-100',
      border: 'border-amber-200'
    }
  },
  'turbo': {
    icon: Rocket,
    colors: {
      primary: 'bg-cyan-500',
      secondary: 'from-cyan-50 to-cyan-100',
      background: 'bg-gradient-to-br from-cyan-50 to-teal-100',
      border: 'border-cyan-200'
    }
  },
  'diamante': {
    icon: Diamond,
    colors: {
      primary: 'bg-pink-500',
      secondary: 'from-pink-50 to-pink-100',
      background: 'bg-gradient-to-br from-pink-50 to-rose-100',
      border: 'border-pink-200'
    }
  }
};

// Função para obter configuração do ícone baseada no título
export const getCompetitionIconConfig = (title: string): CompetitionIconConfig => {
  const titleLower = title.toLowerCase();
  
  // Procurar por palavras-chave no título
  for (const [keyword, config] of Object.entries(competitionIconMap)) {
    if (titleLower.includes(keyword)) {
      return config;
    }
  }
  
  // Fallback baseado no hash do título para consistência
  const hash = titleLower.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  const fallbackIcons = [
    competitionIconMap.desafio,
    competitionIconMap.estrela,
    competitionIconMap.quebra,
    competitionIconMap.turbo
  ];
  
  return fallbackIcons[Math.abs(hash) % fallbackIcons.length];
};

// Função para gerar ícone único baseado no ID da competição
export const getCompetitionIconById = (competitionId: string): CompetitionIconConfig => {
  const icons = Object.values(competitionIconMap);
  const hash = competitionId.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  
  return icons[Math.abs(hash) % icons.length];
};
