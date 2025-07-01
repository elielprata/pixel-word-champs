
import React from 'react';
import { WeeklyConfigModal } from './WeeklyConfigModal';
import { WeeklyConfigErrorBoundary } from './WeeklyConfigErrorBoundary';
import { getCurrentBrasiliaTime } from '@/utils/brasiliaTimeUnified';

interface WeeklyConfigModalWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfigUpdated: () => void;
}

export const WeeklyConfigModalWrapper: React.FC<WeeklyConfigModalWrapperProps> = ({
  open,
  onOpenChange,
  onConfigUpdated
}) => {
  const handleRetry = () => {
    console.log('🔄 WeeklyConfigModalWrapper - tentando recarregar modal...', {
      timestamp: getCurrentBrasiliaTime()
    });
    
    // Fechar e reabrir o modal para forçar re-render
    onOpenChange(false);
    setTimeout(() => {
      onOpenChange(true);
    }, 100);
  };

  const handleModalError = (error: any) => {
    console.error('❌ Erro no WeeklyConfigModal:', error, {
      timestamp: getCurrentBrasiliaTime()
    });
  };

  React.useEffect(() => {
    if (open) {
      console.log('🎯 WeeklyConfigModalWrapper - Modal aberto', {
        timestamp: getCurrentBrasiliaTime()
      });
    } else {
      console.log('📴 WeeklyConfigModalWrapper - Modal fechado', {
        timestamp: getCurrentBrasiliaTime()
      });
    }
  }, [open]);

  console.log('🔍 WeeklyConfigModalWrapper - Renderizando', {
    open,
    timestamp: getCurrentBrasiliaTime()
  });

  return (
    <WeeklyConfigErrorBoundary onRetry={handleRetry}>
      <WeeklyConfigModal
        open={open}
        onOpenChange={onOpenChange}
        onConfigUpdated={onConfigUpdated}
      />
    </WeeklyConfigErrorBoundary>
  );
};
