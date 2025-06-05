
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCategory: 'auth' | 'network' | 'rendering' | 'unknown';
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorCategory: 'unknown'
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorCategory = ErrorBoundary.categorizeError(error);
    return { 
      hasError: true, 
      error,
      errorCategory
    };
  }

  private static categorizeError(error: Error): 'auth' | 'network' | 'rendering' | 'unknown' {
    const message = error.message.toLowerCase();
    
    if (message.includes('auth') || message.includes('login') || message.includes('token')) {
      return 'auth';
    }
    
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return 'network';
    }
    
    if (message.includes('render') || message.includes('component') || message.includes('hook')) {
      return 'rendering';
    }
    
    return 'unknown';
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      errorCategory: 'unknown'
    });
  };

  private getErrorMessage(): string {
    switch (this.state.errorCategory) {
      case 'auth':
        return 'Erro de autenticação. Tente fazer login novamente.';
      case 'network':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      case 'rendering':
        return 'Erro na interface. A página será recarregada.';
      default:
        return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <CardTitle className="text-red-600">
                {this.state.errorCategory === 'auth' ? 'Erro de Autenticação' : 'Oops! Algo deu errado'}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                {this.getErrorMessage()}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-3 rounded text-sm">
                  <summary className="cursor-pointer font-medium">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                    {this.state.error.stack}
                  </pre>
                  {this.state.errorInfo && (
                    <pre className="mt-2 whitespace-pre-wrap break-words text-xs border-t pt-2">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
