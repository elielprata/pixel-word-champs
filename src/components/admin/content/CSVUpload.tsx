
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, AlertCircle, CheckCircle, Info, Layers } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useWordCategories } from '@/hooks/useWordCategories';
import { saveWordsToDatabase } from '@/services/wordStorageService';

export const CSVUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [uploadMode, setUploadMode] = useState<'single' | 'multiple'>('single');
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();
  const { categories, createCategory } = useWordCategories();

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

  const parseCSVSingleCategory = (text: string): string[] => {
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

  const parseCSVMultipleCategories = (text: string): { [category: string]: string[] } => {
    const lines = text.split('\n');
    const categorizedWords: { [category: string]: string[] } = {};
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const parts = trimmedLine.split(',');
        if (parts.length >= 2) {
          const word = parts[0].trim();
          const category = parts[1].trim().toLowerCase();
          
          if (word && word.length >= 3 && category) {
            if (!categorizedWords[category]) {
              categorizedWords[category] = [];
            }
            categorizedWords[category].push(word);
          }
        }
      }
    }
    
    return categorizedWords;
  };

  const ensureCategoryExists = async (categoryName: string) => {
    const existingCategory = categories.find(cat => cat.name === categoryName);
    if (!existingCategory) {
      console.log(`Criando nova categoria: ${categoryName}`);
      await new Promise<void>((resolve, reject) => {
        createCategory(
          { name: categoryName, description: `Categoria criada automaticamente via upload` },
          {
            onSuccess: () => resolve(),
            onError: (error) => reject(error)
          }
        );
      });
    }
  };

  const handleUploadSingle = async () => {
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
      const words = parseCSVSingleCategory(text);

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
        description: `${result.count} palavras foram importadas para a categoria "${selectedCategory}"`,
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

  const handleUploadMultiple = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo CSV",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const text = await selectedFile.text();
      const categorizedWords = parseCSVMultipleCategories(text);

      if (Object.keys(categorizedWords).length === 0) {
        toast({
          title: "Erro",
          description: "Nenhuma palavra válida encontrada no arquivo. Verifique o formato.",
          variant: "destructive",
        });
        return;
      }

      let totalImported = 0;
      let categoriesProcessed = 0;

      // Processar cada categoria
      for (const [categoryName, words] of Object.entries(categorizedWords)) {
        try {
          // Garantir que a categoria existe
          await ensureCategoryExists(categoryName);
          
          // Encontrar o ID da categoria (pode ter sido criada agora)
          const categoryInDb = categories.find(cat => cat.name === categoryName);
          const categoryId = categoryInDb?.id || '';

          // Salvar palavras na categoria
          const result = await saveWordsToDatabase(words, categoryId, categoryName);
          totalImported += result.count;
          categoriesProcessed++;

          console.log(`Categoria "${categoryName}": ${result.count} palavras importadas`);
        } catch (error) {
          console.error(`Erro ao processar categoria "${categoryName}":`, error);
        }
      }

      toast({
        title: "Sucesso!",
        description: `${totalImported} palavras foram importadas em ${categoriesProcessed} categorias`,
      });

      // Limpar formulário
      setSelectedFile(null);
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

  const handleUpload = () => {
    if (uploadMode === 'single') {
      handleUploadSingle();
    } else {
      handleUploadMultiple();
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
              <Label htmlFor="upload-mode">Modo de Upload</Label>
              <Select value={uploadMode} onValueChange={(value: 'single' | 'multiple') => setUploadMode(value)} disabled={isUploading}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Uma categoria - Palavras para uma categoria específica
                    </div>
                  </SelectItem>
                  <SelectItem value="multiple">
                    <div className="flex items-center gap-2">
                      <Layers className="h-4 w-4" />
                      Múltiplas categorias - Palavras organizadas por categoria
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            {uploadMode === 'single' && (
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
            )}

            <Button
              onClick={handleUpload}
              disabled={!selectedFile || (uploadMode === 'single' && !selectedCategory) || isUploading}
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
                <h4 className="text-sm font-medium text-blue-800 mb-2">
                  {uploadMode === 'single' ? 'Formato - Uma Categoria' : 'Formato - Múltiplas Categorias'}
                </h4>
                <div className="text-sm text-blue-700 space-y-2">
                  {uploadMode === 'single' ? (
                    <>
                      <p>• Uma palavra por linha</p>
                      <p>• Palavras com pelo menos 3 letras</p>
                      <p>• Apenas letras (sem números ou símbolos)</p>
                      <p>• Se houver vírgulas, apenas a primeira coluna será usada</p>
                    </>
                  ) : (
                    <>
                      <p>• Formato: PALAVRA,CATEGORIA</p>
                      <p>• Uma palavra e categoria por linha</p>
                      <p>• Palavras com pelo menos 3 letras</p>
                      <p>• Categorias são criadas automaticamente se não existirem</p>
                    </>
                  )}
                </div>
                
                <div className="mt-3">
                  <h5 className="text-sm font-medium text-blue-800 mb-1">Exemplo:</h5>
                  <div className="bg-white border border-blue-200 rounded p-2 text-xs font-mono">
                    {uploadMode === 'single' ? (
                      <>
                        CASA<br/>
                        CARRO<br/>
                        COMPUTADOR<br/>
                        TELEFONE
                      </>
                    ) : (
                      <>
                        CASA,casa<br/>
                        CARRO,veiculos<br/>
                        GATO,animais<br/>
                        CACHORRO,animais<br/>
                        COMPUTADOR,tecnologia
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    Palavras duplicadas na mesma categoria serão ignoradas automaticamente
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
