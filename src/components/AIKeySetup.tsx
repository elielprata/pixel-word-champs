
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Key, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { aiService } from '@/services/aiService';

const AIKeySetup = () => {
  const [apiKey, setApiKey] = useState('');
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const { toast } = useToast();

  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave da API",
        variant: "destructive"
      });
      return;
    }

    setIsTestingKey(true);
    
    try {
      // Teste simples da API
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        setIsValid(true);
        aiService.setApiKey(apiKey);
        localStorage.setItem('openai_api_key', apiKey);
        
        toast({
          title: "Sucesso!",
          description: "Chave da API validada com sucesso",
        });
      } else {
        setIsValid(false);
        toast({
          title: "Erro",
          description: "Chave da API inválida",
          variant: "destructive"
        });
      }
    } catch (error) {
      setIsValid(false);
      toast({
        title: "Erro",
        description: "Não foi possível validar a chave da API",
        variant: "destructive"
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  React.useEffect(() => {
    // Carrega a chave salva no localStorage
    const savedKey = localStorage.getItem('openai_api_key');
    if (savedKey) {
      setApiKey(savedKey);
      aiService.setApiKey(savedKey);
      setIsValid(true);
    }
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5 text-blue-500" />
          Configuração da IA
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">Chave da API OpenAI</Label>
          <div className="flex gap-2">
            <Input
              id="apiKey"
              type="password"
              placeholder="sk-..."
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setIsValid(null);
              }}
            />
            <Button 
              onClick={testApiKey}
              disabled={isTestingKey}
              size="sm"
            >
              {isTestingKey ? 'Testando...' : 'Testar'}
            </Button>
          </div>
        </div>

        {isValid !== null && (
          <div className="flex items-center gap-2">
            {isValid ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                <Badge variant="default">API Válida</Badge>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-red-500" />
                <Badge variant="destructive">API Inválida</Badge>
              </>
            )}
          </div>
        )}

        <div className="text-xs text-gray-600 space-y-2">
          <p>• A IA será usada para gerar palavras válidas no tabuleiro</p>
          <p>• Sem a API, o jogo funcionará com dados mock</p>
          <p>• A chave é armazenada localmente no seu navegador</p>
        </div>

        {!isValid && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              Para obter uma chave da API OpenAI, visite{' '}
              <a 
                href="https://platform.openai.com/api-keys" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline hover:text-blue-900"
              >
                platform.openai.com
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIKeySetup;
