
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2, Edit } from 'lucide-react';
import { AdminUser } from '@/hooks/useAdminUsers';

interface AdminUserItemProps {
  user: AdminUser;
  onEdit: (user: { id: string; username: string }) => void;
  onRemove: (userId: string, username: string) => void;
}

export const AdminUserItem = ({ user, onEdit, onRemove }: AdminUserItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{user.username}</span>
          <Badge variant="secondary">Admin</Badge>
        </div>
        <p className="text-sm text-gray-600">{user.email}</p>
        <p className="text-xs text-gray-400">
          Criado em: {new Date(user.created_at).toLocaleDateString()}
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit({ id: user.id, username: user.username })}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onRemove(user.id, user.username)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
