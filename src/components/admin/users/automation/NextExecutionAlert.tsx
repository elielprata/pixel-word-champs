import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Trophy } from 'lucide-react';
interface NextExecutionAlertProps {
  nextExecution: string | null;
}
export const NextExecutionAlert = ({
  nextExecution
}: NextExecutionAlertProps) => {
  if (!nextExecution) return null;
  return;
};