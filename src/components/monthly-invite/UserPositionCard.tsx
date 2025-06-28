
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star } from 'lucide-react';

interface UserPositionCardProps {
  userPosition: {
    position: number;
    prize_amount: number;
  };
}

export const UserPositionCard = ({ userPosition }: UserPositionCardProps) => {
  return (
    <Card className="border-purple-200 bg-purple-50">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-purple-800">
              Você está em {userPosition.position}º lugar
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge 
                variant={userPosition.prize_amount > 0 ? 'default' : 'secondary'}
                className={userPosition.prize_amount > 0 ? 'bg-green-100 text-green-700' : ''}
              >
                {userPosition.prize_amount > 0 
                  ? `Prêmio: R$ ${userPosition.prize_amount}` 
                  : 'Sem prêmio'
                }
              </Badge>
            </div>
          </div>
          <Star className="w-8 h-8 text-purple-500" />
        </div>
      </CardContent>
    </Card>
  );
};
