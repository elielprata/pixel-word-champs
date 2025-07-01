
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
    // Em desenvolvimento, retornar dados simplificados sem mascaramento recursivo
    if (!import.meta.env.PROD) {
      return this.simplifyDataForDevelopment(data);
    }

    // Em produção, usar mascaramento básico sem recursão profunda
    return this.basicMaskForProduction(data);
  }

  private simplifyDataForDevelopment(data: any): any {
    if (!data) return data;

    // Para valores primitivos, retornar como está
    if (typeof data !== 'object') {
      return data;
    }

    // Para arrays, apenas contar elementos
    if (Array.isArray(data)) {
      return `[Array with ${data.length} items]`;
    }

    // Para objetos React ou complexos, retornar representação simplificada
    if (this.isComplexObject(data)) {
      return '[Complex Object]';
    }

    // Para objetos simples, extrair apenas propriedades básicas
    try {
      const keys = Object.keys(data);
      if (keys.length > 10) {
        return `[Object with ${keys.length} properties]`;
      }

      const simplified: any = {};
      for (const key of keys.slice(0, 5)) { // Apenas primeiras 5 propriedades
        const value = data[key];
        if (typeof value === 'object') {
          simplified[key] = '[Object]';
        } else {
          simplified[key] = this.isSensitiveField(key) ? '***' : value;
        }
      }
      
      if (keys.length > 5) {
        simplified['...'] = `and ${keys.length - 5} more properties`;
      }

      return simplified;
    } catch {
      return '[Unprocessable Object]';
    }
  }

  private basicMaskForProduction(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    if (Array.isArray(data)) {
      return `[Array: ${data.length} items]`;
    }

    // Em produção, retornar apenas informações básicas
    try {
      const keys = Object.keys(data);
      const maskedCount = keys.filter(key => this.isSensitiveField(key)).length;
      return {
        objectType: data.constructor?.name || 'Object',
        propertyCount: keys.length,
        maskedFields: maskedCount
      };
    } catch {
      return '[Production Masked Object]';
    }
  }

  private isComplexObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    
    // Verificar propriedades típicas de objetos React/DOM/Hooks
    const complexIndicators = [
      '$$typeof', '_owner', '_store', 'ref', 'key', 'props',
      'current', 'memoizedState', 'next', 'baseState',
      'Hook', 'Fiber', 'ReactCurrentDispatcher'
    ];
    
    const keys = Object.keys(obj);
    
    // Se tem muitas propriedades ou propriedades internas, é complexo
    if (keys.length > 20) return true;
    
    return complexIndicators.some(indicator => 
      keys.some(key => key.includes(indicator) || key.startsWith('_'))
    );
  }

  private isSensitiveField(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return this.sensitiveFields.some(field => 
      lowerKey.includes(field) || lowerKey.endsWith('_key') || lowerKey.endsWith('_token')
    );
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
    // Usar formatação mais simples para evitar problemas de recursão
    const logPrefix = `[${entry.level}] ${entry.message}`;
    
    try {
      switch (entry.level) {
        case 'ERROR':
          console.error(logPrefix, entry.data || '');
          break;
        case 'WARN':
          console.warn(logPrefix, entry.data || '');
          break;
        case 'INFO':
          console.info(logPrefix, entry.data || '');
          break;
        case 'DEBUG':
          console.debug(logPrefix, entry.data || '');
          break;
        case 'PROD':
          console.log(logPrefix, entry.data || '');
          break;
        case 'SECURITY':
          console.warn(`🔒 [SECURITY] ${entry.message}`, entry.data || '');
          break;
        default:
          console.log(logPrefix, entry.data || '');
      }
    } catch (error) {
      // Fallback caso haja erro no console.log
      console.log(`[LOGGER ERROR] ${entry.message}`);
    }
  }

  error(message: string, data?: any, context?: string): void {
    if (this.shouldLog(1)) {
      try {
        const entry = this.formatMessage('ERROR', message, data, context);
        this.logToConsole(entry);
      } catch {
        // Fallback absoluto
        console.error(`[ERROR] ${message}`);
      }
    }
  }

  warn(message: string, data?: any, context?: string): void {
    if (this.shouldLog(2)) {
      try {
        const entry = this.formatMessage('WARN', message, data, context);
        this.logToConsole(entry);
      } catch {
        // Fallback absoluto
        console.warn(`[WARN] ${message}`);
      }
    }
  }

  info(message: string, data?: any, context?: string): void {
    if (this.shouldLog(3)) {
      try {
        const entry = this.formatMessage('INFO', message, data, context);
        this.logToConsole(entry);
      } catch {
        // Fallback absoluto
        console.info(`[INFO] ${message}`);
      }
    }
  }

  debug(message: string, data?: any, context?: string): void {
    if (this.shouldLog(4)) {
      try {
        const entry = this.formatMessage('DEBUG', message, data, context);
        this.logToConsole(entry);
      } catch {
        // Fallback absoluto
        console.debug(`[DEBUG] ${message}`);
      }
    }
  }

  // Método específico para logs de produção críticos
  production(message: string, data?: any, context?: string): void {
    if (this.environment === 'production') {
      try {
        const entry = this.formatMessage('PROD', message, data, context);
        this.logToConsole(entry);
      } catch {
        // Fallback absoluto
        console.log(`[PROD] ${message}`);
      }
    }
  }

  // Método para auditoria de segurança
  security(message: string, data?: any, context?: string): void {
    try {
      const entry = this.formatMessage('SECURITY', message, data, context);
      this.logToConsole(entry);
    } catch {
      // Fallback absoluto
      console.warn(`🔒 [SECURITY] ${message}`);
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
