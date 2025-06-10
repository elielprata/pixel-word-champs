
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, CreditCard, Save, Eye, EyeOff } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface PixConfigScreenProps {
  onBack: () => void;
}

const PixConfigScreen = ({ onBack }: PixConfigScreenProps) => {
  const { toast } = useToast();
  const [pixKey, setPixKey] = useState('');
  const [pixType, setPixType] = useState<'cpf' | 'email' | 'phone' | 'random'>('cpf');
  const [holderName, setHolderName] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSave = () => {
    if (!pixKey.trim() || !holderName.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para continuar.",
        variant: "destructive",
      });
      return;
    }

    // Aqui seria a lógica para salvar as informações do PIX
    toast({
      title: "PIX configurado",
      description: "Suas informações de PIX foram salvas com sucesso.",
    });
    
    onBack();
  };

  const getPixKeyPlaceholder = () => {
    switch (pixType) {
      case 'cpf':
        return '000.000.000-00';
      case 'email':
        return 'seu@email.com';
      case 'phone':
        return '(11) 99999-9999';
      case 'random':
        return 'chave-aleatoria-gerada-pelo-banco';
      default:
        return '';
    }
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">PIX para Recebimento</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-green-500" />
            Configurar PIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="holderName">Nome do titular</Label>
            <Input
              id="holderName"
              value={holderName}
              onChange={(e) => setHolderName(e.target.value)}
              placeholder="Nome completo como aparece na conta"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="pixType">Tipo de chave PIX</Label>
            <select
              id="pixType"
              value={pixType}
              onChange={(e) => setPixType(e.target.value as any)}
              className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="cpf">CPF</option>
              <option value="email">E-mail</option>
              <option value="phone">Telefone</option>
              <option value="random">Chave aleatória</option>
            </select>
          </div>

          <div>
            <Label htmlFor="pixKey">Chave PIX</Label>
            <div className="relative mt-1">
              <Input
                id="pixKey"
                type={showKey ? "text" : "password"}
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                placeholder={getPixKeyPlaceholder()}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowKey(!showKey)}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> Essas informações serão usadas para receber premiações. 
              Certifique-se de que os dados estão corretos e que a chave PIX está ativa.
            </p>
          </div>

          <Button onClick={handleSave} className="w-full">
            <Save className="w-4 h-4 mr-2" />
            Salvar configurações PIX
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PixConfigScreen;
