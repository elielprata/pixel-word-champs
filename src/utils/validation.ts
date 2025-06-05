
import { z } from 'zod';

// Esquemas de validação
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(20, 'Nome de usuário deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário pode conter apenas letras, números e underscore'),
  email: z.string().email('Email inválido'),
  password: z.string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'),
  confirmPassword: z.string(),
  inviteCode: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Senhas não coincidem',
  path: ['confirmPassword'],
});

export const updateProfileSchema = z.object({
  username: z.string()
    .min(3, 'Nome de usuário deve ter pelo menos 3 caracteres')
    .max(20, 'Nome de usuário deve ter no máximo 20 caracteres')
    .regex(/^[a-zA-Z0-9_]+$/, 'Nome de usuário pode conter apenas letras, números e underscore')
    .optional(),
});

export const wordValidationSchema = z.object({
  word: z.string().min(3, 'Palavra deve ter pelo menos 3 caracteres'),
  positions: z.array(z.object({
    row: z.number().min(0),
    col: z.number().min(0),
  })).min(3, 'Palavra deve ter pelo menos 3 posições'),
});

// Funções de validação
export const validateEmail = (email: string): boolean => {
  return z.string().email().safeParse(email).success;
};

export const validateUsername = (username: string): boolean => {
  return z.string()
    .min(3)
    .max(20)
    .regex(/^[a-zA-Z0-9_]+$/)
    .safeParse(username).success;
};

export const validatePassword = (password: string): boolean => {
  return z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .safeParse(password).success;
};

export const validateWord = (word: string): boolean => {
  return /^[A-Za-z]+$/.test(word) && word.length >= 3;
};

export const validateBoardPosition = (row: number, col: number, boardSize: number): boolean => {
  return row >= 0 && row < boardSize && col >= 0 && col < boardSize;
};

// Sanitização de dados
export const sanitizeUsername = (username: string): string => {
  return username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
};

export const sanitizeWord = (word: string): string => {
  return word.trim().toUpperCase().replace(/[^A-Z]/g, '');
};

// Validação de tipos TypeScript
export type ValidationResult<T> = {
  success: boolean;
  data?: T;
  errors?: string[];
};

export const validateWithSchema = <T>(
  schema: z.ZodSchema<T>, 
  data: unknown
): ValidationResult<T> => {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  return {
    success: false,
    errors: result.error.errors.map(err => err.message),
  };
};
