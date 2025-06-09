
import React from 'react';
import AdminRoute from '@/components/auth/AdminRoute';
import { Tabs } from "@/components/ui/tabs";
import { AdminPanelHeader } from '@/components/admin/layout/AdminPanelHeader';
import { AdminPanelTabs } from '@/components/admin/layout/AdminPanelTabs';
import { AdminPanelContent } from '@/components/admin/layout/AdminPanelContent';

const AdminPanel = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
        <div className="container mx-auto px-4 py-8">
          <AdminPanelHeader />

          <Tabs defaultValue="dashboard" className="w-full">
            <AdminPanelTabs />
            <AdminPanelContent />
          </Tabs>
        </div>
      </div>
    </AdminRoute>
  );
};

export default AdminPanel;
