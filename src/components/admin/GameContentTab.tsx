
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Settings, ArrowRight, Activity, Users, Crown, Award } from 'lucide-react';
import { WordsManagement } from './content/WordsManagement';
import { GameSettings } from './content/GameSettings';

export const GameContentTab = () => {
  const quickStats = [
    { label: 'Palavras Ativas', value: '2,847', icon: BookOpen, color: 'text-blue-600' },
    { label: 'Configurações Ativas', value: '12', icon: Settings, color: 'text-slate-600' },
    { label: 'Participantes Online', value: '1,234', icon: Users, color: 'text-purple-600' },
  ];

  const featureCards = [
    {
      id: 'words',
      title: 'Banco de Palavras',
      description: 'Gerencie o vocabulário do jogo por categorias',
      icon: BookOpen,
      gradient: 'from-blue-600 to-cyan-600',
      stats: '2,847 palavras ativas',
      features: ['Categorização automática', 'Validação por IA', 'Filtros avançados']
    },
    {
      id: 'settings',
      title: 'Configurações do Jogo',
      description: 'Ajuste regras, pontuação e mecânicas',
      icon: Settings,
      gradient: 'from-slate-600 to-slate-700',
      stats: '12 configurações ativas',
      features: ['Sistema de pontos', 'Níveis de dificuldade', 'Tempos de partida']
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section - Similar to RankingsTab */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-lg shadow-md">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  Gestão de Conteúdo
                </h1>
                <p className="text-slate-600 mt-1 text-sm">
                  Central de controle para palavras e configurações do jogo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 px-3 py-1">
                <Crown className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 px-3 py-1">
                <Award className="h-3 w-3 mr-1" />
                IA Integrada
              </Badge>
            </div>
          </div>
        </div>

        {/* Métricas Overview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-slate-600" />
              <h2 className="text-lg font-semibold text-slate-900">Métricas do Sistema</h2>
            </div>
          </div>
          
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className="border-slate-200 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg">
                      <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-slate-600 text-sm">{stat.label}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <Tabs defaultValue="words" className="w-full">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <TabsList className="grid grid-cols-2 bg-white border border-slate-200">
                  <TabsTrigger value="words" className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
                    <BookOpen className="h-4 w-4" />
                    Banco de Palavras
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-slate-50 data-[state=active]:text-slate-700">
                    <Settings className="h-4 w-4" />
                    Configurações
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <div className="p-6">
              <TabsContent value="words" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                      Gerenciamento de Palavras
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Controle completo do vocabulário do jogo
                    </p>
                  </div>
                </div>
                <WordsManagement />
              </TabsContent>

              <TabsContent value="settings" className="space-y-6 mt-0">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
                      <Settings className="h-5 w-5 text-slate-600" />
                      Configurações do Sistema
                    </h3>
                    <p className="text-slate-600 text-sm">
                      Ajuste regras e mecânicas do jogo
                    </p>
                  </div>
                </div>
                <GameSettings />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
