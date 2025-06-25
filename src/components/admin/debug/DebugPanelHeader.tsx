
import React from 'react';
import { CardHeader, CardTitle } from '@/components/ui/card';
import { Bug } from 'lucide-react';

export const DebugPanelHeader = () => {
  return (
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-yellow-800">
        <Bug className="w-5 h-5" />
        Sistema de Debug - Ranking Semanal
      </CardTitle>
    </CardHeader>
  );
};
