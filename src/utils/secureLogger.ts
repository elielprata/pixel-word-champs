
interface LogLevel {
  NONE: 0;
  ERROR: 1;
  WARN: 2;
  INFO: 3;
  DEBUG: 4;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  data?: any;
  context?: string;
  environment: string;
}

class SecureLogger {
  private logLevel: number;
  private environment: string;
  private sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'email', 'phone', 'cpf', 'cnpj', 'pix', 'card', 'credit',
    'access_token', 'refresh_token', 'session', 'authorization'
  ];

  constructor() {
    this.environment = import.meta.env.PROD ? 'production' : 'development';
    
    // Configuração de níveis por ambiente
    if (import.meta.env.PROD) {
      this.logLevel = 2; // WARN e ERROR apenas em produção
    } else {
      this.logLevel = 4; // DEBUG completo em desenvolvimento
    }

    // Log de inicialização apenas em desenvolvimento
    if (!import.meta.env.PROD) {
      console.log('[SECURE_LOGGER] Inicializado', { 
        environment: this.environment, 
        logLevel: this.logLevel 
      });
    }
  }

  private maskSensitiveData(data: any, visited = new WeakSet(), depth = 0): any {
    // Proteção contra profundidade excessiva
    const maxDepth = 10;
    if (depth > maxDepth) {
      return '[MAX_DEPTH_REACHED]';
    }

    // Verificar tipos primitivos
    if (!data || typeof data !== 'object') {
      return data;
    }

    // Proteção contra referências circulares
    if (visited.has(data)) {
      return '[CIRCULAR_REFERENCE]';
    }

    // Marcar objeto como visitado
    visited.add(data);

    try {
      // Tratamento especial para arrays
      if (Array.isArray(data)) {
        // Limitar arrays muito grandes para evitar problemas de performance
        if (data.length > 100) {
          return `[LARGE_ARRAY_${data.length}_ITEMS]`;
        }
        return data.map(item => this.maskSensitiveData(item, visited, depth + 1));
      }

      // Tratamento especial para objetos do React/DOM
      if (this.isReactObject(data)) {
        return '[REACT_OBJECT]';
      }

      // Tratamento especial para funções
      if (typeof data === 'function') {
        return '[FUNCTION]';
      }

      // Tratamento especial para objetos com muitas propriedades
      const keys = Object.keys(data);
      if (keys.length > 50) {
        return `[LARGE_OBJECT_${keys.length}_KEYS]`;
      }

      // Processar objeto normal
      const masked = {};
      
      for (const key of keys) {
        try {
          const lowerKey = key.toLowerCase();
          const isSensitive = this.sensitiveFields.some(field => 
            lowerKey.includes(field) || lowerKey.endsWith('_key') || lowerKey.endsWith('_token')
          );

          if (isSensitive && typeof data[key] === 'string') {
            masked[key] = this.maskString(data[key]);
          } else {
            masked[key] = this.maskSensitiveData(data[key], visited, depth + 1);
          }
        } catch (error) {
          masked[key] = '[PROCESSING_ERROR]';
        }
      }

      return masked;
    } catch (error) {
      return '[MASKING_ERROR]';
    } finally {
      // Remover da lista de visitados após processamento
      visited.delete(data);
    }
  }

  private isReactObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Verificar propriedades típicas de objetos React
    const reactKeys = ['$$typeof', '_owner', '_store', 'ref', 'key', 'props'];
    const hasReactKeys = reactKeys.some(key => key in obj);
    
    // Verificar se é um elemento React
    const isReactElement = obj.$$typeof && typeof obj.$$typeof === 'symbol';
    
    // Verificar se é um objeto com muitas propriedades internas (como hooks)
    const hasInternalProps = Object.keys(obj).some(key => 
      key.startsWith('_') || key.includes('Hook') || key.includes('Fiber')
    );

    return hasReactKeys || isReactElement || hasInternalProps;
  }

  private maskString(value: string): string {
    if (!value || typeof value !== 'string') return value;
    
    if (value.length <= 4) return '***';
    
    // Para emails, mostrar apenas o primeiro e último caractere + domínio mascarado
    if (value.includes('@')) {
      const [user, domain] = value.split('@');
      return `${user[0]}***${user[user.length - 1]}@***`;
    }
    
    // Para outros valores, mostrar apenas primeiros e últimos caracteres
    return `${value.substring(0, 2)}***${value.substring(value.length - 2)}`;
  }

  private shouldLog(level: number): boolean {
    return level <= this.logLevel;
  }

  private formatMessage(level: string, message: string, data?: any, context?: string): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: data ? this.maskSensitiveData(data) : undefined,
      context,
      environment: this.environment
    };
  }

  private logToConsole(entry: LogEntry): void {
    const logString = `[${entry.level}] ${entry.message}`;
    const logData = entry.data || '';
    
    switch (entry.level) {
      case 'ERROR':
        console.error(logString, logData);
        break;
      case 'WARN':
        console.warn(logString, logData);
        break;
      case 'INFO':
        console.info(logString, logData);
        break;
      case 'DEBUG':
        console.debug(logString, logData);
        break;
      case 'PROD':
        console.log(logString, logData);
        break;
      case 'SECURITY':
        console.warn(`🔒 [SECURITY] ${entry.message}`, logData);
        break;
      default:
        console.log(logString, logData);
    }
  }

  error(message: string, data?: any, context?: string): void {
    if (this.shouldLog(1)) {
      const entry = this.formatMessage('ERROR', message, data, context);
      this.logToConsole(entry);
      
      // Em produção, registrar erros críticos
      if (this.environment === 'production') {
        // Aqui poderia ser integrado com serviços de monitoramento
        // como Sentry, LogRocket, etc.
      }
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog(2)) {
      const entry = this.formatMessage('WARN', message, data, context);
      this.logToConsole(entry);
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog(3)) {
      const entry = this.formatMessage('INFO', message, data, context);
      this.logToConsole(entry);
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog(4)) {
      const entry = this.formatMessage('DEBUG', message, data, context);
      this.logToConsole(entry);
    }
  }

  // Método específico para logs de produção críticos
  production(message: string, data?: any, context?: string): void {
    if (this.environment === 'production') {
      const entry = this.formatMessage('PROD', message, data, context);
      this.logToConsole(entry);
    }
  }

  // Método para auditoria de segurança
  security(message: string, data?: any, context?: string): void {
    const entry = this.formatMessage('SECURITY', message, data, context);
    this.logToConsole(entry);
    
    // Logs de segurança sempre são registrados independente do nível
    if (this.environment === 'production') {
      // Integração com sistemas de auditoria de segurança
    }
  }

  // Método para verificar configuração
  getConfig(): { level: number; environment: string; sensitiveFields: string[] } {
    return {
      level: this.logLevel,
      environment: this.environment,
      sensitiveFields: [...this.sensitiveFields]
    };
  }
}

export const secureLogger = new SecureLogger();
