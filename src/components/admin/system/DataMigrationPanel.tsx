
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, ArrowRight, Play, FileText, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface MigrationScript {
  id: string;
  name: string;
  description: string;
  sql: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  executed_at?: string;
  error_message?: string;
}

export const DataMigrationPanel = () => {
  const [migrations, setMigrations] = useState<MigrationScript[]>([
    {
      id: '001',
      name: 'Adicionar índices de performance',
      description: 'Criar índices para melhorar performance das consultas de ranking',
      sql: `-- Criar índices para otimização de performance
CREATE INDEX IF NOT EXISTS idx_daily_rankings_date_score ON daily_rankings(date, score DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week_score ON weekly_rankings(week_start, score DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_total_score ON profiles(total_score DESC);`,
      status: 'pending'
    },
    {
      id: '002',
      name: 'Limpar dados órfãos',
      description: 'Remover registros sem referência válida',
      sql: `-- Limpar game_sessions sem usuário válido
DELETE FROM game_sessions 
WHERE user_id NOT IN (SELECT id FROM profiles);

-- Limpar rankings sem usuário válido
DELETE FROM daily_rankings 
WHERE user_id NOT IN (SELECT id FROM profiles);`,
      status: 'pending'
    }
  ]);

  const [newMigration, setNewMigration] = useState({
    name: '',
    description: '',
    sql: ''
  });

  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleCreateMigration = () => {
    if (!newMigration.name || !newMigration.sql) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e SQL são obrigatórios",
        variant: "destructive",
      });
      return;
    }

    const migration: MigrationScript = {
      id: Date.now().toString(),
      name: newMigration.name,
      description: newMigration.description,
      sql: newMigration.sql,
      status: 'pending'
    };

    setMigrations(prev => [...prev, migration]);
    setNewMigration({ name: '', description: '', sql: '' });

    toast({
      title: "Migração criada",
      description: "Script de migração adicionado à lista",
    });
  };

  const handleExecuteMigration = async (migrationId: string) => {
    setLoading(true);
    
    setMigrations(prev => 
      prev.map(m => 
        m.id === migrationId 
          ? { ...m, status: 'running' as const }
          : m
      )
    );

    try {
      // Simular execução da migração
      await new Promise(resolve => setTimeout(resolve, 2000));

      setMigrations(prev => 
        prev.map(m => 
          m.id === migrationId 
            ? { 
                ...m, 
                status: 'completed' as const, 
                executed_at: new Date().toISOString() 
              }
            : m
        )
      );

      toast({
        title: "Migração executada",
        description: "Script executado com sucesso",
      });
    } catch (error) {
      setMigrations(prev => 
        prev.map(m => 
          m.id === migrationId 
            ? { 
                ...m, 
                status: 'failed' as const,
                error_message: error instanceof Error ? error.message : 'Erro desconhecido'
              }
            : m
        )
      );

      toast({
        title: "Erro na migração",
        description: "Falha ao executar o script",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: MigrationScript['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-700';
      case 'running':
        return 'bg-blue-100 text-blue-700';
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
    }
  };

  const getStatusIcon = (status: MigrationScript['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4" />;
      case 'running':
        return <Play className="h-4 w-4" />;
      case 'completed':
        return <ArrowRight className="h-4 w-4" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Criar Nova Migração */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Criar Script de Migração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="migration-name">Nome da Migração</Label>
              <Input
                id="migration-name"
                value={newMigration.name}
                onChange={(e) => setNewMigration(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Adicionar nova coluna"
              />
            </div>
            <div>
              <Label htmlFor="migration-description">Descrição</Label>
              <Input
                id="migration-description"
                value={newMigration.description}
                onChange={(e) => setNewMigration(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Breve descrição do que faz"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="migration-sql">Script SQL</Label>
            <Textarea
              id="migration-sql"
              value={newMigration.sql}
              onChange={(e) => setNewMigration(prev => ({ ...prev, sql: e.target.value }))}
              placeholder="-- Seu script SQL aqui
ALTER TABLE example ADD COLUMN new_field TEXT;"
              rows={6}
              className="font-mono text-sm"
            />
          </div>
          <Button onClick={handleCreateMigration} className="w-full">
            Adicionar Migração
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Migrações */}
      <Card>
        <CardHeader>
          <CardTitle>Scripts de Migração</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {migrations.map((migration) => (
              <div key={migration.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusIcon(migration.status)}
                      <h3 className="font-semibold">{migration.name}</h3>
                      <Badge className={getStatusColor(migration.status)}>
                        {migration.status === 'pending' && 'Pendente'}
                        {migration.status === 'running' && 'Executando'}
                        {migration.status === 'completed' && 'Concluído'}
                        {migration.status === 'failed' && 'Falhou'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{migration.description}</p>
                    {migration.executed_at && (
                      <p className="text-xs text-gray-500">
                        Executado em: {new Date(migration.executed_at).toLocaleString('pt-BR')}
                      </p>
                    )}
                    {migration.error_message && (
                      <p className="text-xs text-red-600 mt-1">
                        Erro: {migration.error_message}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {migration.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => handleExecuteMigration(migration.id)}
                        disabled={loading}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Executar
                      </Button>
                    )}
                  </div>
                </div>
                <details className="text-sm">
                  <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                    Ver SQL
                  </summary>
                  <pre className="mt-2 p-3 bg-gray-50 rounded border overflow-x-auto">
                    <code>{migration.sql}</code>
                  </pre>
                </details>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
