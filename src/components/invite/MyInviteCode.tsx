
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Gift, Zap } from 'lucide-react';

interface MyInviteCodeProps {
  inviteCode: string;
  onCopyCode: () => void;
}

const MyInviteCode = ({ inviteCode, onCopyCode }: MyInviteCodeProps) => {
  if (!inviteCode) return null;

  return (
    <Card className="border-0 bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-5 h-5" />
          <h3 className="font-bold text-lg">Seu Código Mágico</h3>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
          <div className="text-center mb-3">
            <p className="text-3xl font-bold tracking-wider">{inviteCode}</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm opacity-90">
            <Zap className="w-4 h-4" />
            <span>Ambos ganham 50 XP no cadastro!</span>
          </div>
        </div>

        <Button 
          onClick={onCopyCode}
          className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white font-semibold"
        >
          <Copy className="w-4 h-4 mr-2" />
          Copiar & Compartilhar
        </Button>

        <div className="mt-3 text-center">
          <p className="text-xs opacity-80">
            💡 Dica: Compartilhe nas redes sociais para mais indicações!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyInviteCode;
