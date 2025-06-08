
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from 'lucide-react';

interface UserBasicInfoSectionProps {
  username: string;
  email: string;
  onUpdate: (data: { username?: string; email?: string }) => Promise<void>;
  isLoading: boolean;
}

export const UserBasicInfoSection = ({ 
  username, 
  email, 
  onUpdate, 
  isLoading 
}: UserBasicInfoSectionProps) => {
  const [editingUsername, setEditingUsername] = useState(false);
  const [editingEmail, setEditingEmail] = useState(false);
  const [newUsername, setNewUsername] = useState(username);
  const [newEmail, setNewEmail] = useState(email);

  const handleUsernameUpdate = async () => {
    if (newUsername !== username && newUsername.trim()) {
      await onUpdate({ username: newUsername.trim() });
      setEditingUsername(false);
    } else {
      setEditingUsername(false);
      setNewUsername(username);
    }
  };

  const handleEmailUpdate = async () => {
    if (newEmail !== email && newEmail.trim()) {
      await onUpdate({ email: newEmail.trim() });
      setEditingEmail(false);
    } else {
      setEditingEmail(false);
      setNewEmail(email);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-700">Informações Básicas</h3>
      
      {/* Username */}
      <div className="space-y-2">
        <Label>Nome de usuário</Label>
        {editingUsername ? (
          <div className="flex gap-2">
            <Input
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Nome de usuário"
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={handleUsernameUpdate}
              disabled={isLoading || !newUsername.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingUsername(false);
                setNewUsername(username);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded border">
            <span className="text-sm">{username}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingUsername(true)}
              className="h-6 px-2 text-xs"
            >
              Editar
            </Button>
          </div>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label>Email</Label>
        {editingEmail ? (
          <div className="flex gap-2">
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="Email"
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={handleEmailUpdate}
              disabled={isLoading || !newEmail.trim()}
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setEditingEmail(false);
                setNewEmail(email);
              }}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between p-2 bg-slate-50 rounded border">
            <span className="text-sm">{email}</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setEditingEmail(true)}
              className="h-6 px-2 text-xs"
            >
              Editar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
