
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DebugInfoProps {
  debugInfo: {
    customCompetitions: number;
    systemCompetitions: number;
    totalCompetitions: number;
    totalCustom: number;
    customError?: string;
    systemError?: string;
  } | null;
}

export const DebugInfo: React.FC<DebugInfoProps> = ({ debugInfo }) => {
  if (!debugInfo) return null;

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="text-sm text-blue-800">Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-blue-700">
        <p>Competições customizadas finalizadas: {debugInfo.customCompetitions}</p>
        <p>Competições do sistema finalizadas: {debugInfo.systemCompetitions}</p>
        <p>Total de competições no sistema: {debugInfo.totalCompetitions}</p>
        <p>Total de competições customizadas: {debugInfo.totalCustom}</p>
        {debugInfo.customError && <p>Erro custom: {debugInfo.customError}</p>}
        {debugInfo.systemError && <p>Erro system: {debugInfo.systemError}</p>}
      </CardContent>
    </Card>
  );
};
