
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, Mail, Calendar, Crown } from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminUsers';

interface AdminUserItemProps {
  user: AdminUser;
  onEdit: (user: { id: string; username: string }) => void;
  onRemove: (userId: string, username: string) => void;
}

export const AdminUserItem = ({ user, onEdit, onRemove }: AdminUserItemProps) => {
  return (
    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 p-2 rounded-full">
            <Crown className="h-4 w-4 text-purple-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-800">{user.username}</span>
              <Badge className="bg-purple-100 text-purple-800 border-purple-200 text-xs">
                Administrador
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-600 mt-1">
              <Mail className="h-3 w-3" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
              <Calendar className="h-3 w-3" />
              <span>
                Criado em: {new Date(user.created_at).toLocaleDateString('pt-BR')}
              </span>
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit({ id: user.id, username: user.username })}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
        >
          <Edit className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Editar</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(user.id, user.username)}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
        >
          <Trash2 className="h-4 w-4" />
          <span className="hidden sm:inline ml-1">Remover</span>
        </Button>
      </div>
    </div>
  );
};
