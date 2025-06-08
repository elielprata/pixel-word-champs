
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Users, DollarSign, Settings, Eye, Download } from 'lucide-react';

interface RankingInfoCardProps {
  type: 'daily' | 'weekly';
  title: string;
  description: string;
  participants: number;
  prizePool: number;
  status: 'active' | 'inactive';
  lastUpdate: string;
}

export const RankingInfoCard = ({ 
  type, 
  title, 
  description, 
  participants, 
  prizePool, 
  status, 
  lastUpdate 
}: RankingInfoCardProps) => {
  const isDaily = type === 'daily';
  const iconColor = isDaily ? 'from-blue-500 to-blue-600' : 'from-purple-500 to-purple-600';
  const statusColor = status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700 border-slate-200';

  return (
    <Card className="border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`bg-gradient-to-r ${iconColor} p-2.5 rounded-lg shadow-sm`}>
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">{title}</CardTitle>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            </div>
          </div>
          <Badge className={statusColor}>
            {status === 'active' ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Participantes</span>
            </div>
            <p className="text-xl font-bold text-slate-900">{participants.toLocaleString('pt-BR')}</p>
          </div>
          
          <div className="bg-slate-50 p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-medium text-slate-600">Prêmio Total</span>
            </div>
            <p className="text-xl font-bold text-slate-900">R$ {prizePool.toLocaleString('pt-BR')}</p>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Calendar className="h-4 w-4" />
            <span>Atualizado: {lastUpdate}</span>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200">
              <Eye className="h-4 w-4 mr-1" />
              Ver
            </Button>
            <Button variant="outline" size="sm" className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200">
              <Download className="h-4 w-4 mr-1" />
              Exportar
            </Button>
            <Button variant="outline" size="sm" className="text-slate-600 hover:text-slate-700 hover:bg-slate-50 border-slate-200">
              <Settings className="h-4 w-4 mr-1" />
              Config
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
