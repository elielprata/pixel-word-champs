
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, Trophy, CreditCard } from 'lucide-react';
import { WinnersManagementTab } from './rankings/payments/WinnersManagementTab';

export const PaymentsTab = () => {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="winners" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="winners" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Ganhadores
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Pagamentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="winners" className="mt-6">
          <WinnersManagementTab />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
            <div className="text-center text-gray-500 py-12">
              <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">Sistema de Pagamentos</p>
              <p className="text-sm">Em desenvolvimento - integração com gateways de pagamento</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
