
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Activity,
  Fingerprint,
  Target
} from 'lucide-react';

interface FraudDetectionPanelProps {
  users: any[];
  stats: any;
}

export const FraudDetectionPanel = ({ users, stats }: FraudDetectionPanelProps) => {
  // Análises de fraude
  const highRiskUsers = users.filter(u => u.suspicion_score >= 70);
  const mediumRiskUsers = users.filter(u => u.suspicion_score >= 40 && u.suspicion_score < 70);
  const totalInvites = users.reduce((sum, u) => sum + u.total_invites, 0);
  const suspiciousInvites = users
    .filter(u => u.suspicion_score >= 40)
    .reduce((sum, u) => sum + u.total_invites, 0);
  
  const fraudRate = totalInvites > 0 ? (suspiciousInvites / totalInvites) * 100 : 0;

  // Padrões detectados
  const patterns = [
    {
      name: 'Spam de Indicações',
      description: 'Usuários com muitas indicações em pouco tempo',
      count: users.filter(u => u.total_invites >= 10).length,
      severity: 'high'
    },
    {
      name: 'Usuários Inativos',
      description: 'Indicações de usuários que nunca jogaram',
      count: users.filter(u => 
        u.invited_users.filter(inv => inv.games_played === 0).length / u.total_invites > 0.7
      ).length,
      severity: 'medium'
    },
    {
      name: 'Nomes Similares',
      description: 'Possíveis contas múltiplas com nomes parecidos',
      count: 0, // TODO: Implementar detecção
      severity: 'low'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Métricas de Fraude */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Fraude</CardTitle>
            <Target className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {fraudRate.toFixed(1)}%
            </div>
            <Progress value={fraudRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Alto Risco</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {highRiskUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Score ≥ 70
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Médio Risco</CardTitle>
            <TrendingUp className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {mediumRiskUsers.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Score 40-69
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Indicações Suspeitas</CardTitle>
            <Users className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {suspiciousInvites}
            </div>
            <p className="text-xs text-muted-foreground">
              De {totalInvites} total
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Padrões de Fraude Detectados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Padrões de Fraude Detectados
          </CardTitle>
          <CardDescription>
            Análise automática de comportamentos suspeitos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {patterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{pattern.name}</h4>
                    <Badge variant={
                      pattern.severity === 'high' ? 'destructive' : 
                      pattern.severity === 'medium' ? 'default' : 'secondary'
                    }>
                      {pattern.severity === 'high' ? 'Alto' : 
                       pattern.severity === 'medium' ? 'Médio' : 'Baixo'}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{pattern.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">{pattern.count}</div>
                  <div className="text-xs text-slate-500">casos</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Usuários de Alto Risco */}
      {highRiskUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertTriangle className="w-5 h-5" />
              Usuários de Alto Risco
            </CardTitle>
            <CardDescription>
              Usuários que requerem atenção imediata
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskUsers.slice(0, 5).map((user, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-200 rounded-full flex items-center justify-center text-sm font-medium text-red-800">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium text-red-900">{user.username}</div>
                      <div className="text-sm text-red-700">
                        {user.total_invites} indicações • Score: {user.suspicion_score}
                      </div>
                    </div>
                  </div>
                  <Badge variant="destructive">
                    Crítico
                  </Badge>
                </div>
              ))}
              {highRiskUsers.length > 5 && (
                <p className="text-sm text-slate-600 text-center">
                  E mais {highRiskUsers.length - 5} usuários de alto risco...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status da Integração FingerprintJS */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-purple-600" />
            Status da Integração FingerprintJS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Configuração Básica</span>
              <Badge variant="default">Ativo</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Coleta de Fingerprints</span>
              <Badge variant="secondary">Em Desenvolvimento</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Detecção de Multi-contas</span>
              <Badge variant="secondary">Pendente</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Análise de Localização</span>
              <Badge variant="secondary">Pendente</Badge>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Próximos Passos:</strong> A integração completa com FingerprintJS permitirá
              detectar dispositivos únicos, múltiplas contas do mesmo usuário e padrões
              geográficos suspeitos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
