
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { logger } from '@/utils/logger';

export const AdminPanelTabs = () => {
  logger.debug('Renderizando abas do painel administrativo', undefined, 'ADMIN_PANEL_TABS');
  
  return (
    <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
      <TabsTrigger value="users">Usuários</TabsTrigger>
      <TabsTrigger value="rankings">Competições</TabsTrigger>
      <TabsTrigger value="content">Conteúdo</TabsTrigger>
      <TabsTrigger value="monitoring">Monitoramento</TabsTrigger>
      <TabsTrigger value="support">Suporte</TabsTrigger>
      <TabsTrigger value="advanced">Sistema Avançado</TabsTrigger>
    </TabsList>
  );
};
