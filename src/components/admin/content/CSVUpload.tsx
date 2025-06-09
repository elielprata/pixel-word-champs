
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useWordCategories } from '@/hooks/useWordCategories';
import { saveWordsToDatabase } from '@/services/wordStorageService';

export const CSVUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { categories } = useWordCategories();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      setSelectedFile(file);
    } else {
      toast({
        title: "Erro",
        description: "Por favor, selecione um arquivo CSV válido",
        variant: "destructive",
      });
    }
  };

  const parseCSV = (text: string): string[] => {
    const lines = text.split('\n');
    const words: string[] = [];
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        // Se a linha contém vírgulas, pega o primeiro valor
        const word = trimmedLine.split(',')[0].trim();
        if (word && word.length >= 3) {
          words.push(word);
        }
      }
    }
    
    return words;
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedCategory) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo CSV e uma categoria",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const text = await selectedFile.text();
      const words = parseCSV(text);

      if (words.length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma palavra válida encontrada no arquivo",
          variant: "destructive",
        });
        return;
      }

      // Encontrar a categoria selecionada
      const category = categories.find(cat => cat.name === selectedCategory);
      const categoryId = category?.id || '';

      const result = await saveWordsToDatabase(words, categoryId, selectedCategory);

      toast({
        title: "Sucesso!",
        description: `${result.count} palavras foram importadas com sucesso`,
      });

      // Limpar formulário
      setSelectedFile(null);
      setSelectedCategory('');
      const fileInput = document.getElementById('csv-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

    } catch (error) {
      console.error('Erro no upload:', error);
      toast({
        title: "Erro",
        description: "Erro ao processar o arquivo CSV",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Upload de Palavras via CSV
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Formulário à esquerda */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Arquivo CSV</Label>
              <Input
                id="csv-file"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                disabled={isUploading}
              />
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  {selectedFile.name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria de Destino</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory} disabled={isUploading}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="geral">Geral</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || !selectedCategory || isUploading}
              className="w-full"
            >
              <FileText className="h-4 w-4 mr-2" />
              {isUploading ? 'Processando...' : 'Fazer Upload'}
            </Button>
          </div>

          {/* Instruções à direita */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-blue-800 mb-2">Formato do Arquivo CSV</h4>
                <div className="text-sm text-blue-700 space-y-2">
                  <p>• Uma palavra por linha</p>
                  <p>• Palavras com pelo menos 3 letras</p>
                  <p>• Apenas letras (sem números ou símbolos)</p>
                  <p>• Se houver vírgulas, apenas a primeira coluna será usada</p>
                </div>
                
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Exemplo:</h5>
                  <div className="bg-white border border-blue-200 rounded p-2 text-xs font-mono">
                    CASA<br/>
                    CARRO<br/>
                    COMPUTADOR<br/>
                    TELEFONE
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Palavras duplicadas na categoria serão ignoradas automaticamente
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
