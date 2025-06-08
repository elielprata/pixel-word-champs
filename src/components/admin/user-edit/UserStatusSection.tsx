
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Ban, CheckCircle } from 'lucide-react';

interface UserStatusSectionProps {
  isBanned: boolean;
  banReason?: string;
  bannedAt?: string;
  onToggleBan: (banned: boolean, reason?: string) => Promise<void>;
  isLoading: boolean;
}

export const UserStatusSection = ({ 
  isBanned,
  banReason,
  bannedAt,
  onToggleBan, 
  isLoading 
}: UserStatusSectionProps) => {
  const [showBanForm, setShowBanForm] = useState(false);
  const [newBanReason, setNewBanReason] = useState('');

  const handleBan = async () => {
    if (newBanReason.trim()) {
      await onToggleBan(true, newBanReason.trim());
      setShowBanForm(false);
      setNewBanReason('');
    }
  };

  const handleUnban = async () => {
    await onToggleBan(false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-700 flex items-center gap-2">
        <Shield className="h-4 w-4" />
        Status do Usuário
      </h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm">Status:</span>
            {isBanned ? (
              <Badge variant="destructive" className="flex items-center gap-1">
                <Ban className="h-3 w-3" />
                Banido
              </Badge>
            ) : (
              <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800">
                <CheckCircle className="h-3 w-3" />
                Ativo
              </Badge>
            )}
          </div>
          
          {!showBanForm && (
            <div className="flex gap-2">
              {isBanned ? (
                <Button
                  size="sm"
                  variant="default"
                  onClick={handleUnban}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Desbanir'}
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowBanForm(true)}
                  disabled={isLoading}
                >
                  Banir Usuário
                </Button>
              )}
            </div>
          )}
        </div>

        {isBanned && banReason && (
          <div className="p-3 bg-red-50 border border-red-200 rounded">
            <div className="text-xs text-red-600 font-medium mb-1">Motivo do banimento:</div>
            <div className="text-sm text-red-800">{banReason}</div>
            {bannedAt && (
              <div className="text-xs text-red-600 mt-1">
                Banido em: {new Date(bannedAt).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}

        {showBanForm && (
          <div className="space-y-3 p-3 border border-red-200 rounded bg-red-50">
            <Label className="text-sm font-medium text-red-800">Motivo do banimento</Label>
            <Textarea
              value={newBanReason}
              onChange={(e) => setNewBanReason(e.target.value)}
              placeholder="Descreva o motivo do banimento..."
              disabled={isLoading}
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="destructive"
                onClick={handleBan}
                disabled={isLoading || !newBanReason.trim()}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar Banimento'}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowBanForm(false);
                  setNewBanReason('');
                }}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
