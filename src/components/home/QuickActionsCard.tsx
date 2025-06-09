
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Users, TrendingUp, Calendar } from 'lucide-react';

interface QuickActionsCardProps {
  onViewFullRanking: () => void;
}

const QuickActionsCard = ({ onViewFullRanking }: QuickActionsCardProps) => {
  const quickActions = [
    {
      icon: Trophy,
      label: 'Ranking Geral',
      description: 'Ver classificação',
      color: 'from-yellow-400 to-orange-500',
      onClick: onViewFullRanking
    },
    {
      icon: Users,
      label: 'Comunidade',
      description: 'Jogadores online',
      color: 'from-blue-400 to-purple-500',
      onClick: () => console.log('Comunidade clicked')
    },
    {
      icon: Calendar,
      label: 'Torneios',
      description: 'Próximos eventos',
      color: 'from-green-400 to-blue-500',
      onClick: () => console.log('Torneios clicked')
    },
    {
      icon: TrendingUp,
      label: 'Estatísticas',
      description: 'Meu progresso',
      color: 'from-purple-400 to-pink-500',
      onClick: () => console.log('Estatísticas clicked')
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg">
      <CardContent className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Ações Rápidas
        </h3>
        
        <div className="grid grid-cols-2 gap-3">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="ghost"
              onClick={action.onClick}
              className="h-auto p-4 flex flex-col items-center gap-2 bg-gradient-to-br hover:scale-105 transition-all duration-200 border border-gray-100"
              style={{
                background: `linear-gradient(135deg, ${action.color.split(' ')[0].replace('from-', '#')}, ${action.color.split(' ')[2].replace('to-', '#')}15)`
              }}
            >
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-sm text-gray-900">{action.label}</p>
                <p className="text-xs text-gray-600">{action.description}</p>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActionsCard;
