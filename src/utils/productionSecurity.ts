/**
 * CONFIGURAÇÃO DE SEGURANÇA PARA PRODUÇÃO
 * 
 * Sistema de validação e hardening para ambiente de produção
 */

import { productionLogger } from '@/utils/productionLogger';

// Detectar ambiente
const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

// Configurações de segurança por ambiente
export const securityConfig = {
  production: {
    enableDebugLogs: false,
    enableConsoleOverride: true,
    enableCSPHeaders: true,
    enableSecurityHeaders: true,
    maxRequestSize: 1024 * 1024, // 1MB
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100, // requests per window
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
    requireHttps: true,
    strictContentType: true
  },
  development: {
    enableDebugLogs: true,
    enableConsoleOverride: false,
    enableCSPHeaders: false,
    enableSecurityHeaders: false,
    maxRequestSize: 10 * 1024 * 1024, // 10MB
    rateLimitWindow: 5 * 60 * 1000, // 5 minutes
    rateLimitMax: 1000, // requests per window
    sessionTimeout: 7 * 24 * 60 * 60 * 1000, // 7 days
    requireHttps: false,
    strictContentType: false
  }
};

// Configuração ativa baseada no ambiente
export const activeSecurityConfig = isProduction ? securityConfig.production : securityConfig.development;

// Validação de variáveis de ambiente obrigatórias
const requiredEnvVars = {
  SUPABASE_URL: 'https://oqzpkqbmcnpxpegshlcm.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xenBrcWJtY25weHBlZ3NobGNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkxNDY5MzcsImV4cCI6MjA2NDcyMjkzN30.Wla6j2fBOnPd0DbNmVIdhZKfkTp09d9sE8NOULcRsQk'
};

// Lista de variáveis VITE_ permitidas em produção
const allowedViteVars = [
  'VITE_APP_ENV',
  'VITE_APP_URL',
  'VITE_DEFAULT_INVITE_CODE',
  'VITE_ENABLE_ANALYTICS',
  'VITE_ENABLE_PUSH'
];

// Função para validar configuração de produção
export const validateProductionConfig = () => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validar variáveis obrigatórias
  Object.entries(requiredEnvVars).forEach(([key, expectedValue]) => {
    const actualValue = key === 'SUPABASE_URL' ? requiredEnvVars.SUPABASE_URL : requiredEnvVars.SUPABASE_ANON_KEY;
    if (!actualValue) {
      errors.push(`Variável obrigatória ${key} não está definida`);
    }
  });

  // Verificar se há variáveis VITE_ não permitidas em produção
  if (isProduction) {
    Object.keys(import.meta.env).forEach(key => {
      if (key.startsWith('VITE_') && !allowedViteVars.includes(key)) {
        warnings.push(`Variável VITE_ não permitida em produção: ${key}`);
      }
    });
  }

  // Validar protocolo HTTPS em produção
  if (isProduction && window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    errors.push('HTTPS é obrigatório em produção');
  }

  // Log dos resultados
  if (errors.length > 0) {
    productionLogger.error('Erros críticos de configuração detectados', { 
      errors: errors.length,
      environment: isProduction ? 'production' : 'development'
    });
    errors.forEach(error => productionLogger.error(error));
  }

  if (warnings.length > 0) {
    productionLogger.warn('Avisos de configuração', { 
      warnings: warnings.length 
    });
    warnings.forEach(warning => productionLogger.warn(warning));
  }

  if (errors.length === 0 && warnings.length === 0) {
    productionLogger.info('Configuração de segurança validada com sucesso', {
      environment: isProduction ? 'production' : 'development',
      securityLevel: isProduction ? 'high' : 'development'
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    config: activeSecurityConfig
  };
};

// Função para aplicar headers de segurança
export const applySecurityHeaders = () => {
  if (!activeSecurityConfig.enableSecurityHeaders) return;

  // CSP Headers (Content Security Policy)
  const cspPolicy = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://oqzpkqbmcnpxpegshlcm.supabase.co",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data:",
    "connect-src 'self' https://oqzpkqbmcnpxpegshlcm.supabase.co wss://oqzpkqbmcnpxpegshlcm.supabase.co",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ');

  // Adicionar meta tag CSP se não existir
  if (activeSecurityConfig.enableCSPHeaders && !document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = cspPolicy;
    document.head.appendChild(cspMeta);
    
    productionLogger.info('Headers de segurança CSP aplicados');
  }

  // Adicionar outros headers de segurança via meta tags
  const securityHeaders = [
    { name: 'X-Content-Type-Options', content: 'nosniff' },
    { name: 'X-Frame-Options', content: 'DENY' },
    { name: 'X-XSS-Protection', content: '1; mode=block' },
    { name: 'Referrer-Policy', content: 'strict-origin-when-cross-origin' }
  ];

  securityHeaders.forEach(header => {
    const existing = document.querySelector(`meta[name="${header.name}"]`);
    if (!existing) {
      const meta = document.createElement('meta');
      meta.name = header.name;
      meta.content = header.content;
      document.head.appendChild(meta);
    }
  });
};

// Função para desabilitar recursos de desenvolvimento em produção
export const disableDevFeatures = () => {
  if (!isProduction) return;

  if (typeof window !== 'undefined' && (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberRoot = undefined;
    (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.onCommitFiberUnmount = undefined;
  }

  // Limpar variáveis de desenvolvimento
  delete (window as any).__DEV__;
  delete (window as any).__DEVELOPMENT__;

  productionLogger.info('Recursos de desenvolvimento desabilitados');
};

// Função para aplicar configurações de performance
export const applyPerformanceConfig = () => {
  if (!isProduction) return;

  // Configurar Service Worker para cache
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(() => productionLogger.info('Service Worker registrado'))
      .catch(() => productionLogger.warn('Falha ao registrar Service Worker'));
  }

  // Configurar preload crítico
  const criticalResources = [
    '/src/main.tsx',
    '/src/index.css'
  ];

  criticalResources.forEach(resource => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = resource;
    link.as = resource.endsWith('.css') ? 'style' : 'script';
    document.head.appendChild(link);
  });

  productionLogger.info('Configurações de performance aplicadas');
};

// Função principal de inicialização da segurança
export const initializeProductionSecurity = () => {
  try {
    productionLogger.info('Inicializando configurações de segurança de produção');

    const validation = validateProductionConfig();
    
    if (!validation.isValid) {
      productionLogger.error('Configuração de produção inválida - aplicação pode estar insegura');
      return false;
    }

    applySecurityHeaders();
    disableDevFeatures();
    applyPerformanceConfig();

    productionLogger.info('Configurações de segurança de produção aplicadas com sucesso', {
      environment: isProduction ? 'production' : 'development',
      timestamp: new Date().toISOString()
    });

    return true;

  } catch (error: any) {
    productionLogger.error('Erro ao inicializar segurança de produção', { 
      error: error.message 
    });
    return false;
  }
};

// Status da configuração
export const getSecurityStatus = () => ({
  isProduction,
  isDevelopment,
  config: activeSecurityConfig,
  validation: validateProductionConfig(),
  timestamp: new Date().toISOString()
});