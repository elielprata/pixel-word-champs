
import React from 'react';
import { TabsContent } from "@/components/ui/tabs";
import { UserManagement } from '../users/UserManagement';
import { InviteDashboard } from '../InviteDashboard';
import { RankingsTab } from '../RankingsTab';
import { AdminAnalytics } from '../AdminAnalytics';
import { SystemTab } from '../SystemTab';

export const AdminPanelContent = () => {
  return (
    <>
      <TabsContent value="users">
        <UserManagement />
      </TabsContent>

      <TabsContent value="invites">
        <InviteDashboard />
      </TabsContent>

      <TabsContent value="rankings">
        <RankingsTab />
      </TabsContent>

      <TabsContent value="analytics">
        <AdminAnalytics />
      </TabsContent>

      <TabsContent value="system">
        <SystemTab />
      </TabsContent>
    </>
  );
};
