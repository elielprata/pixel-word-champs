
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from "@/hooks/use-toast";
import DataSectionHeader from './sections/DataSectionHeader';
import AvatarSection from './sections/AvatarSection';
import UsernameSection from './sections/UsernameSection';
import EmailSection from './sections/EmailSection';
import PixConfigSection from './sections/PixConfigSection';

const MyDataSection = () => {
  const { user } = useAuth();
  const { updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    username: user?.username || '',
    pixKey: user?.pix_key || '',
    pixHolderName: user?.pix_holder_name || '',
    pixType: 'cpf' as 'cpf' | 'email' | 'phone' | 'random'
  });
  const [showPixKey, setShowPixKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const isValidUsername = (username: string) => {
    return username.trim().length >= 3 && username.trim().length <= 30;
  };

  const handleStartEdit = () => {
    setEditData({
      username: user?.username || '',
      pixKey: user?.pix_key || '',
      pixHolderName: user?.pix_holder_name || '',
      pixType: 'cpf'
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      username: user?.username || '',
      pixKey: user?.pix_key || '',
      pixHolderName: user?.pix_holder_name || '',
      pixType: 'cpf'
    });
  };

  const handleSave = async () => {
    if (!isValidUsername(editData.username)) {
      toast({
        title: "Nome inválido",
        description: "O nome deve ter entre 3 e 30 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await updateProfile({
        username: editData.username,
        // Note: PIX data seria atualizado através de um serviço específico
      });

      if (result.success) {
        toast({
          title: "Dados atualizados",
          description: "Suas informações foram salvas com sucesso.",
        });
        setIsEditing(false);
      } else {
        toast({
          title: "Erro ao salvar",
          description: result.error || "Erro inesperado",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Erro inesperado ao atualizar dados",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarFallback = () => {
    if (user?.username && user.username.length > 0) {
      return user.username.charAt(0).toUpperCase();
    }
    if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <Card className="shadow-sm border-0">
      <DataSectionHeader
        isEditing={isEditing}
        isLoading={isLoading}
        isValidUsername={isValidUsername}
        editUsername={editData.username}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSave={handleSave}
      />
      
      <CardContent className="space-y-6">
        <AvatarSection
          currentAvatar={user?.avatar_url}
          fallback={getAvatarFallback()}
        />

        <UsernameSection
          username={user?.username || ''}
          editUsername={editData.username}
          isEditing={isEditing}
          isValidUsername={isValidUsername}
          onUsernameChange={(username) => setEditData(prev => ({ ...prev, username }))}
        />

        <EmailSection email={user?.email || ''} />

        <PixConfigSection
          isEditing={isEditing}
          pixHolderName={user?.pix_holder_name || ''}
          pixKey={user?.pix_key || ''}
          pixType={'cpf'}
          editPixHolderName={editData.pixHolderName}
          editPixKey={editData.pixKey}
          editPixType={editData.pixType}
          showPixKey={showPixKey}
          onPixHolderNameChange={(value) => setEditData(prev => ({ ...prev, pixHolderName: value }))}
          onPixKeyChange={(value) => setEditData(prev => ({ ...prev, pixKey: value }))}
          onPixTypeChange={(value) => setEditData(prev => ({ ...prev, pixType: value }))}
          onToggleShowPixKey={() => setShowPixKey(!showPixKey)}
        />

        {isEditing && (
          <div className="bg-blue-50 p-3 rounded-lg border">
            <p className="text-sm text-blue-800">
              <strong>Importante:</strong> As informações PIX serão usadas para receber premiações. 
              Certifique-se de que os dados estão corretos.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MyDataSection;
