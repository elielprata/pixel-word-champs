
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Challenge {
  id: number;
  title: string;
  description: string;
  theme: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  levels: number;
  is_active: boolean;
}

interface UseChallengesOptions {
  activeOnly?: boolean;
}

export const useChallenges = (options: UseChallengesOptions = {}) => {
  const { activeOnly = true } = options;
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadChallenges();
  }, [activeOnly]);

  const loadChallenges = async () => {
    try {
      console.log('🔍 Carregando desafios...');
      console.log('Parâmetro activeOnly:', activeOnly);
      
      let query = supabase
        .from('challenges')
        .select('*')
        .order('id');

      // Apply filter based on activeOnly parameter
      if (activeOnly) {
        query = query.eq('is_active', true);
        console.log('✅ Aplicando filtro: is_active = true');
      } else {
        console.log('📋 Buscando TODOS os desafios (ativos e inativos)');
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Erro ao buscar desafios:', error);
        throw error;
      }
      
      console.log('📊 Dados brutos do banco:', data);
      console.log('📊 Total de registros encontrados:', data?.length || 0);
      
      if (data && data.length > 0) {
        data.forEach((challenge, index) => {
          console.log(`📝 Desafio ${index + 1}:`, {
            id: challenge.id,
            title: challenge.title,
            is_active: challenge.is_active,
            created_at: challenge.created_at
          });
        });
      } else {
        console.log('🚫 Nenhum desafio encontrado no banco de dados');
      }
      
      // Cast the difficulty to the correct type
      const typedChallenges = (data || []).map(challenge => ({
        ...challenge,
        difficulty: challenge.difficulty as 'easy' | 'medium' | 'hard'
      }));
      
      console.log('✅ Desafios processados:', typedChallenges.length);
      setChallenges(typedChallenges);
    } catch (error) {
      console.error('❌ Erro crítico ao carregar desafios:', error);
      setChallenges([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    challenges,
    isLoading,
    refetch: loadChallenges
  };
};
