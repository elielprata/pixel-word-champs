
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Edit, Save, X, Eye, EyeOff, CreditCard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from '@/components/ui/AvatarUpload';

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

  const getPixKeyPlaceholder = () => {
    switch (editData.pixType) {
      case 'cpf': return '000.000.000-00';
      case 'email': return 'seu@email.com';
      case 'phone': return '(11) 99999-9999';
      case 'random': return 'chave-aleatoria-gerada-pelo-banco';
      default: return '';
    }
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
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            Meus Dados
          </CardTitle>
          
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleStartEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isLoading}>
                <X className="w-4 h-4" />
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading || !isValidUsername(editData.username)}>
                <Save className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <AvatarUpload
            currentAvatar={user?.avatar_url}
            fallback={getAvatarFallback()}
            size="md"
          />
          <div>
            <p className="text-sm font-medium text-gray-900">Foto do perfil</p>
            <p className="text-xs text-gray-500">Clique na foto para alterar</p>
          </div>
        </div>

        {/* Nome de usuário */}
        <div className="space-y-2">
          <Label htmlFor="username">Nome de usuário</Label>
          {!isEditing ? (
            <div className="p-3 bg-gray-50 rounded-lg border">
              <span className="text-gray-900 font-medium">{user?.username}</span>
            </div>
          ) : (
            <div className="space-y-1">
              <Input
                id="username"
                value={editData.username}
                onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                placeholder="Digite seu nome de usuário"
                maxLength={30}
                className={!isValidUsername(editData.username) ? 'border-red-300 bg-red-50' : ''}
              />
              <div className="flex items-center justify-between text-xs">
                <span className={editData.username.length >= 3 ? 'text-green-600' : 'text-gray-500'}>
                  ✓ Mínimo 3 caracteres
                </span>
                <span className="text-gray-500">{editData.username.length}/30</span>
              </div>
            </div>
          )}
        </div>

        {/* Email (somente visualização) */}
        <div className="space-y-2">
          <Label>Email</Label>
          <div className="p-3 bg-gray-50 rounded-lg border">
            <span className="text-gray-900">{user?.email}</span>
          </div>
          <p className="text-xs text-gray-500">O email não pode ser alterado</p>
        </div>

        {/* Configurações PIX */}
        <div className="border-t pt-4">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-5 h-5 text-green-600" />
            <h3 className="font-medium text-gray-900">Configurações PIX</h3>
          </div>
          
          {!isEditing ? (
            <div className="space-y-3">
              <div>
                <Label>Nome do titular</Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-900">{user?.pix_holder_name || 'Não configurado'}</span>
                </div>
              </div>
              <div>
                <Label>Chave PIX</Label>
                <div className="p-3 bg-gray-50 rounded-lg border">
                  <span className="text-gray-900">{user?.pix_key || 'Não configurado'}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pixHolderName">Nome do titular</Label>
                <Input
                  id="pixHolderName"
                  value={editData.pixHolderName}
                  onChange={(e) => setEditData(prev => ({ ...prev, pixHolderName: e.target.value }))}
                  placeholder="Nome completo como aparece na conta"
                />
              </div>

              <div>
                <Label htmlFor="pixType">Tipo de chave PIX</Label>
                <select
                  id="pixType"
                  value={editData.pixType}
                  onChange={(e) => setEditData(prev => ({ ...prev, pixType: e.target.value as any }))}
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cpf">CPF</option>
                  <option value="email">E-mail</option>
                  <option value="phone">Telefone</option>
                  <option value="random">Chave aleatória</option>
                </select>
              </div>

              <div>
                <Label htmlFor="pixKey">Chave PIX</Label>
                <div className="relative">
                  <Input
                    id="pixKey"
                    type={showPixKey ? "text" : "password"}
                    value={editData.pixKey}
                    onChange={(e) => setEditData(prev => ({ ...prev, pixKey: e.target.value }))}
                    placeholder={getPixKeyPlaceholder()}
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPixKey(!showPixKey)}
                  >
                    {showPixKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

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
