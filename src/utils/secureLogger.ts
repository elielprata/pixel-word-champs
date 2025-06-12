
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
}

class SecureLogger {
  private logLevel: number;
  private sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'email', 'phone', 'cpf', 'cnpj', 'pix', 'card', 'credit'
  ];

  constructor() {
    this.logLevel = import.meta.env.PROD ? 1 : 4; // ERROR only in prod, DEBUG in dev
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
      context
    };
  }

  error(message: string, data?: any, context?: string): void {
    if (this.shouldLog(1)) {
      const entry = this.formatMessage('ERROR', message, data, context);
      console.error(`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog(2)) {
      const entry = this.formatMessage('WARN', message, data, context);
      console.warn(`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog(3)) {
      const entry = this.formatMessage('INFO', message, data, context);
      console.info(`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog(4)) {
      const entry = this.formatMessage('DEBUG', message, data, context);
      console.debug(`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }

  // Método específico para logs de produção críticos
  production(message: string, data?: any, context?: string): void {
    if (import.meta.env.PROD) {
      const entry = this.formatMessage('PROD', message, data, context);
      console.log(`[${entry.level}] ${entry.message}`, entry.data || '');
    }
  }
}

export const secureLogger = new SecureLogger();
