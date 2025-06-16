
import React from 'react';
import { Button } from "@/components/ui/button";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { User, Edit, Save, X } from 'lucide-react';

interface DataSectionHeaderProps {
  isEditing: boolean;
  isLoading: boolean;
  isValidUsername: (username: string) => boolean;
  editUsername: string;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSave: () => void;
}

const DataSectionHeader = ({
  isEditing,
  isLoading,
  isValidUsername,
  editUsername,
  onStartEdit,
  onCancelEdit,
  onSave
}: DataSectionHeaderProps) => {
  return (
    <CardHeader className="pb-4">
      <div className="flex items-center justify-between">
        <CardTitle className="text-base flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          Meus Dados
        </CardTitle>
        
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={onStartEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onCancelEdit} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={onSave} disabled={isLoading || !isValidUsername(editUsername)}>
              <Save className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </CardHeader>
  );
};

export default DataSectionHeader;
