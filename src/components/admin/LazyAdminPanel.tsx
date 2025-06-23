
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

const AdminPanel = React.lazy(() => import('@/pages/AdminPanel'));

const AdminLoadingFallback = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-slate-600">Carregando painel administrativo...</p>
      </div>
    </div>
  );
};

export const LazyAdminPanel = () => {
  return (
    <Suspense fallback={<AdminLoadingFallback />}>
      <AdminPanel />
    </Suspense>
  );
};

export default LazyAdminPanel;
