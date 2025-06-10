
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Target, Calendar, Users } from 'lucide-react';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
}

interface DailyCompetitionStatsProps {
  competitions: DailyCompetition[];
}

export const DailyCompetitionStats: React.FC<DailyCompetitionStatsProps> = ({
  competitions
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg">
              <Target className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-700">{competitions.length}</p>
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
              <p className="text-sm text-green-600 font-medium">Ativas</p>
              <p className="text-2xl font-bold text-green-700">
                {competitions.filter(c => c.status === 'active').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-2 rounded-lg">
              <Users className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-amber-600 font-medium">Agendadas</p>
              <p className="text-2xl font-bold text-amber-700">
                {competitions.filter(c => c.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
