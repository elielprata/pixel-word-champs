
import React, { useRef, useState } from 'react';
import { Camera, Loader2, Upload, Edit3 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { avatarService } from '@/services/avatarService';
import { profileService } from '@/services/profileService';
import { useAuth } from '@/hooks/useAuth';

interface AvatarUploadProps {
  currentAvatar?: string;
  fallback: string;
  onAvatarUpdate?: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

const AvatarUpload = ({ currentAvatar, fallback, onAvatarUpdate, size = 'lg' }: AvatarUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    setIsUploading(true);

    try {
      // Upload da imagem
      const uploadResponse = await avatarService.uploadAvatar(file, user.id);
      
      if (!uploadResponse.success) {
        throw new Error(uploadResponse.error);
      }

      // Atualizar perfil com nova URL
      const updateResponse = await profileService.updateProfile({
        avatar_url: uploadResponse.data
      });

      if (!updateResponse.success) {
        throw new Error(updateResponse.error);
      }

      toast({
        title: "Foto atualizada!",
        description: "Sua foto de perfil foi atualizada com sucesso.",
      });

      onAvatarUpdate?.(uploadResponse.data);
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Erro inesperado",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div 
        className="relative inline-block cursor-pointer group"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleUploadClick}
      >
        <Avatar className={`${sizeClasses[size]} border-4 border-white shadow-lg transition-all duration-200 ${isHovered ? 'brightness-75' : ''}`}>
          <AvatarImage src={currentAvatar} />
          <AvatarFallback className="text-gray-700 text-lg font-bold bg-white">
            {fallback}
          </AvatarFallback>
        </Avatar>
        
        {/* Overlay de edição */}
        <div className={`absolute inset-0 rounded-full bg-black bg-opacity-50 flex items-center justify-center transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          {isUploading ? (
            <Loader2 className="w-6 h-6 text-white animate-spin" />
          ) : (
            <Edit3 className="w-6 h-6 text-white" />
          )}
        </div>

        {/* Botão circular de edição */}
        <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-colors">
          {isUploading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          ) : (
            <Camera className="w-4 h-4 text-white" />
          )}
        </div>
      </div>

      {/* Botão de upload mais visível */}
      <Button
        onClick={handleUploadClick}
        disabled={isUploading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-sm"
      >
        {isUploading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Enviando...
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            {currentAvatar ? 'Alterar foto' : 'Adicionar foto'}
          </>
        )}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  );
};

export default AvatarUpload;
