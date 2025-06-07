
import React from 'react';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface UserRoleSectionProps {
  currentRole: string;
  isLoading: boolean;
  onRoleChange: (role: 'admin' | 'user') => void;
}

export const UserRoleSection = ({ currentRole, isLoading, onRoleChange }: UserRoleSectionProps) => {
  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">Permissão do usuário</h4>
      <RadioGroup
        value={currentRole}
        onValueChange={(value) => onRoleChange(value as 'admin' | 'user')}
        disabled={isLoading}
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="user" id="user" />
          <Label htmlFor="user" className="flex-1">
            <div>
              <span className="font-medium">Usuário</span>
              <p className="text-xs text-gray-500">Acesso básico à plataforma</p>
            </div>
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="admin" id="admin" />
          <Label htmlFor="admin" className="flex-1">
            <div>
              <span className="font-medium">Administrador</span>
              <p className="text-xs text-gray-500">Acesso total ao painel administrativo</p>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
