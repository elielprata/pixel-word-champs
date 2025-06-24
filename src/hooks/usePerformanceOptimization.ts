
import { useState, useEffect } from 'react';
import { performanceOptimizationService } from '@/services/performanceOptimizationService';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

interface PerformanceMetrics {
  query_execution_time: number;
  database_connections: number;
  cache_hit_ratio: number;
  memory_usage: number;
  optimization_suggestions: string[];
}

interface OptimizationResult {
  applied_optimizations: string[];
  performance_improvement: number;
  execution_time_before: number;
  execution_time_after: number;
}

export const usePerformanceOptimization = () => {
  const { toast } = useToast();
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [benchmarks, setBenchmarks] = useState<{ [key: string]: number }>({});
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [isBenchmarking, setIsBenchmarking] = useState(false);

  const loadMetrics = async () => {
    setIsLoadingMetrics(true);
    try {
      const currentMetrics = await performanceOptimizationService.getPerformanceMetrics();
      setMetrics(currentMetrics);
      logger.debug('Métricas de performance carregadas', currentMetrics, 'PERFORMANCE_HOOK');
    } catch (error) {
      toast({
        title: "Erro nas Métricas",
        description: "Falha ao carregar métricas de performance",
        variant: "destructive",
      });
      logger.error('Erro ao carregar métricas', { error }, 'PERFORMANCE_HOOK');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  const runOptimization = async () => {
    setIsOptimizing(true);
    try {
      const result = await performanceOptimizationService.optimizeRankingQueries();
      setOptimizationResult(result);
      
      toast({
        title: "✅ Otimização Concluída",
        description: `Performance melhorou ${result.performance_improvement.toFixed(1)}%`,
      });
      
      // Recarregar métricas após otimização
      await loadMetrics();
    } catch (error) {
      toast({
        title: "Erro na Otimização",
        description: "Falha ao executar otimizações de performance",
        variant: "destructive",
      });
      logger.error('Erro na otimização', { error }, 'PERFORMANCE_HOOK');
    } finally {
      setIsOptimizing(false);
    }
  };

  const runBenchmarks = async () => {
    setIsBenchmarking(true);
    try {
      const results = await performanceOptimizationService.benchmarkQueries();
      setBenchmarks(results);
      
      toast({
        title: "✅ Benchmark Concluído",
        description: "Resultados de performance coletados",
      });
    } catch (error) {
      toast({
        title: "Erro no Benchmark",
        description: "Falha ao executar benchmark de consultas",
        variant: "destructive",
      });
      logger.error('Erro no benchmark', { error }, 'PERFORMANCE_HOOK');
    } finally {
      setIsBenchmarking(false);
    }
  };

  const optimizeIndexes = async () => {
    try {
      const optimizations = await performanceOptimizationService.optimizeDatabaseIndexes();
      
      toast({
        title: "✅ Índices Otimizados",
        description: `${optimizations.length} otimizações aplicadas`,
      });
      
      return optimizations;
    } catch (error) {
      toast({
        title: "Erro nos Índices",
        description: "Falha ao otimizar índices do banco",
        variant: "destructive",
      });
      throw error;
    }
  };

  const clearCache = () => {
    try {
      performanceOptimizationService.clearCache();
      toast({
        title: "Cache Limpo",
        description: "Cache de performance foi limpo",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao limpar cache",
        variant: "destructive",
      });
    }
  };

  // Carregar métricas iniciais
  useEffect(() => {
    loadMetrics();
  }, []);

  return {
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
  };
};
