
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wand2, Zap, Info, AlertCircle, Sparkles, Database, CheckCircle } from 'lucide-react';
import { useActiveWords } from '@/hooks/useActiveWords';

interface Category {
  id: string;
  name: string;
  description?: string;
}

interface CategoryGenerationConfigProps {
  categories: Category[];
  isGenerating: boolean;
  openaiConfigured: boolean;
  onGenerateAllCategories: (count: number) => void;
}

export const CategoryGenerationConfig = ({ 
  categories, 
  isGenerating, 
  openaiConfigured, 
  onGenerateAllCategories 
}: CategoryGenerationConfigProps) => {
  const [wordsCount, setWordsCount] = useState(5);
  const { words, isLoading: isLoadingWords } = useActiveWords();

  const handleGenerateAll = () => {
    onGenerateAllCategories(wordsCount);
  };

  // Agrupar palavras por categoria para mostrar estatísticas
  const wordsByCategory = words.reduce((acc, word) => {
    const category = word.category || 'Sem categoria';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalWords = words.length;

  return (
    <>
      {/* Status das palavras ativas no banco */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Database className="h-5 w-5" />
            Status do Banco de Palavras
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingWords ? (
            <div className="flex items-center gap-2 text-blue-700">
              <div className="animate-spin h-4 w-4 border-b-2 border-blue-600 rounded-full"></div>
              <span>Verificando banco de palavras...</span>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-blue-700 font-medium">Total de palavras ativas:</span>
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-lg px-3 py-1">
                  {totalWords.toLocaleString()}
                </Badge>
              </div>
              
              {totalWords > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-800">Palavras por categoria:</h4>
                  <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                    {Object.entries(wordsByCategory)
                      .sort(([,a], [,b]) => b - a)
                      .map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center text-xs bg-blue-100 rounded px-2 py-1">
                          <span className="text-blue-800 truncate">{category}</span>
                          <Badge variant="secondary" className="text-xs">{count}</Badge>
                        </div>
                      ))
                    }
                  </div>
                </div>
              )}
              
              {totalWords === 0 && (
                <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">Nenhuma palavra ativa encontrada no banco. É recomendado gerar palavras antes de usar o sistema.</span>
                </div>
              )}
              
              {totalWords > 0 && (
                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Banco de palavras configurado e pronto para uso!</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status da integração OpenAI - só mostra se não configurado */}
      {!openaiConfigured && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">OpenAI não configurada</p>
                <p className="text-xs text-amber-600">Configure a API key na aba "Integrações" para usar IA real</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Geração Inteligente em Lote
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Controles à esquerda */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-slate-700">Quantidade de palavras:</label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={wordsCount}
                  onChange={(e) => setWordsCount(Number(e.target.value))}
                  className="w-24"
                />
                <div className="text-xs text-slate-500">
                  Por categoria (máx. 50)
                </div>
              </div>
              
              {categories.length > 0 && (
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerateAll}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Gerando em lote...' : `Gerar Tudo de Uma Vez (${categories.length} categorias)`}
                  </Button>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="text-xs text-blue-700 space-y-1">
                      <p className="font-medium">💡 Geração Otimizada:</p>
                      <p>• Uma única chamada da API para todas as categorias</p>
                      <p>• Muito mais rápido e econômico</p>
                      <p>• Total: {wordsCount} × {categories.length} = {wordsCount * categories.length} palavras</p>
                      {totalWords > 0 && <p>• Palavras duplicadas serão automaticamente ignoradas</p>}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Regras de geração à direita */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Regras de Geração</h4>
                  <div className="text-sm text-blue-700 space-y-1">
                    <p>A IA distribui automaticamente as palavras por dificuldade:</p>
                    <div className="grid grid-cols-1 gap-2 mt-2">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-red-100 text-red-800 border-red-200 text-xs">Expert</Badge>
                        <span className="text-xs">30% (8+ letras)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-orange-100 text-orange-800 border-orange-200 text-xs">Difícil</Badge>
                        <span className="text-xs">30% (5-7 letras)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs">Médio</Badge>
                        <span className="text-xs">20% (4 letras)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">Fácil</Badge>
                        <span className="text-xs">20% (3 letras)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
