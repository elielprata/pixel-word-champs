
import React from 'react';
import { UserGrowthMetrics } from './UserGrowthMetrics';
import { UserActivityMetrics } from './UserActivityMetrics';
import { UserSystemStatus } from './UserSystemStatus';

export const UserMetricsGrid = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <UserGrowthMetrics />
      <UserActivityMetrics />
      <UserSystemStatus />
    </div>
  );
};
