
import React, { Component, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/utils/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    logger.error('AdminErrorBoundary capturou erro', { error: error.message }, 'ADMIN_ERROR_BOUNDARY');
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Detalhes do erro no AdminErrorBoundary', { 
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack 
    }, 'ADMIN_ERROR_BOUNDARY');
    
    this.setState({
      errorInfo: errorInfo.componentStack
    });
  }

  handleRetry = () => {
    logger.info('Tentando recuperar do erro', undefined, 'ADMIN_ERROR_BOUNDARY');
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  handleGoHome = () => {
    logger.info('Redirecionando para home após erro', undefined, 'ADMIN_ERROR_BOUNDARY');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full border-red-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-red-50 to-orange-50 border-b border-red-200">
              <CardTitle className="flex items-center gap-2 text-red-800">
                <div className="bg-red-100 p-2 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <span>Erro no Painel Admin</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="text-sm text-slate-600">
                <p className="mb-2">Ocorreu um erro inesperado no painel administrativo.</p>
                {this.state.error && (
                  <div className="bg-slate-100 p-3 rounded-lg text-xs font-mono">
                    {this.state.error.message}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={this.handleRetry}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={this.handleGoHome}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Voltar ao Início
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
