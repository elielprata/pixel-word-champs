
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { DashboardStats } from "@/components/admin/DashboardStats";
import { UsersTab } from "@/components/admin/UsersTab";
import { RankingsTab } from "@/components/admin/RankingsTab";
import { GameContentTab } from "@/components/admin/GameContentTab";
import { SupportTab } from "@/components/admin/SupportTab";
import { IntegrationsTab } from '@/components/admin/IntegrationsTab';

export const AdminPanelContent = () => {
  return (
    <>
      <TabsContent value="dashboard">
        <DashboardStats />
      </TabsContent>

      <TabsContent value="users">
        <UsersTab />
      </TabsContent>

      <TabsContent value="rankings">
        <RankingsTab />
      </TabsContent>

      <TabsContent value="content">
        <GameContentTab />
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
