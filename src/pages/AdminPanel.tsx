
import React from 'react';
import RobustAdminRoute from '@/components/auth/RobustAdminRoute';
import { Tabs } from "@/components/ui/tabs";
import { AdminPanelHeader } from '@/components/admin/layout/AdminPanelHeader';
import { AdminPanelTabs } from '@/components/admin/layout/AdminPanelTabs';
import { AdminPanelContent } from '@/components/admin/layout/AdminPanelContent';

const AdminPanel = () => {
  return (
    <RobustAdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <AdminPanelHeader />

          <Tabs defaultValue="users" className="w-full">
            <AdminPanelTabs />
            <AdminPanelContent />
          </Tabs>
        </div>
      </div>
    </RobustAdminRoute>
  );
};

export default AdminPanel;
