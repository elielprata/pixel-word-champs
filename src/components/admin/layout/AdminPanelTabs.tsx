
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const AdminPanelTabs = () => {
  return (
    <TabsList className="grid w-full grid-cols-6 lg:grid-cols-6">
      <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      <TabsTrigger value="users">Usuários</TabsTrigger>
      <TabsTrigger value="rankings">Competições</TabsTrigger>
      <TabsTrigger value="content">Conteúdo</TabsTrigger>
      <TabsTrigger value="support">Suporte</TabsTrigger>
      <TabsTrigger value="integrations">Integrações</TabsTrigger>
    </TabsList>
  );
};
