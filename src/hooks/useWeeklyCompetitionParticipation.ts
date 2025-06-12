
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ParticipationStatus {
  isParticipating: boolean;
  currentPosition: number | null;
  totalParticipants: number;
  competitionId: string | null;
}

export const useWeeklyCompetitionParticipation = () => {
  const { user } = useAuth();
  const [participationStatus, setParticipationStatus] = useState<ParticipationStatus>({
    isParticipating: false,
    currentPosition: null,
    totalParticipants: 0,
    competitionId: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkParticipation = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Check current week's competition participation
      const today = new Date();
      const weekStart = new Date(today.setDate(today.getDate() - today.getDay()));
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('weekly_rankings')
        .select('*')
        .eq('user_id', user.id as any)
        .eq('week_start', weekStartStr as any)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking participation:', error);
        return;
      }

      if (data && typeof data === 'object' && !('error' in data)) {
        setParticipationStatus(prev => ({
          ...prev,
          isParticipating: true,
          currentPosition: data.position,
          competitionId: weekStartStr
        }));
      }
    } catch (error) {
      console.error('Error in checkParticipation:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinCompetition = async (competitionId: string) => {
    if (!user?.id) return false;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .insert({
          user_id: user.id,
          competition_id: competitionId,
          user_score: 0,
          user_position: null
        } as any)
        .select()
        .single();

      if (error) {
        console.error('Error joining competition:', error);
        return false;
      }

      if (data && typeof data === 'object' && !('error' in data)) {
        setParticipationStatus(prev => ({
          ...prev,
          isParticipating: true,
          competitionId
        }));
        return true;
      }
    } catch (error) {
      console.error('Error in joinCompetition:', error);
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  const leaveCompetition = async (competitionId: string) => {
    if (!user?.id) return false;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('competition_participations')
        .delete()
        .eq('user_id', user.id as any)
        .eq('competition_id', competitionId as any)
        .select();

      if (error) {
        console.error('Error leaving competition:', error);
        return false;
      }

      if (data && typeof data === 'object' && !('error' in data)) {
        setParticipationStatus(prev => ({
          ...prev,
          isParticipating: false,
          currentPosition: null,
          competitionId: null
        }));
        return true;
      }
    } catch (error) {
      console.error('Error in leaveCompetition:', error);
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  useEffect(() => {
    checkParticipation();
  }, [user?.id]);

  return {
    participationStatus,
    isLoading,
    joinCompetition,
    leaveCompetition,
    refetch: checkParticipation
  };
};
