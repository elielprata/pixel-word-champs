
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, BarChart3, Settings, Gift, Trophy } from 'lucide-react';

export const AdminPanelTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-5 mb-8">
      <TabsTrigger value="users" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        Usuários
      </TabsTrigger>
      <TabsTrigger value="invites" className="flex items-center gap-2">
        <Gift className="h-4 w-4" />
        Indicações
      </TabsTrigger>
      <TabsTrigger value="rankings" className="flex items-center gap-2">
        <Trophy className="h-4 w-4" />
        Rankings
      </TabsTrigger>
      <TabsTrigger value="analytics" className="flex items-center gap-2">
        <BarChart3 className="h-4 w-4" />
        Analytics
      </TabsTrigger>
      <TabsTrigger value="system" className="flex items-center gap-2">
        <Settings className="h-4 w-4" />
        Sistema
      </TabsTrigger>
    </TabsList>
  );
};
