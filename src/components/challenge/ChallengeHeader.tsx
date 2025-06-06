
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from 'lucide-react';

interface ChallengeHeaderProps {
  onBack: () => void;
  theme: string;
}

const ChallengeHeader = ({ onBack, theme }: ChallengeHeaderProps) => {
  return (
    <div className="bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Voltar</span>
        </Button>
        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-300">
          {theme}
        </Badge>
      </div>
    </div>
  );
};

export default ChallengeHeader;
