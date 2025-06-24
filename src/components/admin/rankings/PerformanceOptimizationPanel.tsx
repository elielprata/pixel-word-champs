
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, 
  Database, 
  Clock,
  TrendingUp,
  RefreshCw,
  Trash2,
  Settings,
  BarChart3,
  Loader2
} from 'lucide-react';
import { usePerformanceOptimization } from '@/hooks/usePerformanceOptimization';

export const PerformanceOptimizationPanel = () => {
  const {
    metrics,
    optimizationResult,
    benchmarks,
    isOptimizing,
    isLoadingMetrics,
    isBenchmarking,
    loadMetrics,
    runOptimization,
    runBenchmarks,
    optimizeIndexes,
    clearCache
  } = usePerformanceOptimization();

  const getPerformanceColor = (value: number, threshold: { good: number; warning: number }) => {
    if (value <= threshold.good) return 'text-green-600 bg-green-50';
    if (value <= threshold.warning) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const formatMs = (ms: number) => `${ms.toFixed(0)}ms`;
  const formatPercentage = (value: number) => `${(value * 100).toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Controles de Otimização */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Otimização de Performance
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={loadMetrics}
                disabled={isLoadingMetrics}
                size="sm"
                variant="outline"
              >
                {isLoadingMetrics ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
              </Button>
              <Button
                onClick={clearCache}
                size="sm"
                variant="outline"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar Cache
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Button
              onClick={runOptimization}
              disabled={isOptimizing}
              className="w-full"
            >
              {isOptimizing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <TrendingUp className="h-4 w-4 mr-2" />
              )}
              Otimizar Consultas
            </Button>
            <Button
              onClick={runBenchmarks}
              disabled={isBenchmarking}
              variant="outline"
              className="w-full"
            >
              {isBenchmarking ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="h-4 w-4 mr-2" />
              )}
              Executar Benchmark
            </Button>
            <Button
              onClick={optimizeIndexes}
              variant="outline"
              className="w-full"
            >
              <Database className="h-4 w-4 mr-2" />
              Otimizar Índices
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Performance */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <Badge className={getPerformanceColor(metrics.query_execution_time, { good: 300, warning: 800 })}>
                    {formatMs(metrics.query_execution_time)}
                  </Badge>
                </div>
                <p className="text-sm font-medium">Tempo de Consulta</p>
                <Progress value={Math.min(100, (metrics.query_execution_time / 1000) * 100)} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Database className="h-5 w-5 text-green-600" />
                  <Badge className={getPerformanceColor(metrics.database_connections, { good: 20, warning: 40 })}>
                    {metrics.database_connections}
                  </Badge>
                </div>
                <p className="text-sm font-medium">Conexões DB</p>
                <Progress value={(metrics.database_connections / 60) * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <TrendingUp className="h-5 w-5 text-purple-600" />
                  <Badge className="text-purple-600 bg-purple-50">
                    {formatPercentage(metrics.cache_hit_ratio)}
                  </Badge>
                </div>
                <p className="text-sm font-medium">Hit Rate Cache</p>
                <Progress value={metrics.cache_hit_ratio * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Settings className="h-5 w-5 text-orange-600" />
                  <Badge className={getPerformanceColor(metrics.memory_usage * 100, { good: 50, warning: 70 })}>
                    {formatPercentage(metrics.memory_usage)}
                  </Badge>
                </div>
                <p className="text-sm font-medium">Uso de Memória</p>
                <Progress value={metrics.memory_usage * 100} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Resultado da Otimização */}
      {optimizationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Resultado da Otimização
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-green-600">
                  +{optimizationResult.performance_improvement.toFixed(1)}%
                </p>
                <p className="text-sm text-gray-600">Melhoria</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatMs(optimizationResult.execution_time_before)}
                </p>
                <p className="text-sm text-gray-600">Antes</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {formatMs(optimizationResult.execution_time_after)}
                </p>
                <p className="text-sm text-gray-600">Depois</p>
              </div>
            </div>

            {optimizationResult.applied_optimizations.length > 0 && (
              <div>
                <p className="font-medium mb-2">Otimizações Aplicadas:</p>
                <ul className="space-y-1">
                  {optimizationResult.applied_optimizations.map((opt, index) => (
                    <li key={index} className="text-sm text-gray-700 flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      {opt}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Benchmarks */}
      {Object.keys(benchmarks).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Resultados do Benchmark
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(benchmarks).map(([query, time]) => (
                <div key={query} className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {query.replace('_', ' ')}
                  </span>
                  <Badge variant="outline">
                    {formatMs(time)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sugestões de Otimização */}
      {metrics?.optimization_suggestions && metrics.optimization_suggestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-orange-600" />
              Sugestões de Otimização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {metrics.optimization_suggestions.map((suggestion, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  {suggestion}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
