
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from 'lucide-react';

interface AdminLoadingStateProps {
  message?: string;
  showCards?: boolean;
  cardsCount?: number;
}

export const AdminLoadingState = ({ 
  message = "Carregando...", 
  showCards = false, 
  cardsCount = 3 
}: AdminLoadingStateProps) => {
  if (showCards) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[...Array(cardsCount)].map((_, index) => (
          <Card key={index} className="border-slate-200 shadow-sm animate-pulse">
            <CardContent className="p-4">
              <div className="h-16 bg-slate-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="flex items-center gap-2 text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
};
