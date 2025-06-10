
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CategoryFormProps {
  onCreateCategory: (category: { name: string; description: string }) => void;
  isCreating: boolean;
}

export const CategoryForm = ({ onCreateCategory, isCreating }: CategoryFormProps) => {
  const [newCategory, setNewCategory] = useState({ name: '', description: '' });
  const [validationError, setValidationError] = useState('');

  const handleCreate = () => {
    const trimmedName = newCategory.name.trim();
    
    if (!trimmedName) {
      setValidationError('O nome da categoria é obrigatório');
      return;
    }
    
    if (trimmedName.length < 2) {
      setValidationError('O nome da categoria deve ter pelo menos 2 caracteres');
      return;
    }
    
    setValidationError('');
    
    onCreateCategory({
      name: trimmedName,
      description: newCategory.description.trim()
    });
    
    setNewCategory({ name: '', description: '' });
  };

  const handleNameChange = (value: string) => {
    setNewCategory(prev => ({ ...prev, name: value }));
    if (validationError) {
      setValidationError('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Nova Categoria
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {validationError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{validationError}</AlertDescription>
          </Alert>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-700">Nome *</label>
            <Input
              placeholder="Ex: animais, objetos..."
              value={newCategory.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className={validationError ? 'border-red-500' : ''}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Descrição (opcional)</label>
            <Input
              placeholder="Descrição da categoria"
              value={newCategory.description}
              onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
        </div>
        <Button 
          onClick={handleCreate}
          disabled={!newCategory.name.trim() || isCreating}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          {isCreating ? 'Criando...' : 'Criar Categoria'}
        </Button>
      </CardContent>
    </Card>
  );
};
