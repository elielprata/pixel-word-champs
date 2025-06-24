
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';

interface CleanupItemCardProps {
  title: string;
  icon: React.ReactNode;
  count: number;
  description: string;
  onCleanup: () => void;
  isExecuting: boolean;
  titleColor: string;
  countColor: string;
  bgColor: string;
}

export const CleanupItemCard = ({
  title,
  icon,
  count,
  description,
  onCleanup,
  isExecuting,
  titleColor,
  countColor,
  bgColor
}: CleanupItemCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className={`flex items-center gap-2 ${titleColor}`}>
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <span className={`text-3xl font-bold ${countColor}`}>
              {count}
            </span>
            <p className="text-sm text-gray-600">
              {title === 'Sessões Órfãs' ? 'Sessões sem vinculação' :
               title === 'Competições Legadas' ? 'Competições vinculadas' :
               'Torneios finalizados'}
            </p>
          </div>
          
          <div className={`${bgColor} p-3 rounded-lg text-sm`}>
            {description}
          </div>
          
          <Button 
            onClick={onCleanup}
            disabled={isExecuting || count === 0}
            className="w-full"
            variant="outline"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Limpar {title}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
