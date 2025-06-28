
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const UnauthenticatedView = () => {
  return (
    <div className="p-4 pb-20 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 min-h-screen flex items-center justify-center">
      <Card className="text-center p-8">
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Faça login para convidar amigos</h2>
          <p className="text-gray-600">Você precisa estar logado para acessar o sistema de convites.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnauthenticatedView;
