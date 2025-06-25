
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from 'lucide-react';

export const EmptyState: React.FC = () => {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Calendar className="h-12 w-12 text-slate-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-900 mb-2">Nenhuma competição encontrada</h3>
        <p className="text-slate-600">Crie sua primeira competição diária para começar.</p>
      </CardContent>
    </Card>
  );
};
