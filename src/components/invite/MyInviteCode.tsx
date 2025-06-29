
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
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-center gap-2 mb-3 md:mb-4">
          <Gift className="w-4 h-4 md:w-5 md:h-5 shrink-0" />
          <h3 className="font-bold text-sm sm:text-base md:text-lg truncate">Seu Código Mágico</h3>
        </div>

        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 md:p-4 mb-3 md:mb-4">
          <div className="text-center mb-2 md:mb-3">
            <p className="text-lg sm:text-xl md:text-3xl font-bold tracking-wider break-all">{inviteCode}</p>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-xs md:text-sm opacity-90">
            <Zap className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
            <span className="text-center">Ambos ganham 50 XP no cadastro!</span>
          </div>
        </div>

        <Button 
          onClick={onCopyCode}
          className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white font-semibold text-sm md:text-base py-2 md:py-3"
        >
          <Copy className="w-3 h-3 md:w-4 md:h-4 mr-2 shrink-0" />
          <span className="truncate">Copiar & Compartilhar</span>
        </Button>

        <div className="mt-2 md:mt-3 text-center">
          <p className="text-xs opacity-80 leading-relaxed">
            💡 Dica: Compartilhe nas redes sociais para mais indicações!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default MyInviteCode;
