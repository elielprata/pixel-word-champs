
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle } from 'lucide-react';

export const UserSystemStatus = () => {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-gray-50 border-b border-slate-200">
        <CardTitle className="flex items-center gap-2 text-slate-800">
          <div className="bg-slate-100 p-2 rounded-lg">
            <AlertCircle className="h-4 w-4 text-slate-600" />
          </div>
          <span className="text-lg">Status do Sistema</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Sistema de Auth</span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Online
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">Database</span>
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Estável
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-600">API Response</span>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              120ms
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
