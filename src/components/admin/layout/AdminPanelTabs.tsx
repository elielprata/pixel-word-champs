
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  FileText, 
  Settings, 
  Bug, 
  Zap,
  Shield,
  UserPlus,
  Activity
} from 'lucide-react';

export const AdminPanelTabs: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-7 mb-8">
      <TabsTrigger value="users" className="flex items-center gap-2">
        <Users className="h-4 w-4" />
        <span className="hidden sm:inline">Usuários</span>
      </TabsTrigger>
      <TabsTrigger value="rankings" className="flex items-center gap-2">
        <Trophy className="h-4 w-4" />
        <span className="hidden sm:inline">Rankings</span>
      </TabsTrigger>
      <TabsTrigger value="game-content" className="flex items-center gap-2">
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Conteúdo</span>
      </TabsTrigger>
      <TabsTrigger value="invites" className="flex items-center gap-2">
        <UserPlus className="h-4 w-4" />
        <span className="hidden sm:inline">Indicações</span>
      </TabsTrigger>
      <TabsTrigger value="integrations" className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Integrações</span>
      </TabsTrigger>
      <TabsTrigger value="support" className="flex items-center gap-2">
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Suporte</span>
      </TabsTrigger>
      <TabsTrigger value="monitoring" className="flex items-center gap-2">
        <Activity className="h-4 w-4" />
        <span className="hidden sm:inline">Monitoramento</span>
      </TabsTrigger>
    </TabsList>
  );
};
