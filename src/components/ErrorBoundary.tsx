
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorCategory: 'auth' | 'network' | 'rendering' | 'database' | 'validation' | 'unknown';
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

  private static categorizeError(error: Error): 'auth' | 'network' | 'rendering' | 'database' | 'validation' | 'unknown' {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';
    
    // Verificação mais precisa para erros de autenticação
    if (
      message.includes('auth') || 
      message.includes('login') || 
      message.includes('token') ||
      message.includes('unauthorized') ||
      message.includes('forbidden') ||
      message.includes('session') ||
      stack.includes('auth')
    ) {
      return 'auth';
    }
    
    // Verificação para erros de rede
    if (
      message.includes('network') || 
      message.includes('fetch') || 
      message.includes('connection') ||
      message.includes('timeout') ||
      message.includes('cors') ||
      error.name === 'NetworkError' ||
      error.name === 'TypeError' && message.includes('failed to fetch')
    ) {
      return 'network';
    }
    
    // Verificação para erros de banco de dados
    if (
      message.includes('supabase') ||
      message.includes('database') ||
      message.includes('sql') ||
      message.includes('row level security') ||
      message.includes('pgrst') ||
      stack.includes('supabase')
    ) {
      return 'database';
    }
    
    // Verificação para erros de validação
    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required') ||
      message.includes('format') ||
      error.name === 'ValidationError'
    ) {
      return 'validation';
    }
    
    // Verificação para erros de renderização
    if (
      message.includes('render') || 
      message.includes('component') || 
      message.includes('hook') ||
      message.includes('react') ||
      stack.includes('react') ||
      error.name === 'ChunkLoadError'
    ) {
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
        return 'Erro de autenticação. Faça login novamente ou entre em contato com o suporte.';
      case 'network':
        return 'Erro de conexão. Verifique sua internet e tente novamente.';
      case 'database':
        return 'Erro no banco de dados. Tente novamente em alguns instantes.';
      case 'validation':
        return 'Dados inválidos. Verifique as informações inseridas.';
      case 'rendering':
        return 'Erro na interface. A página será recarregada.';
      default:
        return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
    }
  }

  private getErrorAction(): string {
    switch (this.state.errorCategory) {
      case 'auth':
        return 'Fazer Login Novamente';
      case 'network':
        return 'Tentar Reconectar';
      case 'rendering':
        return 'Recarregar Página';
      default:
        return 'Tentar Novamente';
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-lg shadow-lg border">
            <div className="p-6 text-center">
              <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-red-600 mb-4">
                {this.state.errorCategory === 'auth' ? 'Erro de Autenticação' : 'Oops! Algo deu errado'}
              </h2>
              <p className="text-gray-600 mb-4">
                {this.getErrorMessage()}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="text-left bg-gray-100 p-3 rounded text-sm mb-4">
                  <summary className="cursor-pointer font-medium">
                    Detalhes do erro (desenvolvimento)
                  </summary>
                  <div className="mt-2 space-y-2">
                    <div>
                      <strong>Categoria:</strong> {this.state.errorCategory}
                    </div>
                    <div>
                      <strong>Tipo:</strong> {this.state.error.name}
                    </div>
                    <pre className="whitespace-pre-wrap break-words text-xs">
                      {this.state.error.message}
                    </pre>
                    {this.state.error.stack && (
                      <pre className="whitespace-pre-wrap break-words text-xs border-t pt-2">
                        {this.state.error.stack}
                      </pre>
                    )}
                    {this.state.errorInfo && (
                      <pre className="whitespace-pre-wrap break-words text-xs border-t pt-2">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
              <Button onClick={this.handleReset} className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                {this.getErrorAction()}
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
