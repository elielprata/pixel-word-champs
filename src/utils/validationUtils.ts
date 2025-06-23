
import { logger } from '@/utils/logger';

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isValid = emailRegex.test(email);
  
  if (!isValid) {
    logger.debug('Validação de email falhou', { email: email.substring(0, 3) + '***' }, 'VALIDATION_UTILS');
  }
  
  return isValid;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Senha deve ter pelo menos 8 caracteres');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve ter pelo menos uma letra maiúscula');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve ter pelo menos uma letra minúscula');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Senha deve ter pelo menos um número');
  }

  const isValid = errors.length === 0;
  
  logger.debug('Validação de senha', { 
    isValid, 
    errorCount: errors.length,
    passwordLength: password.length 
  }, 'VALIDATION_UTILS');
  
  return { isValid, errors };
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (username.length < 3) {
    logger.debug('Username muito curto', { length: username.length }, 'VALIDATION_UTILS');
    return { isValid: false, error: 'Nome de usuário deve ter pelo menos 3 caracteres' };
  }
  
  if (username.length > 20) {
    logger.debug('Username muito longo', { length: username.length }, 'VALIDATION_UTILS');
    return { isValid: false, error: 'Nome de usuário deve ter no máximo 20 caracteres' };
  }
  
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    logger.debug('Username com caracteres inválidos', undefined, 'VALIDATION_UTILS');
    return { isValid: false, error: 'Nome de usuário deve conter apenas letras, números e underscore' };
  }
  
  logger.debug('Username válido', { username: username.substring(0, 3) + '***' }, 'VALIDATION_UTILS');
  return { isValid: true };
};

export const validatePhoneNumber = (phone: string): boolean => {
  // Remove todos os caracteres não numéricos
  const numbersOnly = phone.replace(/\D/g, '');
  
  // Valida se tem 10 ou 11 dígitos (formato brasileiro)
  const isValid = numbersOnly.length === 10 || numbersOnly.length === 11;
  
  logger.debug('Validação de telefone', { 
    isValid, 
    length: numbersOnly.length 
  }, 'VALIDATION_UTILS');
  
  return isValid;
};

export const validatePixKey = (pixKey: string): { isValid: boolean; type?: string; error?: string } => {
  if (!pixKey || pixKey.trim().length === 0) {
    return { isValid: false, error: 'Chave PIX não pode estar vazia' };
  }

  const cleanKey = pixKey.trim();
  
  // CPF (11 dígitos)
  if (/^\d{11}$/.test(cleanKey)) {
    logger.debug('Chave PIX identificada como CPF', undefined, 'VALIDATION_UTILS');
    return { isValid: true, type: 'CPF' };
  }
  
  // CNPJ (14 dígitos)
  if (/^\d{14}$/.test(cleanKey)) {
    logger.debug('Chave PIX identificada como CNPJ', undefined, 'VALIDATION_UTILS');
    return { isValid: true, type: 'CNPJ' };
  }
  
  // Email
  if (validateEmail(cleanKey)) {
    logger.debug('Chave PIX identificada como email', undefined, 'VALIDATION_UTILS');
    return { isValid: true, type: 'Email' };
  }
  
  // Telefone
  if (validatePhoneNumber(cleanKey)) {
    logger.debug('Chave PIX identificada como telefone', undefined, 'VALIDATION_UTILS');
    return { isValid: true, type: 'Telefone' };
  }
  
  // Chave aleatória (UUID)
  if (/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(cleanKey)) {
    logger.debug('Chave PIX identificada como UUID', undefined, 'VALIDATION_UTILS');
    return { isValid: true, type: 'Chave Aleatória' };
  }
  
  logger.debug('Chave PIX inválida', undefined, 'VALIDATION_UTILS');
  return { isValid: false, error: 'Formato de chave PIX inválido' };
};

export const sanitizeInput = (input: string): string => {
  // Remove caracteres potencialmente perigosos
  const sanitized = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<[^>]*>/g, '')
    .trim();
    
  if (sanitized !== input) {
    logger.warn('Input sanitizado', { 
      originalLength: input.length, 
      sanitizedLength: sanitized.length 
    }, 'VALIDATION_UTILS');
  }
  
  return sanitized;
};

export const validateGameScore = (score: number): boolean => {
  const isValid = Number.isInteger(score) && score >= 0 && score <= 10000;
  
  if (!isValid) {
    logger.warn('Score de jogo inválido', { score }, 'VALIDATION_UTILS');
  }
  
  return isValid;
};

export const validateWordLength = (word: string): boolean => {
  const isValid = word.length >= 3 && word.length <= 15;
  
  if (!isValid) {
    logger.debug('Palavra com tamanho inválido', { 
      word: word.substring(0, 3) + '***',
      length: word.length 
    }, 'VALIDATION_UTILS');
  }
  
  return isValid;
};
