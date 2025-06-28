
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { UsersTab } from "@/components/admin/UsersTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { GameContentTab } from "@/components/admin/GameContentTab";
import { SupportTab } from "@/components/admin/SupportTab";
import { IntegrationsTab } from '@/components/admin/IntegrationsTab';
import { AdvancedSystemTab } from '@/components/admin/AdvancedSystemTab';
import { ValidationTabContent } from '@/components/admin/layout/ValidationTabContent';
import { InviteDashboard } from '@/components/admin/InviteDashboard';
import { logger } from '@/utils/logger';

export const AdminPanelContent: React.FC = () => {
  logger.debug('Renderizando conteúdo do painel admin', undefined, 'ADMIN_PANEL_CONTENT');
  
  return (
    <>
      <TabsContent value="users">
        <UsersTab />
      </TabsContent>

      <TabsContent value="rankings">
        <RankingsTab />
      </TabsContent>

      <TabsContent value="game-content">
        <GameContentTab />
      </TabsContent>

      <TabsContent value="invites">
        <InviteDashboard />
      </TabsContent>

      <TabsContent value="integrations">
        <IntegrationsTab />
      </TabsContent>

      <TabsContent value="validation">
        <ValidationTabContent />
      </TabsContent>

      <TabsContent value="support">
        <SupportTab />
      </TabsContent>
    </>
  );
};
