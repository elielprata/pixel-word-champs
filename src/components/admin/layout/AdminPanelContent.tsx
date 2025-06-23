
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { UsersTab } from "@/components/admin/UsersTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { GameContentTab } from "@/components/admin/GameContentTab";
import { MonitoringTab } from "@/components/admin/MonitoringTab";
import { SupportTab } from "@/components/admin/SupportTab";
import { IntegrationsTab } from '@/components/admin/IntegrationsTab';
import { logger } from '@/utils/logger';

export const AdminPanelContent = () => {
  logger.debug('Renderizando conteúdo do painel admin', undefined, 'ADMIN_PANEL_CONTENT');
  
  return (
    <>
      <TabsContent value="users">
        <UsersTab />
      </TabsContent>

      <TabsContent value="rankings">
        <RankingsTab />
      </TabsContent>

      <TabsContent value="content">
        <GameContentTab />
      </TabsContent>

      <TabsContent value="monitoring">
        <MonitoringTab />
      </TabsContent>

      <TabsContent value="support">
        <SupportTab />
      </TabsContent>

      <TabsContent value="integrations">
        <IntegrationsTab />
      </TabsContent>
    </>
  );
};
