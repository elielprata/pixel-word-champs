
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Lightbulb, RotateCcw, Play } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface HelpSystemProps {
  onHintUsed: (revealedWord: string) => void;
  onReviveUsed: () => void;
  hintsRemaining: number;
  canUseRevive: boolean;
}

const HelpSystem = ({ onHintUsed, onReviveUsed, hintsRemaining, canUseRevive }: HelpSystemProps) => {
  const [showAdModal, setShowAdModal] = useState(false);
  const [adType, setAdType] = useState<'hint' | 'revive'>('hint');
  const [isWatchingAd, setIsWatchingAd] = useState(false);
  const { toast } = useToast();

  const handleHintRequest = () => {
    if (hintsRemaining <= 0) {
      toast({
        title: "Dicas esgotadas",
        description: "Você já usou sua dica neste nível",
        variant: "destructive"
      });
      return;
    }
    
    setAdType('hint');
    setShowAdModal(true);
  };

  const handleReviveRequest = () => {
    if (!canUseRevive) {
      toast({
        title: "Revive indisponível", 
        description: "O tempo ainda não acabou",
        variant: "destructive"
      });
      return;
    }

    setAdType('revive');
    setShowAdModal(true);
  };

  const watchAd = async () => {
    setIsWatchingAd(true);
    setShowAdModal(false);

    // Simular assistir anúncio (30 segundos)
    toast({
      title: "Assistindo anúncio...",
      description: "Aguarde 30 segundos para receber sua recompensa"
    });

    // Simular tempo do anúncio
    setTimeout(() => {
      setIsWatchingAd(false);
      
      if (adType === 'hint') {
        // Simular palavra revelada
        const mockWords = ['CASA', 'GATO', 'LIVRO', 'VERDE', 'PIANO'];
        const revealedWord = mockWords[Math.floor(Math.random() * mockWords.length)];
        onHintUsed(revealedWord);
      } else {
        onReviveUsed();
        
        toast({
          title: "+30 segundos!",
          description: "Tempo adicionado com sucesso",
          variant: "default"
        });
      }
    }, 3000); // 3 segundos para demo, seria 30s real
  };

  if (showAdModal) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <Card className="w-80 m-4">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              {adType === 'hint' ? (
                <Lightbulb className="w-12 h-12 mx-auto text-yellow-500" />
              ) : (
                <RotateCcw className="w-12 h-12 mx-auto text-green-500" />
              )}
            </div>
            
            <h3 className="text-lg font-bold mb-2">
              {adType === 'hint' ? 'Dica Disponível' : 'Revive Disponível'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {adType === 'hint' 
                ? 'Assista a um anúncio de 30s para revelar uma palavra no tabuleiro'
                : 'Assista a um anúncio de 30s para ganhar +30 segundos neste nível'
              }
            </p>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setShowAdModal(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={watchAd}
                className="flex-1 bg-green-500 hover:bg-green-600"
              >
                <Play className="w-4 h-4 mr-2" />
                Assistir
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isWatchingAd) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
        <Card className="w-80 m-4">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-bold mb-2 text-white">Anúncio em Exibição</h3>
            <p className="text-gray-300">Aguarde para receber sua recompensa...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full"
        onClick={handleHintRequest}
        disabled={hintsRemaining <= 0}
      >
        <Lightbulb className="w-4 h-4" />
        {hintsRemaining > 0 && (
          <span className="ml-1 bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {hintsRemaining}
          </span>
        )}
      </Button>
      
      <Button 
        size="sm" 
        variant="outline" 
        className="rounded-full"
        onClick={handleReviveRequest}
      >
        <RotateCcw className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default HelpSystem;
