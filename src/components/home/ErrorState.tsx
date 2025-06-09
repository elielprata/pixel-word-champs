
import React from 'react';
import { Trophy, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState = ({ error, onRetry }: ErrorStateProps) => {
  return (
    <div className="text-center p-6 bg-white rounded-xl shadow-sm border border-red-200 mb-6">
      <Trophy className="w-12 h-12 mx-auto mb-3 text-red-400" />
      <p className="text-red-600 font-medium mb-2">Erro ao carregar competições</p>
      <p className="text-sm text-red-500 mb-4">{error}</p>
      <Button onClick={onRetry} variant="outline" size="sm">
        <RefreshCw className="w-4 h-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
};

export default ErrorState;
