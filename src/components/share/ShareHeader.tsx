
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, X } from 'lucide-react';

interface ShareHeaderProps {
  onClose: () => void;
}

const ShareHeader = ({ onClose }: ShareHeaderProps) => {
  return (
    <CardHeader className="pb-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg p-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center">
            <Share2 className="w-3 h-3" />
          </div>
          <div>
            <CardTitle className="text-base">Compartilhar & Ganhar</CardTitle>
            <p className="text-xs text-white/80">Convide amigos e ganhe recompensas!</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20 h-7 w-7">
          <X className="w-3 h-3" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default ShareHeader;
