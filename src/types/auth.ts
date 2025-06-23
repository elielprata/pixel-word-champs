
import { User, AuthResponse } from '@/types';

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (userData: { email: string; password: string; username: string }) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  error: string | undefined;
}
