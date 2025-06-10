
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Users, Clock, Target } from 'lucide-react';

export const DailyCompetitionStats = () => {
  const stats = [
    {
      title: "Competições Ativas",
      value: "3",
      icon: Trophy,
      color: "text-yellow-600"
    },
    {
      title: "Participantes Total",
      value: "247",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Tempo Médio",
      value: "8min",
      icon: Clock,
      color: "text-green-600"
    },
    {
      title: "Taxa de Conclusão",
      value: "89%",
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
