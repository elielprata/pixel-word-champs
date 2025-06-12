
/**
 * UTILITÁRIOS DE COMPETIÇÃO RADICAL SIMPLIFICADOS
 * 
 * PRINCÍPIO: Usar as novas funções simplificadas sem conversões de timezone
 */

import { formatDateForDisplay } from '@/utils/brasiliaTime';

export const formatDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  return formatDateForDisplay(dateString);
};

export const getWeekFromDate = (dateString: string) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

console.log('🎯 UTILITÁRIOS DE COMPETIÇÃO SIMPLIFICADOS ATIVADOS');
