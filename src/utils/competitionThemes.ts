
interface CompetitionTheme {
  gradient: string;
  borderColor: string;
  bgPattern: string;
  emoji: string;
  backgroundImage: string;
  decorativeElements: {
    primary: string;
    secondary: string;
  };
  timeColors: {
    urgent: string;
    warning: string;
    safe: string;
  };
}

const competitionThemes: Record<string, CompetitionTheme> = {
  geral: {
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    borderColor: 'border-amber-200/60 hover:border-amber-300',
    bgPattern: 'rgba(217, 119, 6, 0.1)',
    emoji: '🎯',
    backgroundImage: 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-amber-400',
      secondary: 'bg-orange-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-emerald-600'
    }
  },
  animais: {
    gradient: 'from-green-50 via-emerald-50 to-teal-50',
    borderColor: 'border-green-200/60 hover:border-green-300',
    bgPattern: 'rgba(34, 197, 94, 0.1)',
    emoji: '🦁',
    backgroundImage: 'https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-green-400',
      secondary: 'bg-emerald-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-green-600'
    }
  },
  esportes: {
    gradient: 'from-blue-50 via-sky-50 to-cyan-50',
    borderColor: 'border-blue-200/60 hover:border-blue-300',
    bgPattern: 'rgba(59, 130, 246, 0.1)',
    emoji: '⚽',
    backgroundImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-blue-400',
      secondary: 'bg-sky-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-blue-600'
    }
  },
  tecnologia: {
    gradient: 'from-purple-50 via-violet-50 to-indigo-50',
    borderColor: 'border-purple-200/60 hover:border-purple-300',
    bgPattern: 'rgba(147, 51, 234, 0.1)',
    emoji: '💻',
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-purple-400',
      secondary: 'bg-violet-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-purple-600'
    }
  },
  ciencias: {
    gradient: 'from-pink-50 via-rose-50 to-red-50',
    borderColor: 'border-pink-200/60 hover:border-pink-300',
    bgPattern: 'rgba(236, 72, 153, 0.1)',
    emoji: '🔬',
    backgroundImage: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-pink-400',
      secondary: 'bg-rose-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-pink-600'
    }
  },
  geografia: {
    gradient: 'from-slate-50 via-gray-50 to-zinc-50',
    borderColor: 'border-slate-200/60 hover:border-slate-300',
    bgPattern: 'rgba(71, 85, 105, 0.1)',
    emoji: '🌍',
    backgroundImage: 'https://images.unsplash.com/photo-1493962853295-0fd70327578a?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-slate-400',
      secondary: 'bg-gray-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-slate-600'
    }
  },
  historia: {
    gradient: 'from-yellow-50 via-amber-50 to-orange-50',
    borderColor: 'border-yellow-200/60 hover:border-yellow-300',
    bgPattern: 'rgba(245, 158, 11, 0.1)',
    emoji: '📚',
    backgroundImage: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=400&h=300&fit=crop&crop=center&auto=format&q=75',
    decorativeElements: {
      primary: 'bg-yellow-400',
      secondary: 'bg-amber-400'
    },
    timeColors: {
      urgent: 'text-red-600',
      warning: 'text-orange-600',
      safe: 'text-yellow-600'
    }
  }
};

// Tema padrão caso a categoria não seja encontrada
const defaultTheme: CompetitionTheme = competitionThemes.geral;

export const getCompetitionTheme = (category?: string): CompetitionTheme => {
  if (!category) return defaultTheme;
  
  const normalizedCategory = category.toLowerCase().trim();
  return competitionThemes[normalizedCategory] || defaultTheme;
};

export const getCategoryEmoji = (category?: string): string => {
  if (!category) return '🎯';
  
  const theme = getCompetitionTheme(category);
  return theme.emoji;
};
