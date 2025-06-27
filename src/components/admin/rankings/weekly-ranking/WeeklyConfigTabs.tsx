
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WeeklyConfigOverview } from './WeeklyConfigOverview';
import { WeeklyConfigScheduler } from './WeeklyConfigScheduler';
import { WeeklyConfigFinalizer } from './WeeklyConfigFinalizer';
import { WeeklyConfigHistory } from './WeeklyConfigHistory';

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

interface WeeklyConfigTabsProps {
  // Data
  activeConfig: WeeklyConfig | null;
  scheduledConfigs: WeeklyConfig[];
  lastCompletedConfig: WeeklyConfig | null;
  configsLoading: boolean;
  weeklyHistoryData: any[];
  historyLoading: boolean;
  historyTotalPages: number;
  historyPage: number;
  isActivating: boolean;
  isLoading: boolean;
  
  // Form data
  newStartDate: string;
  newEndDate: string;
  
  // Handlers
  onEdit: (competition: WeeklyConfig) => void;
  onDelete: (competition: WeeklyConfig) => void;
  onDeleteCompleted: (competition: any) => void;
  onActivate: () => Promise<void>;
  onSchedule: () => Promise<void>;
  onFinalize: () => Promise<void>;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onPageChange: (page: number) => void;
}

export const WeeklyConfigTabs: React.FC<WeeklyConfigTabsProps> = ({
  activeConfig,
  scheduledConfigs,
  lastCompletedConfig,
  configsLoading,
  weeklyHistoryData,
  historyLoading,
  historyTotalPages,
  historyPage,
  isActivating,
  isLoading,
  newStartDate,
  newEndDate,
  onEdit,
  onDelete,
  onDeleteCompleted,
  onActivate,
  onSchedule,
  onFinalize,
  onStartDateChange,
  onEndDateChange,
  onPageChange
}) => {
  const hasNoActiveOrScheduled = !activeConfig && scheduledConfigs.length === 0;
  const hasEndedCompetitions = scheduledConfigs.some(c => c.status === 'ended');

  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="schedule">Agendar Nova</TabsTrigger>
        <TabsTrigger value="finalize" className={hasEndedCompetitions ? "bg-amber-100" : ""}>
          Finalizar Atual
        </TabsTrigger>
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
