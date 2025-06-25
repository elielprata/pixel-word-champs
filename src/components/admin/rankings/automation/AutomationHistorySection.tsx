
import React from 'react';
import { AutomationLogs } from '../../users/AutomationLogs';

interface AutomationHistorySectionProps {
  logs: any[];
}

export const AutomationHistorySection: React.FC<AutomationHistorySectionProps> = ({
  logs
}) => {
  return <AutomationLogs logs={logs} />;
};
