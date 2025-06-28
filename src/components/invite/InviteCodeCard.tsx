
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from 'lucide-react';

interface InviteCodeCardProps {
  inviteCode: string;
  onCopyCode: () => void;
}

const InviteCodeCard = ({ inviteCode, onCopyCode }: InviteCodeCardProps) => {
  if (!inviteCode) return null;

  return (
    <Card className="mb-6 border-0 bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg">
      <CardHeader className="pb-4">
        <CardTitle className="text-center text-lg font-semibold">
          Seu Código Especial
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
          <p className="text-2xl font-bold tracking-widest">{inviteCode}</p>
        </div>
        <div className="flex justify-center">
          <Button 
            variant="secondary" 
            size="sm"
            onClick={onCopyCode}
            className="bg-white/20 backdrop-blur-sm hover:bg-white/30 border-0 text-white px-6"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copiar Código
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default InviteCodeCard;
