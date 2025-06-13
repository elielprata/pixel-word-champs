
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Settings, CreditCard, HelpCircle, Zap } from 'lucide-react';
import { UsersTab } from '../UsersTab';
import { GameContentTab } from '../GameContentTab';
import { RankingsTab } from '../RankingsTab';
import { PaymentsTab } from '../PaymentsTab';
import { SupportTab } from '../SupportTab';
import { IntegrationsTab } from '../IntegrationsTab';

interface AdminPanelContentProps {
  onRefresh?: () => void;
}

export const AdminPanelContent = ({ onRefresh }: AdminPanelContentProps) => {
  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh();
    }
  };

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList className="grid w-full grid-cols-6 bg-slate-100">
        <TabsTrigger value="users" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Usuários
        </TabsTrigger>
        <TabsTrigger value="game-content" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Conteúdo
        </TabsTrigger>
        <TabsTrigger value="rankings" className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          Rankings
        </TabsTrigger>
        <TabsTrigger value="payments" className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Pagamentos
        </TabsTrigger>
        <TabsTrigger value="support" className="flex items-center gap-2">
          <HelpCircle className="h-4 w-4" />
          Suporte
        </TabsTrigger>
        <TabsTrigger value="integrations" className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Integrações
        </TabsTrigger>
      </TabsList>

      <TabsContent value="users" className="mt-6">
        <UsersTab />
      </TabsContent>

      <TabsContent value="game-content" className="mt-6">
        <GameContentTab />
      </TabsContent>

      <TabsContent value="rankings" className="mt-6">
        <RankingsTab onRefresh={handleRefresh} />
      </TabsContent>

      <TabsContent value="payments" className="mt-6">
        <PaymentsTab />
      </TabsContent>

      <TabsContent value="support" className="mt-6">
        <SupportTab />
      </TabsContent>

      <TabsContent value="integrations" className="mt-6">
        <IntegrationsTab />
      </TabsContent>
    </Tabs>
  );
};
