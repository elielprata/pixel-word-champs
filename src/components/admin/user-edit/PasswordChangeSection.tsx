
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Key } from 'lucide-react';

interface PasswordChangeSectionProps {
  onPasswordUpdate: (password: string) => Promise<void>;
  isChangingPassword: boolean;
}

export const PasswordChangeSection = ({ onPasswordUpdate, isChangingPassword }: PasswordChangeSectionProps) => {
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordUpdate = async () => {
    await onPasswordUpdate(newPassword);
    setNewPassword('');
    setShowPassword(false);
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Alterar senha</h4>
      <div className="space-y-3">
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Nova senha (mín. 6 caracteres)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            disabled={isChangingPassword}
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <Button
          onClick={handlePasswordUpdate}
          disabled={!newPassword || isChangingPassword}
          className="w-full"
          variant="outline"
        >
          <Key className="h-4 w-4 mr-2" />
          {isChangingPassword ? 'Atualizando...' : 'Atualizar Senha'}
        </Button>
      </div>
    </div>
  );
};
