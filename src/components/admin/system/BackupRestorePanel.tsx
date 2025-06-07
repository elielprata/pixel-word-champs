
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Download, Upload, Database, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";

interface BackupInfo {
  id: string;
  name: string;
  size: string;
  created_at: string;
  tables_count: number;
  status: 'completed' | 'in_progress' | 'failed';
}

export const BackupRestorePanel = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      // Simular criação de backup - em produção seria uma edge function
      const timestamp = new Date().toISOString();
      const backupName = `backup_${timestamp.split('T')[0]}_${Date.now()}`;
      
      // Buscar dados das principais tabelas
      const tables = ['profiles', 'game_sessions', 'competitions', 'daily_rankings', 'weekly_rankings'];
      const backupData: any = {};
      
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*');
        if (error) throw error;
        backupData[table] = data;
      }

      // Simular salvamento do backup
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${backupName}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Adicionar à lista de backups
      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        name: backupName,
        size: `${(blob.size / 1024 / 1024).toFixed(2)} MB`,
        created_at: timestamp,
        tables_count: tables.length,
        status: 'completed'
      };

      setBackups(prev => [newBackup, ...prev]);

      toast({
        title: "Backup criado",
        description: "Backup baixado com sucesso",
      });
    } catch (error) {
      toast({
        title: "Erro no backup",
        description: "Não foi possível criar o backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'application/json') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Arquivo inválido",
        description: "Selecione um arquivo JSON válido",
        variant: "destructive",
      });
    }
  };

  const handleRestore = async () => {
    if (!selectedFile) return;

    setLoading(true);
    try {
      const fileContent = await selectedFile.text();
      const backupData = JSON.parse(fileContent);

      // Validar estrutura do backup
      const expectedTables = ['profiles', 'game_sessions', 'competitions'];
      const hasValidStructure = expectedTables.some(table => backupData[table]);

      if (!hasValidStructure) {
        throw new Error('Estrutura de backup inválida');
      }

      toast({
        title: "Restauração simulada",
        description: "Em produção, isso restauraria os dados do backup selecionado",
      });

      setSelectedFile(null);
    } catch (error) {
      toast({
        title: "Erro na restauração",
        description: "Não foi possível restaurar o backup",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-700';
      case 'in_progress':
        return 'bg-blue-100 text-blue-700';
      case 'failed':
        return 'bg-red-100 text-red-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Criar Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Criar Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Crie um backup completo de todos os dados do sistema
            </p>
            <Button 
              onClick={handleCreateBackup}
              disabled={loading}
              className="w-full flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {loading ? 'Criando Backup...' : 'Criar Backup'}
            </Button>
          </CardContent>
        </Card>

        {/* Restaurar Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restaurar Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="backup-file">Selecionar arquivo de backup</Label>
              <Input
                id="backup-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="mt-1"
              />
            </div>
            {selectedFile && (
              <p className="text-sm text-green-600">
                Arquivo selecionado: {selectedFile.name}
              </p>
            )}
            <Button 
              onClick={handleRestore}
              disabled={loading || !selectedFile}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {loading ? 'Restaurando...' : 'Restaurar Backup'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Backups</CardTitle>
        </CardHeader>
        <CardContent>
          {backups.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              Nenhum backup encontrado. Crie seu primeiro backup acima.
            </p>
          ) : (
            <div className="space-y-3">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <p className="font-medium">{backup.name}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(backup.created_at).toLocaleString('pt-BR')} • {backup.size} • {backup.tables_count} tabelas
                      </p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(backup.status)}>
                    {backup.status === 'completed' && 'Concluído'}
                    {backup.status === 'in_progress' && 'Em Progresso'}
                    {backup.status === 'failed' && 'Falhou'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
