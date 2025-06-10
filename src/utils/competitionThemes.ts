
interface CompetitionTheme {
  gradient: string;
  borderColor: string;
  bgPattern: string;
  emoji: string;
  decorativeElements: {
    primary: string;
    secondary: string;
  };
  timeColors: {
    urgent: string;
    warning: string;
    safe: string;
  };
  description: string;
  texture: string;
}

const competitionThemes: Record<string, CompetitionTheme> = {
  geral: {
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    borderColor: 'border-amber-200/60 hover:border-amber-300',
    bgPattern: 'rgba(217, 119, 6, 0.1)',
    emoji: '🎯',
    description: 'Desafie seu vocabulário em 1 minuto! 🧠⚡',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Ctext x='5' y='15' font-size='12' font-family='monospace'%3EA%3C/text%3E%3Ctext x='25' y='35' font-size='10' font-family='monospace'%3Ez%3C/text%3E%3Ctext x='15' y='25' font-size='8' font-family='monospace'%3E?%3C/text%3E%3C/g%3E%3C/svg%3E")`,
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
    description: 'Descubra nomes de animais em 1 minuto! 🐍🦜',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2322c55e' fill-opacity='0.15'%3E%3Ccircle cx='8' cy='8' r='2'/%3E%3Ccircle cx='18' cy='18' r='1.5'/%3E%3Ccircle cx='28' cy='12' r='1'/%3E%3Ccircle cx='32' cy='32' r='2'/%3E%3Cpath d='M6 30c2-2 4-2 6 0s4 2 6 0' stroke='%2322c55e' stroke-width='1' fill='none'/%3E%3C/g%3E%3C/svg%3E")`,
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
    description: 'Mostre seu conhecimento esportivo em 1 minuto! 🏆⚡',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Ccircle cx='12' cy='12' r='6' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3Cpath d='M25 25l8 8M25 33l8-8' stroke='%233b82f6' stroke-width='2'/%3E%3Crect x='2' y='25' width='12' height='8' rx='2' fill='none' stroke='%233b82f6' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
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
    description: 'Desvende termos do mundo digital em 1 minuto! 🤖💡',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239333ea' fill-opacity='0.1'%3E%3Crect x='4' y='8' width='12' height='8' rx='1' fill='none' stroke='%239333ea' stroke-width='1'/%3E%3Ccircle cx='28' cy='8' r='3' fill='none' stroke='%239333ea' stroke-width='1'/%3E%3Cpath d='M6 24l4 4 8-8M24 28h12M24 32h8' stroke='%239333ea' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
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
    description: 'Explore o universo científico em 1 minuto! ⚗️🧪',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ec4899' fill-opacity='0.1'%3E%3Ccircle cx='10' cy='10' r='4' fill='none' stroke='%23ec4899' stroke-width='1'/%3E%3Cpath d='M20 8v8l-4 8h8l-4-8V8z' fill='none' stroke='%23ec4899' stroke-width='1'/%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3Cpath d='M25 15h10M25 20h8M25 25h6' stroke='%23ec4899' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
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
    description: 'Viaje pelo mundo em 1 minuto! 🗺️✈️',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23475569' fill-opacity='0.1'%3E%3Ccircle cx='20' cy='20' r='12' fill='none' stroke='%23475569' stroke-width='1'/%3E%3Cpath d='M8 20h24M20 8v24M12 12l16 16M28 12L12 28' stroke='%23475569' stroke-width='0.5'/%3E%3Cpath d='M15 15c3 0 3 3 6 3s3-3 6-3' fill='none' stroke='%23475569' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
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
    description: 'Desvende mistérios do passado em 1 minuto! 🏛️📜',
    texture: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f59e0b' fill-opacity='0.1'%3E%3Crect x='8' y='6' width='12' height='16' rx='1' fill='none' stroke='%23f59e0b' stroke-width='1'/%3E%3Cpath d='M10 10h8M10 13h6M10 16h8M10 19h4' stroke='%23f59e0b' stroke-width='1'/%3E%3Ccircle cx='28' cy='28' r='6' fill='none' stroke='%23f59e0b' stroke-width='1'/%3E%3Cpath d='M25 28h6M28 25v6' stroke='%23f59e0b' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E")`,
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

export const getCategoryDescription = (category?: string): string => {
  if (!category) return 'Desafie seu vocabulário em 1 minuto! 🧠⚡';
  
  const theme = getCompetitionTheme(category);
  return theme.description;
};

export const getCategoryTexture = (category?: string): string => {
  if (!category) return defaultTheme.texture;
  
  const theme = getCompetitionTheme(category);
  return theme.texture;
};
