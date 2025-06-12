
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Shield, UserCog } from 'lucide-react';
import { AdminManagement } from "../AdminManagement";
import { AllUsersList } from "../AllUsersList";
import { logger } from '@/utils/logger';

export const UsersTabContent = () => {
  logger.debug('Renderizando conteúdo da aba de usuários', undefined, 'USERS_TAB_CONTENT');
  
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <Tabs defaultValue="all-users" className="w-full">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-slate-200">
            <TabsTrigger value="all-users" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
              <Users className="h-4 w-4" />
              Todos os Usuários
            </TabsTrigger>
            <TabsTrigger value="admins" className="flex items-center gap-2 data-[state=active]:bg-purple-50 data-[state=active]:text-purple-700">
              <Shield className="h-4 w-4" />
              Administradores
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="all-users" className="space-y-6 mt-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <UserCog className="h-5 w-5 text-blue-600" />
                  Lista de Usuários
                </h3>
                <p className="text-slate-600 text-sm">
                  Visualize e gerencie todos os usuários cadastrados no sistema
                </p>
              </div>
            </div>
            <AllUsersList />
          </TabsContent>

          <TabsContent value="admins" className="space-y-6 mt-0">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-600" />
                  Administradores
                </h3>
                <p className="text-slate-600 text-sm">
                  Gerencie permissões administrativas e crie novos administradores
                </p>
              </div>
            </div>
            <AdminManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
