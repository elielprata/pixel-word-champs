
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.tsx";
import "./index.css";
import ErrorBoundary from "./components/ErrorBoundary";
import { initializeProductionSecurity } from '@/utils/productionSecurity';
import { productionLogger } from '@/utils/productionLogger';
import { initializePerformanceMonitoring } from '@/utils/performanceOptimization';

// Inicializar configurações de segurança de produção
const securityInitialized = initializeProductionSecurity();

if (!securityInitialized) {
  productionLogger.error('Falha na inicialização de segurança - aplicação pode estar vulnerável');
}

// Configuração otimizada do QueryClient para Fase 4
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos (novo nome para cacheTime)
      refetchOnReconnect: true,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Inicializar monitoramento de performance
initializePerformanceMonitoring();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </React.StrictMode>,
);
