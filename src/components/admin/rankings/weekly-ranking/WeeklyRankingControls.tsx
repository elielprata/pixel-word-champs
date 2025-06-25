import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Calendar } from 'lucide-react';
import { useWeeklyRanking } from '@/hooks/useWeeklyRanking';
export const WeeklyRankingControls: React.FC = () => {
  const {
    stats
  } = useWeeklyRanking();
  const getResetDescription = () => {
    if (!stats?.config) return 'Carregando configuração...';
    const {
      config
    } = stats;
    if (config.custom_start_date && config.custom_end_date) {
      const endDate = new Date(config.custom_end_date);
      return `Resetará automaticamente após ${endDate.toLocaleDateString('pt-BR')} (período personalizado)`;
    }
    const dayNames = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
    const startDay = dayNames[config.start_day_of_week];
    if (config.duration_days === 7) {
      return `Resetará automaticamente toda ${startDay} às 00:00h (início da semana)`;
    }
    return `Resetará automaticamente a cada ${config.duration_days} dias, iniciando às ${startDay}s`;
  };
  const getPeriodInfo = () => {
    if (!stats?.config) return 'Configuração padrão';
    const {
      config
    } = stats;
    if (config.custom_start_date && config.custom_end_date) {
      return 'Período Personalizado';
    }
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const startDay = dayNames[config.start_day_of_week];
    const endDayIndex = (config.start_day_of_week + config.duration_days - 1) % 7;
    const endDay = dayNames[endDayIndex];
    if (config.duration_days === 7) {
      return `Semana ${startDay} - ${endDay}`;
    }
    return `Período ${startDay} - ${endDay} (${config.duration_days}d)`;
  };
  return <div className="grid grid-cols-1 gap-6">
      
    </div>;
};