import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, AlertCircle, Download } from 'lucide-react';
import { useWordCategories } from '@/hooks/game/useWordCategories';
import { useToast } from "@/hooks/use-toast";
import { logger } from '@/utils/logger';

export const CSVUpload = () => {
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState<boolean | null>(null);
  const { createCategory, createWord, categories } = useWordCategories();
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setCsvFile(file);
  };

  const handleUpload = async () => {
    if (!csvFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo CSV para fazer upload.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    setUploadSuccess(null);

    try {
      const text = await csvFile.text();
      const lines = text.split('\n').map(line => line.trim());
      const headers = lines[0].split(',').map(header => header.trim());
      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(value => value.trim());
        return headers.reduce((obj: any, header, index) => {
          obj[header] = values[index];
          return obj;
        }, {});
      });

      logger.info('Iniciando upload de CSV', { 
        fileName: csvFile.name,
        fileSize: csvFile.size,
        rowCount: data.length
      }, 'CSV_UPLOAD');

      // Validar headers
      const expectedHeaders = ['word', 'category', 'level', 'isActive'];
      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        throw new Error(`Faltando colunas obrigatórias: ${missingHeaders.join(', ')}`);
      }

      // Processar cada linha
      for (const row of data) {
        const { word, category: categoryName, level, isActive } = row;

        // Validar dados
        if (!word || !categoryName || !level || !['true', 'false'].includes(String(isActive).toLowerCase())) {
          logger.warn('Linha inválida detectada', { row }, 'CSV_UPLOAD');
          continue; // Ignorar linha inválida
        }

        // Verificar se a categoria existe
        let category = categories?.find(cat => cat.name === categoryName);
        if (!category) {
          logger.debug('Categoria não encontrada, criando nova', { categoryName }, 'CSV_UPLOAD');
          category = await createCategory(categoryName);
          if (!category) {
            logger.error('Erro ao criar categoria', { categoryName }, 'CSV_UPLOAD');
            continue; // Ignorar se falhar na criação da categoria
          }
        }

        // Criar palavra
        const newWord = {
          word,
          category: category.id,
          level: parseInt(level, 10),
          isActive: String(isActive).toLowerCase() === 'true'
        };

        logger.debug('Criando palavra', { newWord }, 'CSV_UPLOAD');
        await createWord(newWord);
      }

      logger.info('Upload de CSV concluído com sucesso', { rowCount: data.length }, 'CSV_UPLOAD');
      setUploadSuccess(true);
      toast({
        title: "Sucesso",
        description: "Upload do arquivo CSV concluído com sucesso.",
      });

    } catch (error: any) {
      logger.error('Erro no upload de CSV', { error: error.message }, 'CSV_UPLOAD');
      setUploadSuccess(false);
      toast({
        title: "Erro no upload",
        description: error.message || "Ocorreu um erro ao processar o arquivo CSV.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Limpar o campo de arquivo
      setCsvFile(null);
      const input = document.getElementById('csv-file-upload') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8," +
      "word,category,level,isActive\n" +
      "exemplo,nome_da_categoria,1,true\n" +
      "segundo,outra_categoria,2,false";

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "template_palavras.csv");
    document.body.appendChild(link); // Required for FF

    link.click();
    document.body.removeChild(link);
  };

  return (
    <Card className="border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600" />
          Importar Palavras via CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            O arquivo CSV deve conter as colunas: <strong>word, category, level, isActive</strong>.
          </AlertDescription>
        </Alert>

        <div className="grid gap-2">
          <Label htmlFor="csv-file-upload">
            Arquivo CSV
          </Label>
          <Input
            id="csv-file-upload"
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            disabled={uploading}
          />
        </div>

        <div className="flex justify-between items-center">
          <Button
            onClick={handleUpload}
            disabled={uploading || !csvFile}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4 animate-spin" />
                Enviando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Enviar CSV
              </div>
            )}
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={handleDownloadTemplate}
            disabled={uploading}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        {uploadSuccess === true && (
          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            Upload realizado com sucesso!
          </Alert>
        )}

        {uploadSuccess === false && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            Erro ao realizar upload. Verifique o arquivo e tente novamente.
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};
