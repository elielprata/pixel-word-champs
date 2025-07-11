
import React from 'react';
import { UsersTabHeader } from "./layout/UsersTabHeader";
import { UsersTabOverview } from "./layout/UsersTabOverview";
import { UsersTabContent } from "./layout/UsersTabContent";
import { logger } from '@/utils/logger';

export const UsersTab = () => {
  logger.debug('Renderizando aba de usuários', undefined, 'USERS_TAB');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <UsersTabHeader />
        <UsersTabOverview />
        <UsersTabContent />
      </div>
    </div>
  );
};
