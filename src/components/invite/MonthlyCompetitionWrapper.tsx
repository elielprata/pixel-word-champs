
import React from 'react';
import MonthlyInviteCompetition from '../MonthlyInviteCompetition';

interface MonthlyCompetitionWrapperProps {
  monthlyData: any;
}

export const MonthlyCompetitionWrapper = ({ monthlyData }: MonthlyCompetitionWrapperProps) => {
  // Se não há dados da competição mensal ainda, não renderizar nada
  // O loading será controlado pelo componente pai
  if (!monthlyData) {
    return null;
  }

  return <MonthlyInviteCompetition />;
};
