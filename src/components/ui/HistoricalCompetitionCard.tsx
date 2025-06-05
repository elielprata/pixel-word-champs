
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface HistoricalCompetitionCardProps {
  competition: {
    week: string;
    position: number;
    score: number;
    totalParticipants: number;
    prize?: number;
    paymentStatus?: 'paid' | 'pending' | 'not_eligible';
  };
}

const HistoricalCompetitionCard = ({ competition }: HistoricalCompetitionCardProps) => {
  const { week, position, score, totalParticipants, prize, paymentStatus } = competition;
  
  const isWinner = prize && prize > 0;
  const getPositionColor = () => {
    if (position <= 3) return "text-yellow-600";
    if (position <= 10) return "text-purple-600";
    return "text-gray-600";
  };

  const getPaymentStatusIcon = () => {
    switch (paymentStatus) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getPaymentStatusText = () => {
    switch (paymentStatus) {
      case 'paid':
        return 'Pago';
      case 'pending':
        return 'Pendente';
      default:
        return null;
    }
  };

  return (
    <Card className="mb-4 border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="font-semibold text-gray-800">{week}</h4>
            <p className="text-sm text-gray-600">{totalParticipants} participantes</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-1 ${getPositionColor()}`}>
              <Trophy className="w-4 h-4" />
              <span className="font-bold">#{position}</span>
            </div>
            <p className="text-sm text-gray-600">{score.toLocaleString()} pts</p>
          </div>
        </div>

        {isWinner && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg p-3 mt-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-800">🏆 Posição Premiada!</p>
                <p className="text-lg font-bold text-yellow-900">R$ {prize?.toFixed(2)}</p>
              </div>
              <div className="flex items-center gap-2">
                {getPaymentStatusIcon()}
                {paymentStatus && (
                  <Badge 
                    variant={paymentStatus === 'paid' ? 'default' : 'secondary'}
                    className={`${
                      paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {getPaymentStatusText()}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default HistoricalCompetitionCard;
