
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Wand2, Zap, Info, AlertCircle, Sparkles } from 'lucide-react';

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

  const handleGenerateAll = () => {
    onGenerateAllCategories(wordsCount);
  };

  const estimatedTokens = categories.length > 0 ? Math.ceil(wordsCount * categories.length * 0.5) + 200 : 0;

  return (
    <>
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
            <Wand2 className="h-5 w-5" />
            Configuração de Geração IA
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
                  max="1000"
                  value={wordsCount}
                  onChange={(e) => setWordsCount(Number(e.target.value))}
                  className="w-24"
                />
                <div className="text-xs text-slate-500">
                  Quantas palavras gerar por categoria (máx. 1000)
                </div>
              </div>
              
              {categories.length > 0 && (
                <div className="space-y-3">
                  <Button
                    onClick={handleGenerateAll}
                    disabled={isGenerating}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    {isGenerating ? 'Gerando...' : `Gerar para Todas (${categories.length} categorias)`}
                  </Button>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">Geração Otimizada</span>
                    </div>
                    <div className="text-xs text-green-700 space-y-1">
                      <p>• <strong>1 única requisição</strong> para todas as categorias</p>
                      <p>• Total: <strong>{wordsCount * categories.length} palavras</strong></p>
                      <p>• Economia: <strong>~{categories.length - 1} requisições</strong></p>
                      <p>• Tokens estimados: <strong>~{estimatedTokens}</strong> (vs {estimatedTokens * categories.length} individual)</p>
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
