
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUsernameVerification } from '@/hooks/useUsernameVerification';
import { AvailabilityIndicator } from '@/components/auth/AvailabilityIndicator';
import { useAuth } from '@/hooks/useAuth';

interface UsernameSectionProps {
  username: string;
  editUsername: string;
  isEditing: boolean;
  isValidUsername: (username: string) => boolean;
  onUsernameChange: (username: string) => void;
}

const UsernameSection = ({ 
  username, 
  editUsername, 
  isEditing, 
  isValidUsername, 
  onUsernameChange 
}: UsernameSectionProps) => {
  const { user } = useAuth();
  const usernameCheck = useUsernameVerification(editUsername);
  
  // Só verificar se o username mudou em relação ao atual
  const shouldCheckAvailability = isEditing && editUsername !== username && editUsername.length >= 3;

  return (
    <div className="space-y-2">
      <Label htmlFor="username">Nome de usuário</Label>
      {!isEditing ? (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <span className="text-gray-900 font-medium">{username}</span>
        </div>
      ) : (
        <div className="space-y-2">
          <Input
            id="username"
            value={editUsername}
            onChange={(e) => onUsernameChange(e.target.value)}
            placeholder="Digite seu nome de usuário"
            maxLength={30}
            className={
              (!isValidUsername(editUsername) || (shouldCheckAvailability && !usernameCheck.available)) 
                ? 'border-red-300 bg-red-50' 
                : ''
            }
          />
          <div className="flex items-center justify-between text-xs">
            <span className={editUsername.length >= 3 ? 'text-green-600' : 'text-gray-500'}>
              ✓ Mínimo 3 caracteres
            </span>
            <span className="text-gray-500">{editUsername.length}/30</span>
          </div>
          {shouldCheckAvailability && (
            <AvailabilityIndicator
              checking={usernameCheck.checking}
              available={usernameCheck.available}
              exists={usernameCheck.exists}
              type="username"
              value={editUsername}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default UsernameSection;
