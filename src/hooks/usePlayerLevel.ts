
import { useMemo } from 'react';
import { Crown, Trophy, Star, Target, Zap, Award, Shield, Sword, Gem, Sparkles, BookOpen, Brain, Lightbulb, Eye, Globe, Wand2, Castle, Scroll, Mountain, Flame } from 'lucide-react';

export interface PlayerLevel {
  level: number;
  title: string;
  icon: any;
  color: string;
  xpRequired: number;
  xpFromPrevious: number;
}

export const usePlayerLevel = (totalXP: number = 0) => {
  const playerLevels: PlayerLevel[] = [
    { level: 1, title: "Recruta das Letras", icon: BookOpen, color: "from-gray-400 to-gray-500", xpRequired: 100, xpFromPrevious: 100 },
    { level: 2, title: "Desbravador de Palavras", icon: Target, color: "from-green-400 to-green-500", xpRequired: 300, xpFromPrevious: 200 },
    { level: 3, title: "Aspirante a Caçador", icon: Eye, color: "from-blue-400 to-blue-500", xpRequired: 700, xpFromPrevious: 400 },
    { level: 4, title: "Caçador Novato", icon: Sword, color: "from-purple-400 to-purple-500", xpRequired: 1500, xpFromPrevious: 800 },
    { level: 5, title: "Explorador do Vocabulário", icon: Globe, color: "from-indigo-400 to-indigo-500", xpRequired: 3100, xpFromPrevious: 1600 },
    { level: 6, title: "Garimpeiro de Sílabas", icon: Gem, color: "from-cyan-400 to-cyan-500", xpRequired: 6300, xpFromPrevious: 3200 },
    { level: 7, title: "Rastreador de Termos", icon: Shield, color: "from-teal-400 to-teal-500", xpRequired: 12700, xpFromPrevious: 6400 },
    { level: 8, title: "Decifrador Júnior", icon: Lightbulb, color: "from-yellow-400 to-yellow-500", xpRequired: 25500, xpFromPrevious: 12800 },
    { level: 9, title: "Caçador Intermediário", icon: Zap, color: "from-orange-400 to-orange-500", xpRequired: 51100, xpFromPrevious: 25600 },
    { level: 10, title: "Analista de Palavras", icon: Brain, color: "from-red-400 to-red-500", xpRequired: 102300, xpFromPrevious: 51200 },
    { level: 11, title: "Mestre das Letras", icon: Award, color: "from-pink-400 to-pink-500", xpRequired: 204700, xpFromPrevious: 102400 },
    { level: 12, title: "Destrinchador de Textos", icon: Scroll, color: "from-violet-400 to-violet-500", xpRequired: 409500, xpFromPrevious: 204800 },
    { level: 13, title: "Oráculo Ortográfico", icon: Star, color: "from-fuchsia-400 to-fuchsia-500", xpRequired: 819100, xpFromPrevious: 409600 },
    { level: 14, title: "Detective de Dicionário", icon: Wand2, color: "from-rose-400 to-rose-500", xpRequired: 1638300, xpFromPrevious: 819200 },
    { level: 15, title: "Enciclopédia Ambulante", icon: Castle, color: "from-amber-400 to-amber-500", xpRequired: 3276700, xpFromPrevious: 1638400 },
    { level: 16, title: "Gênio Gramatical", icon: Sparkles, color: "from-emerald-400 to-emerald-500", xpRequired: 6553500, xpFromPrevious: 3276800 },
    { level: 17, title: "Senhor das Palavras", icon: Trophy, color: "from-sky-400 to-sky-500", xpRequired: 13107100, xpFromPrevious: 6553600 },
    { level: 18, title: "Arquiteto do Vocabulário", icon: Mountain, color: "from-slate-400 to-slate-600", xpRequired: 26214300, xpFromPrevious: 13107200 },
    { level: 19, title: "Sábio Silábico", icon: Flame, color: "from-orange-500 to-red-600", xpRequired: 52428700, xpFromPrevious: 26214400 },
    { level: 20, title: "Lenda da Linguagem", icon: Crown, color: "from-yellow-400 to-orange-500", xpRequired: 104857500, xpFromPrevious: 52428800 }
  ];

  const currentLevel = useMemo(() => {
    for (let i = playerLevels.length - 1; i >= 0; i--) {
      if (totalXP >= (i === 0 ? 0 : playerLevels[i - 1].xpRequired)) {
        return playerLevels[i];
      }
    }
    return playerLevels[0];
  }, [totalXP, playerLevels]);

  const nextLevel = useMemo(() => {
    const currentIndex = playerLevels.findIndex(level => level.level === currentLevel.level);
    return currentIndex < playerLevels.length - 1 ? playerLevels[currentIndex + 1] : null;
  }, [currentLevel, playerLevels]);

  const progress = useMemo(() => {
    if (!nextLevel) {
      return { current: totalXP, next: totalXP, progress: 100 };
    }

    const currentLevelStartXP = currentLevel.level === 1 ? 0 : playerLevels[currentLevel.level - 2].xpRequired;
    const currentInLevel = totalXP - currentLevelStartXP;
    const neededForNext = currentLevel.xpRequired - currentLevelStartXP;
    const progressPercent = Math.min((currentInLevel / neededForNext) * 100, 100);

    return {
      current: currentInLevel,
      next: neededForNext,
      progress: progressPercent
    };
  }, [totalXP, currentLevel, nextLevel, playerLevels]);

  return {
    currentLevel,
    nextLevel,
    progress,
    playerLevels
  };
};
