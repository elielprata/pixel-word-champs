
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search } from 'lucide-react';

interface CompetitionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  typeFilter: string;
  setTypeFilter: (value: string) => void;
}

export const CompetitionFilters: React.FC<CompetitionFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  typeFilter,
  setTypeFilter
}) => {
  return (
    <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-orange-800 flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtros de Pesquisa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-orange-700">Buscar por título</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-orange-400" />
              <Input
                placeholder="Digite o nome da competição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-orange-200 focus:border-orange-400"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-orange-700">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os status</SelectItem>
                <SelectItem value="completed">Finalizada</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-orange-700">Tipo</label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="border-orange-200 focus:border-orange-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="challenge">Desafio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
