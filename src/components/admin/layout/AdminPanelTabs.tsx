
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Trophy, 
  FileText, 
  Settings, 
  Bug, 
  Zap,
  Shield
} from 'lucide-react';

export const AdminPanelTabs: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-6 mb-8">
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
      <TabsTrigger value="integrations" className="flex items-center gap-2">
        <Zap className="h-4 w-4" />
        <span className="hidden sm:inline">Integrações</span>
      </TabsTrigger>
      <TabsTrigger value="validation" className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span className="hidden sm:inline">Validação</span>
      </TabsTrigger>
      <TabsTrigger value="support" className="flex items-center gap-2">
        <Bug className="h-4 w-4" />
        <span className="hidden sm:inline">Suporte</span>
      </TabsTrigger>
    </TabsList>
  );
};
