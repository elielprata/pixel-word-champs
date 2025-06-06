
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Copy, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface CopyButtonProps {
  fullMessage: string;
}

const CopyButton = ({ fullMessage }: CopyButtonProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMessage);
    setCopied(true);
    toast({
      title: "🎉 Copiado com sucesso!",
      description: "Agora é só colar onde quiser compartilhar!",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button 
      onClick={copyToClipboard}
      className={`w-full h-8 text-xs font-semibold transition-all duration-200 ${
        copied 
          ? 'bg-green-500 hover:bg-green-600' 
          : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
      }`}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 mr-1" />
          ✨ Copiado!
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 mr-1" />
          📋 Copiar Mensagem
        </>
      )}
    </Button>
  );
};

export default CopyButton;
