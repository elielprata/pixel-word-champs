
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from '@/utils/logger';

export const AdminPanelTabs = () => {
  logger.debug('Renderizando abas do painel administrativo', undefined, 'ADMIN_PANEL_TABS');
  
  return (
    <TabsList className="grid w-full grid-cols-7 lg:grid-cols-7">
      <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
      <TabsTrigger value="users">Usuários</TabsTrigger>
      <TabsTrigger value="rankings">Competições</TabsTrigger>
      <TabsTrigger value="content">Conteúdo</TabsTrigger>
      <TabsTrigger value="support">Suporte</TabsTrigger>
      <TabsTrigger value="integrations">Integrações</TabsTrigger>
      <TabsTrigger value="data-recovery">Recuperação</TabsTrigger>
    </TabsList>
  );
};
