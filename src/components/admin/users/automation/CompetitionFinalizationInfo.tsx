import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Trophy } from 'lucide-react';
import { AutomationConfig } from './types';
interface CompetitionFinalizationInfoProps {
  settings: AutomationConfig;
}
export const CompetitionFinalizationInfo = ({
  settings
}: CompetitionFinalizationInfoProps) => {
  if (settings.triggerType !== 'competition_finalization') return null;
  return;
};