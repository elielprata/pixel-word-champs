
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

  private maskSensitiveData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return data.map(item => this.maskSensitiveData(item));
    }

    const masked = { ...data };
    
    Object.keys(masked).forEach(key => {
      const lowerKey = key.toLowerCase();
      const isSensitive = this.sensitiveFields.some(field => 
        lowerKey.includes(field) || lowerKey.endsWith('_key') || lowerKey.endsWith('_token')
      );

      if (isSensitive && typeof masked[key] === 'string') {
        masked[key] = this.maskString(masked[key]);
      } else if (typeof masked[key] === 'object') {
        masked[key] = this.maskSensitiveData(masked[key]);
      }
    });

    return masked;
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
