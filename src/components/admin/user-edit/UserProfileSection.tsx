
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail } from 'lucide-react';

interface UserProfileSectionProps {
  currentUsername: string;
  currentEmail: string;
  isUpdating: boolean;
  onProfileUpdate: (username: string, email: string) => Promise<void>;
}

export const UserProfileSection = ({ 
  currentUsername, 
  currentEmail, 
  isUpdating, 
  onProfileUpdate 
}: UserProfileSectionProps) => {
  const [username, setUsername] = useState(currentUsername);
  const [email, setEmail] = useState(currentEmail);

  useEffect(() => {
    setUsername(currentUsername);
    setEmail(currentEmail);
  }, [currentUsername, currentEmail]);

  const handleUpdate = async () => {
    await onProfileUpdate(username, email);
  };

  const hasChanges = username !== currentUsername || email !== currentEmail;

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Informações do usuário</h4>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="username" className="text-sm font-medium">
            Nome de usuário
          </Label>
          <div className="relative">
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isUpdating}
              className="pl-10"
              placeholder="Digite o nome de usuário"
            />
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">
            Email
          </Label>
          <div className="relative">
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isUpdating}
              className="pl-10"
              placeholder="Digite o email"
            />
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
        </div>

        <Button
          onClick={handleUpdate}
          disabled={!hasChanges || isUpdating || !username.trim()}
          className="w-full"
          variant="outline"
        >
          {isUpdating ? 'Atualizando...' : 'Atualizar Informações'}
        </Button>
      </div>
    </div>
  );
};
