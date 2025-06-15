
import { IntelligentWordService } from '@/services/intelligentWordService';
import { warmOptimizedCacheV2 } from '@/hooks/useOptimizedRandomWordSelection';
import { logger } from '../logger';

// PRÉ-AQUECIMENTO HÍBRIDO UNIFICADO
export const warmHybridCache = async (): Promise<boolean> => {
  try {
    logger.info('🔥 Iniciando cache warming híbrido unificado', undefined, 'CACHE_WARMING_UNIFIED');
    
    // Executar ambos os sistemas em paralelo para máxima eficiência
    const [intelligentResult, optimizedResult] = await Promise.allSettled([
      warmIntelligentCache(),
      warmOptimizedCacheV2()
    ]);
    
    const intelligentSuccess = intelligentResult.status === 'fulfilled' && intelligentResult.value;
    const optimizedSuccess = optimizedResult.status === 'fulfilled';
    
    const overallSuccess = intelligentSuccess || optimizedSuccess;
    
    logger.info('✅ Cache warming híbrido concluído', { 
      intelligentSuccess,
      optimizedSuccess,
      overallSuccess
    }, 'CACHE_WARMING_UNIFIED');
    
    return overallSuccess;
  } catch (error) {
    logger.error('❌ Erro no cache warming híbrido', { error }, 'CACHE_WARMING_UNIFIED');
    return false;
  }
};

// PRÉ-AQUECIMENTO INTELIGENTE OTIMIZADO
export const warmIntelligentCache = async (): Promise<boolean> => {
  try {
    logger.info('🔥 Cache warming inteligente otimizado', undefined, 'CACHE_WARMING_INTELLIGENT');
    
    // Pré-carregar para tamanhos mais comuns (otimizado)
    const priorityLengths = [6, 7, 8]; // Tamanhos mais usados primeiro
    const secondaryLengths = [5, 9]; // Tamanhos secundários
    
    // Priorizar tamanhos mais comuns
    const priorityPromises = priorityLengths.map(length => 
      IntelligentWordService.preloadCache(length).catch(error => {
        logger.warn(`⚠️ Erro no preload prioritário para length ${length}`, { error }, 'CACHE_WARMING_INTELLIGENT');
      })
    );
    
    await Promise.allSettled(priorityPromises);
    
    // Carregar tamanhos secundários em background
    setTimeout(() => {
      const secondaryPromises = secondaryLengths.map(length => 
        IntelligentWordService.preloadCache(length).catch(error => {
          logger.warn(`⚠️ Erro no preload secundário para length ${length}`, { error }, 'CACHE_WARMING_INTELLIGENT');
        })
      );
      Promise.allSettled(secondaryPromises);
    }, 1000);
    
    logger.info('✅ Cache warming inteligente concluído', { 
      priorityLengths,
      secondaryLengths
    }, 'CACHE_WARMING_INTELLIGENT');
    
    return true;
  } catch (error) {
    logger.error('❌ Erro no cache warming inteligente', { error }, 'CACHE_WARMING_INTELLIGENT');
    return false;
  }
};
