
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

export const LoadingState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-slate-600">Carregando competições...</p>
      </CardContent>
    </Card>
  );
};
