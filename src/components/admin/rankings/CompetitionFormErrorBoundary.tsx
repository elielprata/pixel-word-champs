
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class CompetitionFormErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('❌ [CompetitionFormErrorBoundary] Erro capturado:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ [CompetitionFormErrorBoundary] Erro detalhado:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'CompetitionFormErrorBoundary'
    });
  }

  public render() {
    if (this.state.hasError) {
      console.log('🚨 [CompetitionFormErrorBoundary] Renderizando tela de erro');
      
      return (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Erro no Formulário
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Ocorreu um erro ao carregar o formulário de competição.
            </p>
            {this.state.error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                <p className="text-xs font-mono text-red-700 mb-2">
                  <strong>Erro:</strong> {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className="text-xs font-mono text-red-600">
                    <summary className="cursor-pointer">Ver stack trace</summary>
                    <pre className="mt-2 whitespace-pre-wrap">{this.state.error.stack}</pre>
                  </details>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button 
                onClick={() => {
                  console.log('🔄 [CompetitionFormErrorBoundary] Tentando novamente...');
                  this.setState({ hasError: false, error: undefined, errorInfo: undefined });
                  if (this.props.onRetry) {
                    this.props.onRetry();
                  }
                }}
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Tentar Novamente
              </Button>
              <Button 
                variant="outline"
                onClick={() => window.location.reload()}
                className="text-xs"
              >
                Recarregar Página
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
