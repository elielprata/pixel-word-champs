
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Clock, Target } from 'lucide-react';

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

export const DailyCompetitionStats: React.FC<DailyCompetitionStatsProps> = ({ competitions }) => {
  // Calculate real stats from competitions data
  const activeCompetitions = competitions.filter(comp => comp.status === 'active').length;
  const totalParticipants = competitions.reduce((sum, comp) => sum + (comp.max_participants || 0), 0);
  const averageParticipants = competitions.length > 0 ? Math.round(totalParticipants / competitions.length) : 0;
  
  const stats = [
    {
      title: "Competições Ativas",
      value: activeCompetitions.toString(),
      icon: Trophy,
      color: "text-yellow-600"
    },
    {
      title: "Participantes Médio",
      value: averageParticipants.toString(),
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Total Competições",
      value: competitions.length.toString(),
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Taxa de Atividade",
      value: competitions.length > 0 ? `${Math.round((activeCompetitions / competitions.length) * 100)}%` : "0%",
      icon: Target,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {stats.map((stat, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DailyCompetitionStats;
