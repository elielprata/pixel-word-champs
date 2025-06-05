
export interface AppConfig {
  app: {
    name: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
  };
  api: {
    baseUrl: string;
    timeout: number;
  };
  game: {
    defaultTimeLimit: number;
    minWordLength: number;
    pointsPerLength: Record<number, number>;
    maxHintsPerGame: number;
  };
  invite: {
    defaultCode: string;
    baseUrl: string;
  };
  features: {
    enableAnalytics: boolean;
    enablePushNotifications: boolean;
    enableSocialSharing: boolean;
  };
}

const config: AppConfig = {
  app: {
    name: 'Letra Arena',
    version: '1.0.0',
    environment: (import.meta.env.VITE_APP_ENV as 'development' | 'staging' | 'production') || 'development',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
  },
  game: {
    defaultTimeLimit: 180, // 3 minutos
    minWordLength: 3,
    pointsPerLength: {
      3: 1,
      4: 2,
      5: 3,
      6: 5,
      7: 8,
      8: 13,
      9: 21,
      10: 34,
    },
    maxHintsPerGame: 3,
  },
  invite: {
    defaultCode: import.meta.env.VITE_DEFAULT_INVITE_CODE || 'ARENA2024',
    baseUrl: import.meta.env.VITE_APP_URL || 'https://letraarena.com',
  },
  features: {
    enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    enablePushNotifications: import.meta.env.VITE_ENABLE_PUSH === 'true',
    enableSocialSharing: true,
  },
};

export default config;

// Utilitário para verificar ambiente
export const isDevelopment = () => config.app.environment === 'development';
export const isProduction = () => config.app.environment === 'production';
export const isStaging = () => config.app.environment === 'staging';
