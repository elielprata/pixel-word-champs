
import { supabase } from '@/integrations/supabase/client';
import { WeeklyConfig } from '@/types/weeklyConfig';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

export class WeeklyConfigService {
  static async loadActiveConfig(): Promise<WeeklyConfig | null> {
    try {
      const { data, error } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data;
    } catch (err: any) {
      console.error('Erro ao carregar configuração ativa:', err);
      return null;
    }
  }

  static async loadScheduledConfigs(): Promise<WeeklyConfig[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'scheduled')
        .order('start_date', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Erro ao carregar configurações agendadas:', err);
      return [];
    }
  }

  static async loadCompletedConfigs(): Promise<WeeklyConfig[]> {
    try {
      const { data, error } = await supabase
        .from('weekly_config')
        .select('*')
        .eq('status', 'completed')
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      return data || [];
    } catch (err: any) {
      console.error('Erro ao carregar configurações finalizadas:', err);
      return [];
    }
  }

  static async scheduleCompetition(startDate: string, endDate: string) {
    try {
      console.log('🎯 Agendando nova competição:', {
        startDate,
        endDate,
        timestamp: getCurrentBrasiliaTime()
      });

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

      console.log('✅ Competição agendada com sucesso:', data);
      return { success: true, data };
    } catch (err: any) {
      console.error('❌ Erro ao agendar competição:', err);
      return { success: false, error: err.message };
    }
  }
}
