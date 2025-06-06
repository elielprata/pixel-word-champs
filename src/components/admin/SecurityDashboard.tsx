
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, AlertTriangle, CheckCircle, Activity, Users } from 'lucide-react';

interface SecurityDashboardProps {
  securityScore: number;
  totalAlerts: number;
  activeThreats: number;
}

export const SecurityDashboard = ({ securityScore, totalAlerts, activeThreats }: SecurityDashboardProps) => {
  const securityFeatures = [
    {
      name: "Detecção Anti-Fraude",
      status: "Ativo",
      description: "IA monitora padrões suspeitos",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200"
    },
    {
      name: "Monitoramento em Tempo Real",
      status: "Ativo",
      description: "Análise contínua de comportamento",
      icon: Eye,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200"
    },
    {
      name: "Validação de Pontuação",
      status: "Ativo",
      description: "Verifica legitimidade dos scores",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200"
    },
    {
      name: "Análise de Padrões",
      status: "Ativo",
      description: "Detecta comportamentos anômalos",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200"
    }
  ];

  const stats = [
    {
      label: "Score de Segurança",
      value: `${securityScore}/5.0`,
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      label: "Alertas Hoje",
      value: totalAlerts.toString(),
      icon: AlertTriangle,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50"
    },
    {
      label: "Ameaças Ativas",
      value: activeThreats.toString(),
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      label: "Usuários Monitorados",
      value: "8.5K",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-xs text-gray-600">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Features Grid */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-600" />
            Sistemas de Proteção Ativos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {securityFeatures.map((feature, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border-2 ${feature.borderColor} ${feature.bgColor} hover:shadow-sm transition-all`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm`}>
                    <feature.icon className={`w-4 h-4 ${feature.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-gray-900 text-sm">{feature.name}</h4>
                      <Badge variant="outline" className="bg-white border-green-200 text-green-700 text-xs">
                        {feature.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
