
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Mail, Phone, CreditCard, User as UserIcon, Camera } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { AvatarUpload } from '../ui/AvatarUpload';
import { logger } from '@/utils/logger';

export const MyDataSection = () => {
  const { profile, updateProfile, isLoading } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: profile?.username || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    pix_key: profile?.pix_key || '',
    pix_holder_name: profile?.pix_holder_name || ''
  });

  logger.debug('MyDataSection renderizado', { 
    hasProfile: !!profile,
    isEditing,
    isLoading 
  }, 'MY_DATA_SECTION');

  // Atualizar formData quando profile mudar
  React.useEffect(() => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        pix_key: profile.pix_key || '',
        pix_holder_name: profile.pix_holder_name || ''
      });
    }
  }, [profile]);

  const handleInputChange = (field: string, value: string) => {
    logger.debug('Campo alterado', { field, value }, 'MY_DATA_SECTION');
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      logger.info('Salvando dados do perfil', { username: formData.username }, 'MY_DATA_SECTION');
      
      await updateProfile({
        username: formData.username,
        phone: formData.phone,
        pix_key: formData.pix_key,
        pix_holder_name: formData.pix_holder_name
      });
      
      setIsEditing(false);
      logger.info('Dados salvos com sucesso', undefined, 'MY_DATA_SECTION');
    } catch (error) {
      logger.error('Erro ao salvar dados', { error }, 'MY_DATA_SECTION');
    }
  };

  const handleCancel = () => {
    logger.debug('Cancelando edição', undefined, 'MY_DATA_SECTION');
    
    // Restaurar dados originais
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        phone: profile.phone || '',
        pix_key: profile.pix_key || '',
        pix_holder_name: profile.pix_holder_name || ''
      });
    }
    setIsEditing(false);
  };

  const handleAvatarChange = (newAvatarUrl: string) => {
    logger.info('Avatar atualizado', { newAvatarUrl }, 'MY_DATA_SECTION');
    // A atualização do avatar é gerenciada pelo componente AvatarUpload
  };

  if (!profile) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center mb-4">
          <div className="relative">
            <AvatarUpload
              currentAvatarUrl={profile.avatar_url}
              onAvatarChange={handleAvatarChange}
              size="lg"
            />
            {isEditing && (
              <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full p-1">
                <Camera className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
        </div>
        <CardTitle className="text-2xl text-purple-800">Meus Dados</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Campo Username */}
        <div className="space-y-2">
          <Label htmlFor="username" className="flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            Nome de usuário
          </Label>
          {isEditing ? (
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange('username', e.target.value)}
              placeholder="Digite seu nome de usuário"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md">
              {profile.username || 'Não informado'}
            </div>
          )}
        </div>

        {/* Campo Email (somente leitura) */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </Label>
          <div className="p-3 bg-gray-100 rounded-md text-gray-600">
            {profile.email}
            <span className="text-xs ml-2">(não editável)</span>
          </div>
        </div>

        {/* Campo Telefone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Telefone
          </Label>
          {isEditing ? (
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Digite seu telefone"
            />
          ) : (
            <div className="p-3 bg-gray-50 rounded-md">
              {profile.phone || 'Não informado'}
            </div>
          )}
        </div>

        {/* Campos PIX */}
        <div className="space-y-4 border-t pt-4">
          <h3 className="font-semibold text-purple-800 flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Dados PIX (para recebimento de prêmios)
          </h3>
          
          <div className="space-y-2">
            <Label htmlFor="pix_holder_name">Nome do titular</Label>
            {isEditing ? (
              <Input
                id="pix_holder_name"
                value={formData.pix_holder_name}
                onChange={(e) => handleInputChange('pix_holder_name', e.target.value)}
                placeholder="Nome completo do titular da conta"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {profile.pix_holder_name || 'Não informado'}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pix_key">Chave PIX</Label>
            {isEditing ? (
              <Input
                id="pix_key"
                value={formData.pix_key}
                onChange={(e) => handleInputChange('pix_key', e.target.value)}
                placeholder="CPF, email, telefone ou chave aleatória"
              />
            ) : (
              <div className="p-3 bg-gray-50 rounded-md">
                {profile.pix_key || 'Não informado'}
              </div>
            )}
          </div>
        </div>

        {/* Botões de ação */}
        <div className="flex gap-3 pt-4">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? 'Salvando...' : 'Salvar'}
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Editar Dados
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
