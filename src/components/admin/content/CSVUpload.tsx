
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useWordCategories } from '@/hooks/content/useWordCategories';
import { logger } from '@/utils/logger';

export const CSVUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { categories } = useWordCategories();

  const downloadTemplate = () => {
    const csvContent = "word,category,difficulty\nexemplo,geral,easy\npalavra,esportes,medium\nteste,animais,hard";
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = 'template_palavras.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    
    logger.info('Template CSV baixado', undefined, 'CSV_UPLOAD');
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast({
        title: "Erro no arquivo",
        description: "Por favor, selecione um arquivo CSV.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      logger.info('Iniciando upload de CSV', { fileName: file.name }, 'CSV_UPLOAD');
      
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        throw new Error('Arquivo CSV vazio');
      }

      // Verificar header
      const header = lines[0].toLowerCase();
      if (!header.includes('word') || !header.includes('category')) {
        throw new Error('CSV deve conter colunas "word" e "category"');
      }

      const data = [];
      const headerParts = lines[0].split(',');
      const wordIndex = headerParts.findIndex(h => h.toLowerCase().includes('word'));
      const categoryIndex = headerParts.findIndex(h => h.toLowerCase().includes('category'));
      const difficultyIndex = headerParts.findIndex(h => h.toLowerCase().includes('difficulty'));

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',');
        if (parts.length >= 2) {
          const word = parts[wordIndex]?.trim();
          const category = parts[categoryIndex]?.trim();
          const difficulty = parts[difficultyIndex]?.trim() || 'medium';
          
          if (word && category) {
            data.push({ word, category, difficulty });
          }
        }
        setUploadProgress((i / lines.length) * 50);
      }

      logger.info('Dados processados do CSV', { 
        totalLines: lines.length - 1,
        validWords: data.length 
      }, 'CSV_UPLOAD');

      // Inserir dados no banco
      let successCount = 0;
      for (let i = 0; i < data.length; i++) {
        try {
          const { error } = await supabase
            .from('level_words')
            .insert({
              word: data[i].word,
              category: data[i].category,
              difficulty: data[i].difficulty,
              level: 1,
              is_active: true
            });

          if (!error) {
            successCount++;
          } else {
            logger.warn('Erro ao inserir palavra', { 
              word: data[i].word, 
              error: error.message 
            }, 'CSV_UPLOAD');
          }
        } catch (insertError) {
          logger.error('Erro ao inserir palavra', { 
            word: data[i].word, 
            error: insertError 
          }, 'CSV_UPLOAD');
        }
        
        setUploadProgress(50 + (i / data.length) * 50);
      }

      logger.info('Upload CSV concluído', { 
        totalProcessed: data.length,
        successCount 
      }, 'CSV_UPLOAD');

      toast({
        title: "Upload concluído!",
        description: `${successCount} palavras foram adicionadas com sucesso.`,
      });

    } catch (error: any) {
      logger.error('Erro no upload CSV', { error: error.message }, 'CSV_UPLOAD');
      toast({
        title: "Erro no upload",
        description: error.message || "Erro ao processar arquivo CSV.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Upload de Palavras via CSV
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Importe palavras em lote usando um arquivo CSV
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={downloadTemplate}
          >
            <Download className="h-4 w-4 mr-2" />
            Baixar Template
          </Button>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            id="csv-upload"
          />
          <label
            htmlFor="csv-upload"
            className={`cursor-pointer flex flex-col items-center ${
              isUploading ? 'pointer-events-none opacity-50' : ''
            }`}
          >
            {isUploading ? (
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mb-2" />
            ) : (
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
            )}
            <span className="text-sm font-medium">
              {isUploading ? 'Enviando...' : 'Clique para selecionar arquivo CSV'}
            </span>
            <span className="text-xs text-gray-500 mt-1">
              Formato: word,category,difficulty
            </span>
          </label>
        </div>

        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>• O arquivo deve conter as colunas: word, category, difficulty</p>
          <p>• Categorias disponíveis: {categories.map(c => c.name).join(', ')}</p>
          <p>• Dificuldades: easy, medium, hard</p>
        </div>
      </CardContent>
    </Card>
  );
};
