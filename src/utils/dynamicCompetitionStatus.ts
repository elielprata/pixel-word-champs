
import React from 'react';

/**
 * LÓGICA DE STATUS DINÂMICO - COMPARAÇÃO UTC PURA
 * Calcula status baseado apenas em comparações de tempo UTC
 */

export type CompetitionStatus = 'scheduled' | 'active' | 'completed';

/**
 * Calcula status dinâmico usando comparação UTC pura
 * @param startDate Data de início UTC (string ISO do banco)
 * @param endDate Data de fim UTC (string ISO do banco)
 * @returns Status atual da competição
 */
export const calculateDynamicStatus = (startDate: string, endDate: string): CompetitionStatus => {
  try {
    const now = new Date(); // UTC atual
    const start = new Date(startDate); // UTC do banco
    const end = new Date(endDate); // UTC do banco

    // Validar se as datas são válidas
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      console.error('❌ Datas inválidas para cálculo de status:', { startDate, endDate });
      return 'completed'; // Fallback seguro
    }

    // Comparação UTC pura
    if (now < start) {
      return 'scheduled';
    } else if (now >= start && now < end) {
      return 'active';
    } else {
      return 'completed';
    }
  } catch (error) {
    console.error('❌ Erro ao calcular status dinâmico:', error);
    return 'completed'; // Fallback seguro
  }
};

/**
 * Converte status para texto em português
 */
export const getStatusText = (status: CompetitionStatus): string => {
  switch (status) {
    case 'active': return 'Ativo';
    case 'scheduled': return 'Agendado';
    case 'completed': return 'Finalizado';
    default: return 'Rascunho';
  }
};

/**
 * Converte status para classes CSS
 */
export const getStatusColor = (status: CompetitionStatus): string => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700 border-green-200';
    case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'completed': return 'bg-purple-100 text-purple-700 border-purple-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

/**
 * Formatar data UTC para exibição em Brasília
 */
export const formatDateTimeBrasilia = (utcDateString: string): string => {
  try {
    const date = new Date(utcDateString);
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    return date.toLocaleString("pt-BR", { 
      timeZone: "America/Sao_Paulo",
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    console.error('❌ Erro ao formatar data:', error);
    return 'Data inválida';
  }
};

/**
 * Hook para status dinâmico com auto-atualização
 */
export const useDynamicCompetitionStatus = (startDate: string, endDate: string) => {
  const [status, setStatus] = React.useState<CompetitionStatus>(() => 
    calculateDynamicStatus(startDate, endDate)
  );

  React.useEffect(() => {
    // Atualizar status imediatamente
    setStatus(calculateDynamicStatus(startDate, endDate));

    // Configurar intervalo de atualização
    const interval = setInterval(() => {
      const newStatus = calculateDynamicStatus(startDate, endDate);
      setStatus(newStatus);
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [startDate, endDate]);

  return status;
};
