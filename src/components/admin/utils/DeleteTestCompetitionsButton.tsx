
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { deleteTestCompetitions } from '@/utils/deleteTestCompetitions';

export const DeleteTestCompetitionsButton: React.FC = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    const confirmed = window.confirm(
      'Tem certeza que deseja deletar as competições de teste? Esta ação não pode ser desfeita.'
    );

    if (!confirmed) return;

    setIsDeleting(true);
    
    try {
      const result = await deleteTestCompetitions();
      
      if (result.success) {
        toast({
          title: "Competições deletadas",
          description: `${result.deletedCount} competições de teste foram removidas com sucesso.`,
        });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('❌ Erro ao deletar:', error);
      toast({
        title: "Erro ao deletar",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Button
      variant="destructive"
      onClick={handleDelete}
      disabled={isDeleting}
      className="flex items-center gap-2"
    >
      {isDeleting ? (
        <div className="animate-spin h-4 w-4 border border-current border-t-transparent rounded-full" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {isDeleting ? 'Deletando...' : 'Deletar Competições de Teste'}
    </Button>
  );
};
