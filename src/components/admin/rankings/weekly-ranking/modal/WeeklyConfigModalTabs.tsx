
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyConfigOverview } from '../WeeklyConfigOverview';
import { WeeklyConfigScheduler } from '../WeeklyConfigScheduler';
import { WeeklyConfigFinalizer } from '../WeeklyConfigFinalizer';
import { WeeklyConfigHistory } from '../WeeklyConfigHistory';
import { AutomationMonitoring } from '../AutomationMonitoring';

interface WeeklyConfig {
  id: string;
  start_date: string;
  end_date: string;
  status: 'active' | 'scheduled' | 'ended' | 'completed';
  activated_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

interface WeeklyConfigModalTabsProps {
  activeConfig: WeeklyConfig | null;
  scheduledConfigs: WeeklyConfig[];
  lastCompletedConfig: WeeklyConfig | null;
  configsLoading: boolean;
  isActivating: boolean;
  isLoading: boolean;
  newStartDate: string;
  newEndDate: string;
  historyPage: number;
  weeklyHistoryData: any;
  historyLoading: boolean;
  historyTotalPages: number;
  onEdit: (competition: WeeklyConfig) => void;
  onDelete: (competition: WeeklyConfig) => void;
  onDeleteCompleted: (competition: any) => void;
  onActivate: () => Promise<void>;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onSchedule: () => Promise<void>;
  onFinalize: () => Promise<void>;
  onPageChange: (page: number) => void;
}

export const WeeklyConfigModalTabs: React.FC<WeeklyConfigModalTabsProps> = ({
  activeConfig,
  scheduledConfigs,
  lastCompletedConfig,
  configsLoading,
  isActivating,
  isLoading,
  newStartDate,
  newEndDate,
  historyPage,
  weeklyHistoryData,
  historyLoading,
  historyTotalPages,
  onEdit,
  onDelete,
  onDeleteCompleted,
  onActivate,
  onStartDateChange,
  onEndDateChange,
  onSchedule,
  onFinalize,
  onPageChange
}) => {
  const hasNoActiveOrScheduled = !activeConfig && scheduledConfigs.length === 0;
  const hasEndedCompetitions = scheduledConfigs.some(c => c.status === 'ended');

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-5">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="schedule">Agendar Nova</TabsTrigger>
        <TabsTrigger value="finalize" className={hasEndedCompetitions ? "bg-amber-100" : ""}>
          Finalizar Atual
        </TabsTrigger>
        <TabsTrigger value="automation">Monitoramento</TabsTrigger>
        <TabsTrigger value="history">Histórico Semanal</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <WeeklyConfigOverview
          activeConfig={activeConfig}
          scheduledConfigs={scheduledConfigs}
          isLoading={configsLoading}
          onEdit={onEdit}
          onDelete={onDelete}
          onActivate={onActivate}
          isActivating={isActivating}
        />
      </TabsContent>

      <TabsContent value="schedule" className="space-y-4">
        <WeeklyConfigScheduler
          newStartDate={newStartDate}
          newEndDate={newEndDate}
          onStartDateChange={onStartDateChange}
          onEndDateChange={onEndDateChange}
          onSchedule={onSchedule}
          isLoading={isLoading}
          lastCompletedConfig={lastCompletedConfig}
          activeConfig={activeConfig}
        />
      </TabsContent>

      <TabsContent value="finalize" className="space-y-4">
        <WeeklyConfigFinalizer
          activeConfig={activeConfig}
          scheduledConfigs={scheduledConfigs}
          onFinalize={onFinalize}
          isLoading={isLoading}
          hasNoActiveOrScheduled={hasNoActiveOrScheduled}
        />
      </TabsContent>

      <TabsContent value="automation" className="space-y-4">
        <AutomationMonitoring />
      </TabsContent>

      <TabsContent value="history" className="space-y-4">
        <WeeklyConfigHistory
          historyData={weeklyHistoryData}
          isLoading={historyLoading}
          totalPages={historyTotalPages}
          currentPage={historyPage}
          onPageChange={onPageChange}
          onDeleteCompleted={onDeleteCompleted}
        />
      </TabsContent>
    </Tabs>
  );
};
