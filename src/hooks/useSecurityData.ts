
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SecurityStats {
  totalAlerts: number;
  pendingAlerts: number;
  highPriorityAlerts: number;
  detectionsToday: number;
  blockedSessionsToday: number;
  fraudDetectionRate: number;
  falsePositiveRate: number;
  avgResponseTime: number;
}

interface FraudAlert {
  id: string;
  user_id: string | null;
  alert_type: string;
  reason: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'investigating' | 'resolved' | 'false_positive';
  metadata: any;
  assigned_to: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

interface SecuritySetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: string;
  description: string | null;
  is_active: boolean;
}

export const useSecurityData = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState<SecurityStats>({
    totalAlerts: 0,
    pendingAlerts: 0,
    highPriorityAlerts: 0,
    detectionsToday: 0,
    blockedSessionsToday: 0,
    fraudDetectionRate: 98.5,
    falsePositiveRate: 2.1,
    avgResponseTime: 4.2
  });
  const [alerts, setAlerts] = useState<FraudAlert[]>([]);
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSecurityStats = async () => {
    try {
      // Buscar estatísticas de alertas
      const { data: alertsData } = await supabase
        .from('fraud_alerts')
        .select('*');

      // Buscar bloqueios de hoje
      const today = new Date().toISOString().split('T')[0];
      const { data: sessionsData } = await supabase
        .from('suspicious_sessions')
        .select('*')
        .eq('status', 'blocked')
        .gte('created_at', today);

      if (alertsData) {
        const totalAlerts = alertsData.length;
        const pendingAlerts = alertsData.filter(a => a.status === 'pending').length;
        const highPriorityAlerts = alertsData.filter(a => a.severity === 'high' || a.severity === 'critical').length;
        const detectionsToday = alertsData.filter(a => 
          new Date(a.created_at).toDateString() === new Date().toDateString()
        ).length;

        setStats(prev => ({
          ...prev,
          totalAlerts,
          pendingAlerts,
          highPriorityAlerts,
          detectionsToday,
          blockedSessionsToday: sessionsData?.length || 0
        }));
      }
    } catch (error) {
      console.error('Erro ao buscar estatísticas de segurança:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data, error } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os alertas de segurança.",
        variant: "destructive",
      });
    }
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .eq('is_active', true)
        .order('setting_key');

      if (error) throw error;
      setSettings(data || []);
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as configurações de segurança.",
        variant: "destructive",
      });
    }
  };

  const updateAlertStatus = async (alertId: string, status: string, assignedTo?: string) => {
    try {
      const updateData: any = { 
        status, 
        updated_at: new Date().toISOString() 
      };
      
      if (assignedTo) updateData.assigned_to = assignedTo;
      if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

      const { error } = await supabase
        .from('fraud_alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) throw error;

      await fetchAlerts();
      await fetchSecurityStats();

      toast({
        title: "Sucesso",
        description: "Status do alerta atualizado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar alerta:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do alerta.",
        variant: "destructive",
      });
    }
  };

  const updateSetting = async (settingKey: string, value: string) => {
    try {
      const { error } = await supabase
        .from('security_settings')
        .update({ 
          setting_value: value, 
          updated_at: new Date().toISOString() 
        })
        .eq('setting_key', settingKey);

      if (error) throw error;

      await fetchSettings();

      toast({
        title: "Sucesso",
        description: "Configuração atualizada com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a configuração.",
        variant: "destructive",
      });
    }
  };

  const exportSecurityReport = async () => {
    try {
      // Buscar dados para relatório
      const { data: alertsData } = await supabase
        .from('fraud_alerts')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: logsData } = await supabase
        .from('security_logs')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      // Criar CSV
      const csvContent = [
        'Data,Tipo,Descrição,Severidade,Status',
        ...(alertsData || []).map(alert => 
          `${new Date(alert.created_at).toLocaleDateString()},${alert.alert_type},${alert.reason},${alert.severity},${alert.status}`
        )
      ].join('\n');

      // Download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_seguranca_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Relatório de segurança exportado com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      toast({
        title: "Erro",
        description: "Não foi possível exportar o relatório.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchSecurityStats(),
        fetchAlerts(),
        fetchSettings()
      ]);
      setLoading(false);
    };

    loadData();
  }, []);

  return {
    stats,
    alerts,
    settings,
    loading,
    updateAlertStatus,
    updateSetting,
    exportSecurityReport,
    refreshData: () => Promise.all([fetchSecurityStats(), fetchAlerts(), fetchSettings()])
  };
};
