
import { supabase } from '@/integrations/supabase/client';
import { ChallengeFormData } from './ChallengeFormData';
import { getNextId } from './challengeUtils';

export const createChallenge = async (formData: ChallengeFormData, challenges: any[]) => {
  const nextId = getNextId(challenges);
  const challengeData = {
    id: nextId,
    ...formData,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null
  };

  const { error } = await supabase
    .from('challenges')
    .insert(challengeData);

  if (error) throw error;
};

export const updateChallenge = async (formData: ChallengeFormData, challengeId: number) => {
  const updateData = {
    ...formData,
    start_date: formData.start_date || null,
    end_date: formData.end_date || null
  };

  const { error } = await supabase
    .from('challenges')
    .update(updateData)
    .eq('id', challengeId);

  if (error) throw error;
};

export const deleteChallenge = async (challengeId: number) => {
  const { error } = await supabase
    .from('challenges')
    .delete()
    .eq('id', challengeId);

  if (error) throw error;
};
