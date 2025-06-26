
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

interface WeeklyConfigErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

export class WeeklyConfigErrorBoundary extends React.Component<
  WeeklyConfigErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: WeeklyConfigErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 WeeklyConfigModal Error Boundary capturou erro:', error);
    return {
      hasError: true,
      error,
      errorInfo: error.stack
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Detalhes completos do erro no WeeklyConfigModal:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card className="w-full max-w-md mx-auto border-red-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              Erro na Configuração Semanal
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Ocorreu um erro ao carregar o modal de configuração.
            </p>
            
            <div className="bg-red-50 p-3 rounded text-xs font-mono text-red-800">
              {this.state.error?.message || 'Erro desconhecido'}
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false });
                  this.props.onRetry?.();
                }}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3 w-3" />
                Tentar Novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
