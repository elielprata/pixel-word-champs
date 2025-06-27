
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface UserStatsCardsProps {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
}

export const UserStatsCards = ({ totalUsers, activeUsers, bannedUsers }: UserStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total de Usuários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Usuários Ativos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{activeUsers}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Usuários Banidos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{bannedUsers}</div>
        </CardContent>
      </Card>
    </div>
  );
};
