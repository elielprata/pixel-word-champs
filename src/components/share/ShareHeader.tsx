
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, X } from 'lucide-react';

interface ShareHeaderProps {
  onClose: () => void;
}

const ShareHeader = ({ onClose }: ShareHeaderProps) => {
  return (
    <CardHeader className="pb-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-t-lg">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <CardTitle className="text-lg">Compartilhar & Ganhar</CardTitle>
            <p className="text-sm text-white/80">Convide amigos e ganhe recompensas!</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-4 h-4" />
        </Button>
      </div>
    </CardHeader>
  );
};

export default ShareHeader;
