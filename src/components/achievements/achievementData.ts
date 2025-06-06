
import { Trophy, Calendar, Target, Star, Award, Medal, Crown, LucideIcon } from 'lucide-react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  unlocked: boolean;
  progress: number;
  total: number;
  rarity: string;
  points: number;
}

export const createAchievements = (user: any): Achievement[] => [
  {
    id: 'first_game',
    title: 'Primeiro Jogo',
    description: 'Complete seu primeiro desafio',
    icon: Target,
    unlocked: (user?.games_played || 0) > 0,
    progress: Math.min((user?.games_played || 0), 1),
    total: 1,
    rarity: 'common',
    points: 10
  },
  {
    id: 'first_points',
    title: 'Primeiros Pontos',
    description: 'Ganhe seus primeiros 100 pontos',
    icon: Star,
    unlocked: (user?.total_score || 0) >= 100,
    progress: Math.min((user?.total_score || 0), 100),
    total: 100,
    rarity: 'common',
    points: 25
  },
  {
    id: 'ten_games',
    title: 'Veterano',
    description: 'Complete 10 jogos',
    icon: Calendar,
    unlocked: (user?.games_played || 0) >= 10,
    progress: Math.min((user?.games_played || 0), 10),
    total: 10,
    rarity: 'uncommon',
    points: 50
  },
  {
    id: 'top_100',
    title: 'Top 100',
    description: 'Entre no top 100 do ranking diário',
    icon: Medal,
    unlocked: (user?.best_daily_position || 999) <= 100,
    progress: user?.best_daily_position ? Math.max(101 - user.best_daily_position, 0) : 0,
    total: 100,
    rarity: 'rare',
    points: 100
  },
  {
    id: 'top_10',
    title: 'Elite',
    description: 'Entre no top 10 do ranking diário',
    icon: Award,
    unlocked: (user?.best_daily_position || 999) <= 10,
    progress: user?.best_daily_position ? Math.max(11 - user.best_daily_position, 0) : 0,
    total: 10,
    rarity: 'epic',
    points: 250
  },
  {
    id: 'podium',
    title: 'Pódio',
    description: 'Termine no top 3 do ranking diário',
    icon: Trophy,
    unlocked: (user?.best_daily_position || 999) <= 3,
    progress: user?.best_daily_position ? Math.max(4 - user.best_daily_position, 0) : 0,
    total: 3,
    rarity: 'legendary',
    points: 500
  },
  {
    id: 'champion',
    title: 'Campeão',
    description: 'Alcance o 1º lugar no ranking diário',
    icon: Crown,
    unlocked: (user?.best_daily_position || 999) === 1,
    progress: user?.best_daily_position === 1 ? 1 : 0,
    total: 1,
    rarity: 'legendary',
    points: 1000
  }
];

export const getRarityColor = (rarity: string): string => {
  switch (rarity) {
    case 'common': return 'bg-gray-100 text-gray-800 border-gray-300';
    case 'uncommon': return 'bg-green-100 text-green-800 border-green-300';
    case 'rare': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'epic': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'legendary': return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-400';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
