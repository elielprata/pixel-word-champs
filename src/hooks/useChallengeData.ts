
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useGamePointsConfig } from './useGamePointsConfig';

interface ChallengeData {
  id: number;
  title: string;
  description: string;
  levels: number;
  timeLimit: number;
  instructions: string[];
  isActive: boolean;
  theme: string;
  color: string;
}

export const useChallengeData = (challengeId: number) => {
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    id: challengeId,
    title: `Desafio ${challengeId}`,
    description: 'Encontre as palavras escondidas no caça-palavras',
    levels: 20,
    timeLimit: 300, // 5 minutos padrão
    instructions: [
      'Encontre todas as palavras escondidas no tabuleiro',
      'As palavras podem estar na horizontal, vertical ou diagonal',
      'Você tem tempo limitado para completar cada nível',
      'Use revive assistindo anúncios para ganhar tempo extra'
    ],
    isActive: true,
    theme: 'default',
    color: 'blue'
  });
  const { config } = useGamePointsConfig();

  useEffect(() => {
    loadChallengeData();
  }, [challengeId]);

  const loadChallengeData = async () => {
    try {
      // Buscar configurações do tempo base
      const { data: settings, error } = await supabase
        .from('game_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'base_time_limit')
        .maybeSingle();

      if (error) {
        console.error('Error loading challenge settings:', error);
        return;
      }

      const timeLimit = settings ? parseInt(settings.setting_value) : 300;

      // Mapear dados específicos para cada desafio
      const challengeMap: Record<number, Partial<ChallengeData>> = {
        1: {
          title: "Desafio Matinal",
          description: "Palavras relacionadas ao café da manhã",
          theme: "morning",
          color: "orange",
          instructions: [
            'Encontre palavras sobre café da manhã',
            'Pão, café, leite, açúcar e outras delícias',
            `Você tem ${Math.floor(timeLimit / 60)} minutos por nível`,
            'Use o revive para ganhar +30 segundos'
          ]
        },
        2: {
          title: "Animais Selvagens",
          description: "Encontre os animais escondidos",
          theme: "nature",
          color: "green",
          instructions: [
            'Descubra animais selvagens no tabuleiro',
            'Leão, tigre, elefante e muitos outros',
            `Tempo limitado: ${Math.floor(timeLimit / 60)} minutos`,
            'Revive disponível assistindo anúncios'
          ]
        },
        3: {
          title: "Cidades do Brasil",
          description: "Conheça as cidades brasileiras",
          theme: "geography",
          color: "blue",
          instructions: [
            'Encontre nomes de cidades brasileiras',
            'São Paulo, Rio de Janeiro, Salvador...',
            `Desafio de ${Math.floor(timeLimit / 60)} minutos por nível`,
            'Use revive quantas vezes precisar'
          ]
        }
      };

      const specificData = challengeMap[challengeId] || {
        theme: 'default',
        color: 'purple'
      };

      setChallengeData(prev => ({
        ...prev,
        ...specificData,
        timeLimit
      }));
    } catch (error) {
      console.error('Error loading challenge data:', error);
    }
  };

  return challengeData;
};
