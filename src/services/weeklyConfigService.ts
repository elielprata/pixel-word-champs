
import { supabase } from '@/integrations/supabase/client';
import { WeeklyConfig } from '@/types/weeklyConfig';

export class WeeklyConfigService {
  static async loadActiveConfig(): Promise<WeeklyConfig | null> {
    const { data, error } = await supabase
      .from('weekly_config')
      .select('*')
      .eq('status', 'active')
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data as WeeklyConfig | null;
  }

  static async loadScheduledConfigs(): Promise<WeeklyConfig[]> {
    const { data, error } = await supabase
      .from('weekly_config')
      .select('*')
      .eq('status', 'scheduled')
      .order('start_date', { ascending: true });

    if (error) {
      throw error;
    }

    return (data || []) as WeeklyConfig[];
  }

  static async loadCompletedConfigs(): Promise<WeeklyConfig[]> {
    const { data, error } = await supabase
      .from('weekly_config')
      .select('*')
      .eq('status', 'completed')
      .order('completed_at', { ascending: false })
      .limit(10);

    if (error) {
      throw error;
    }

    return (data || []) as WeeklyConfig[];
  }

  static async scheduleCompetition(startDate: string, endDate: string) {
    try {
      const { data, error } = await supabase
        .from('weekly_config')
        .insert({
          start_date: startDate,
          end_date: endDate,
          status: 'scheduled'
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao agendar competição:', err);
      return { success: false, error: err.message };
    }
  }

  static async finalizeCompetition() {
    try {
      const { data, error } = await supabase.rpc('finalize_weekly_competition');

      if (error) throw error;

      return { success: true, data };
    } catch (err: any) {
      console.error('Erro ao finalizar competição:', err);
      return { success: false, error: err.message };
    }
  }
}
