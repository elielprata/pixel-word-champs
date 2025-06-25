
import React from 'react';
import { useAppNavigation } from '@/hooks/useAppNavigation';

const Index = () => {
  const { currentScreen, navigateToScreen } = useAppNavigation();

  // This Index.tsx seems to be unused since App.tsx handles all the routing
  // Redirecting to the main app flow
  React.useEffect(() => {
    if (currentScreen !== 'home') {
      navigateToScreen('home');
    }
  }, [currentScreen, navigateToScreen]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Letra Arena</h1>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
