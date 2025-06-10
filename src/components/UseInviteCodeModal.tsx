
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Gift, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useInvites } from '@/hooks/useInvites';

interface UseInviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UseInviteCodeModal = ({ isOpen, onClose }: UseInviteCodeModalProps) => {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { useInviteCode } = useInvites();
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      const response = await useInviteCode(code.trim().toUpperCase());
      
      if (response.success) {
        toast({
          title: "🎉 Código usado com sucesso!",
          description: "Você e seu amigo ganharão recompensas em breve!",
        });
        setCode('');
        onClose();
      } else {
        toast({
          title: "Erro ao usar código",
          description: response.error || "Código inválido ou já usado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro inesperado. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 backdrop-blur-sm">
      <Card className="w-full max-w-md border-0 bg-white shadow-2xl animate-scale-in">
        <CardHeader className="pb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg p-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Gift className="w-4 h-4" />
              </div>
              <div>
                <CardTitle className="text-lg">Usar Código de Convite</CardTitle>
                <p className="text-sm text-white/80">Digite o código do seu amigo</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose} 
              className="text-white hover:bg-white/20 h-8 w-8"
              disabled={isLoading}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="invite-code" className="block text-sm font-medium text-gray-700 mb-2">
                Código de Convite
              </label>
              <Input
                id="invite-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Ex: ARENA123ABC"
                className="text-center tracking-widest uppercase"
                maxLength={12}
                disabled={isLoading}
              />
            </div>
            
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-3 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                💡 <strong>Dica:</strong> Ao usar um código válido, você e seu amigo ganharão 50 pontos cada um!
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!code.trim() || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Usar Código'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UseInviteCodeModal;
