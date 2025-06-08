
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Settings, ArrowRight, Activity, Users } from 'lucide-react';
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
    <div className="space-y-6">
      {/* Header moderno */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-24 -translate-x-24"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Gestão de Conteúdo</h1>
              <p className="text-white/80 text-lg max-w-2xl">
                Central de controle para palavras e configurações do jogo
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-white/20 text-white border-white/30 px-3 py-1">
                <Activity className="h-3 w-3 mr-1" />
                Sistema Ativo
              </Badge>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {quickStats.map((stat, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-white/70 text-sm">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Tabs defaultValue="words" className="space-y-6">
        {/* Navigation renovada */}
        <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-sm">
          <TabsList className="bg-transparent p-0 h-auto w-full">
            <div className="grid grid-cols-2 w-full gap-2">
              {featureCards.map((card) => (
                <TabsTrigger 
                  key={card.id}
                  value={card.id}
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg p-4 rounded-lg transition-all duration-200 h-auto flex flex-col items-center gap-2 hover:bg-slate-50"
                >
                  <card.icon className="h-5 w-5" />
                  <span className="font-medium text-sm">{card.title}</span>
                </TabsTrigger>
              ))}
            </div>
          </TabsList>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {featureCards.map((card) => (
            <Card key={card.id} className="group hover:shadow-lg transition-all duration-200 border-slate-200 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`bg-gradient-to-r ${card.gradient} p-3 rounded-xl shadow-sm group-hover:scale-110 transition-transform duration-200`}>
                      <card.icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-semibold text-slate-900">{card.title}</CardTitle>
                      <p className="text-slate-600 text-sm mt-1">{card.description}</p>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200" />
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-slate-600 mb-1">Status Atual</p>
                  <p className="text-lg font-bold text-slate-900">{card.stats}</p>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-600">Recursos Principais:</p>
                  <ul className="space-y-1">
                    {card.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-slate-600">
                        <div className="w-1.5 h-1.5 bg-slate-400 rounded-full"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tab Contents */}
        <TabsContent value="words" className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Gerenciamento de Palavras</h2>
                <p className="text-slate-600 text-sm">Controle completo do vocabulário do jogo</p>
              </div>
            </div>
            <WordsManagement />
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-gradient-to-r from-slate-600 to-slate-700 p-2 rounded-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Configurações do Sistema</h2>
                <p className="text-slate-600 text-sm">Ajuste regras e mecânicas do jogo</p>
              </div>
            </div>
            <GameSettings />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
