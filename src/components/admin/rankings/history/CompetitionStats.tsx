
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Calendar, Users } from 'lucide-react';

interface CompetitionHistoryItem {
  id: string;
  title: string;
  competition_type: string;
  start_date: string;
  end_date: string;
  status: string;
  prize_pool: number;
  max_participants: number;
  total_participants: number;
  created_at: string;
}

interface CompetitionStatsProps {
  competitions: CompetitionHistoryItem[];
}

export const CompetitionStats: React.FC<CompetitionStatsProps> = ({ competitions }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-red-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Trophy className="h-4 w-4 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-orange-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-orange-700">{competitions.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-lg">
              <Calendar className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-green-600 font-medium">Finalizadas</p>
              <p className="text-2xl font-bold text-green-700">
                {competitions.filter(c => c.status === 'completed').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-gradient-to-br from-red-50 to-pink-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-red-600 font-medium">Canceladas</p>
              <p className="text-2xl font-bold text-red-700">
                {competitions.filter(c => c.status === 'cancelled').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-yellow-100 p-2 rounded-lg">
              <Trophy className="h-4 w-4 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-yellow-600 font-medium">Prêmios Total</p>
              <p className="text-xl font-bold text-yellow-700">
                R$ {competitions.reduce((total, comp) => total + comp.prize_pool, 0).toFixed(2)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
