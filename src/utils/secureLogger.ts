
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
    // Limitar profundidade para evitar recursão infinita
    if (depth > 10) {
      return '[MAX_DEPTH_REACHED]';
    }

    // Verificar tipos primitivos
    if (data === null || data === undefined) {
      return data;
    }

    if (typeof data !== 'object') {
      return data;
    }

    // Verificar referências circulares
    if (visited.has(data)) {
      return '[CIRCULAR_REFERENCE]';
    }

    // Tratamento especial para erros
    if (data instanceof Error) {
      return {
        name: data.name,
        message: this.maskString(data.message),
        stack: data.stack ? '[STACK_TRACE]' : undefined
      };
    }

    // Tratamento para arrays
    if (Array.isArray(data)) {
      if (data.length > 50) {
        return `[ARRAY_TOO_LARGE: ${data.length} items]`;
      }
      
      visited.add(data);
      try {
        const result = data.slice(0, 10).map(item => 
          this.maskSensitiveData(item, visited, depth + 1)
        );
        if (data.length > 10) {
          result.push(`[... ${data.length - 10} more items]`);
        }
        return result;
      } finally {
        visited.delete(data);
      }
    }

    // Verificar se é um objeto DOM ou função
    if (typeof data === 'function' || 
        (data.constructor && data.constructor.name && 
         ['HTMLElement', 'Window', 'Document'].some(name => 
           data.constructor.name.includes(name)))) {
      return `[${data.constructor?.name || 'OBJECT'}]`;
    }

    visited.add(data);
    
    try {
      const masked: any = {};
      const keys = Object.keys(data);
      
      // Limitar número de propriedades processadas
      if (keys.length > 20) {
        return `[OBJECT_TOO_LARGE: ${keys.length} properties]`;
      }
      
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
          masked[key] = '[MASK_ERROR]';
        }
      }

      return masked;
    } catch (error) {
      return '[MASKING_FAILED]';
    } finally {
      visited.delete(data);
    }
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
    // Tentar mascarar dados com fallback seguro
    let maskedData;
    try {
      maskedData = data ? this.maskSensitiveData(data) : undefined;
    } catch (error) {
      maskedData = '[DATA_MASKING_FAILED]';
    }

    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data: maskedData,
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
      try {
        const entry = this.formatMessage('ERROR', message, data, context);
        this.logToConsole(entry);
        
        // Em produção, registrar erros críticos
        if (this.environment === 'production') {
          // Aqui poderia ser integrado com serviços de monitoramento
          // como Sentry, LogRocket, etc.
        }
      } catch (error) {
        // Fallback seguro em caso de erro no logging
        console.error(`[ERROR] ${message}`, '[LOG_ERROR]');
      }
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog(2)) {
      try {
        const entry = this.formatMessage('WARN', message, data, context);
        this.logToConsole(entry);
      } catch (error) {
        console.warn(`[WARN] ${message}`, '[LOG_ERROR]');
      }
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog(3)) {
      try {
        const entry = this.formatMessage('INFO', message, data, context);
        this.logToConsole(entry);
      } catch (error) {
        console.info(`[INFO] ${message}`, '[LOG_ERROR]');
      }
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog(4)) {
      try {
        const entry = this.formatMessage('DEBUG', message, data, context);
        this.logToConsole(entry);
      } catch (error) {
        console.debug(`[DEBUG] ${message}`, '[LOG_ERROR]');
      }
    }
  }

  // Método específico para logs de produção críticos
  production(message: string, data?: any, context?: string): void {
    if (this.environment === 'production') {
      try {
        const entry = this.formatMessage('PROD', message, data, context);
        this.logToConsole(entry);
      } catch (error) {
        console.log(`[PROD] ${message}`, '[LOG_ERROR]');
      }
    }
  }

  // Método para auditoria de segurança
  security(message: string, data?: any, context?: string): void {
    try {
      const entry = this.formatMessage('SECURITY', message, data, context);
      this.logToConsole(entry);
      
      // Logs de segurança sempre são registrados independente do nível
      if (this.environment === 'production') {
        // Integração com sistemas de auditoria de segurança
      }
    } catch (error) {
      console.warn(`🔒 [SECURITY] ${message}`, '[LOG_ERROR]');
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
