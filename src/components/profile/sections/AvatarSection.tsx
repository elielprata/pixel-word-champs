
import React from 'react';
import { Label } from "@/components/ui/label";
import AvatarUpload from '@/components/ui/AvatarUpload';

interface AvatarSectionProps {
  currentAvatar?: string;
  fallback: string;
}

const AvatarSection = ({ currentAvatar, fallback }: AvatarSectionProps) => {
  return (
    <div className="flex items-center gap-4">
      <AvatarUpload
        currentAvatar={currentAvatar}
        fallback={fallback}
        size="md"
      />
      <div>
        <p className="text-sm font-medium text-gray-900">Foto do perfil</p>
        <p className="text-xs text-gray-500">Clique na foto para alterar</p>
      </div>
    </div>
  );
};

export default AvatarSection;
