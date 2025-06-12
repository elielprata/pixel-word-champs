
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertTriangle, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";

interface DeleteInactiveWordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  inactiveWordsCount: number;
}

export const DeleteInactiveWordsModal = ({ isOpen, onClose, onSuccess, inactiveWordsCount }: DeleteInactiveWordsModalProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    if (inactiveWordsCount === 0) {
      toast({
        title: "Nenhuma palavra inativa",
        description: "Não há palavras inativas para excluir.",
        variant: "destructive"
      });
      return;
    }

    setIsDeleting(true);

    try {
      console.log('🗑️ Iniciando exclusão de palavras inativas...');
      
      // Usar type assertion para contornar problemas de tipagem do Supabase
      const { error } = await supabase
        .from('level_words')
        .delete()
        .eq('is_active', false as any);

      if (error) {
        console.error('❌ Erro ao excluir palavras inativas:', error);
        throw error;
      }

      console.log('✅ Palavras inativas excluídas com sucesso');
      
      toast({
        title: "Sucesso!",
        description: `${inactiveWordsCount} palavras inativas foram excluídas.`,
      });

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('❌ Erro ao excluir palavras inativas:', error);
      toast({
        title: "Erro ao excluir palavras",
        description: error.message || "Tente novamente mais tarde",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Excluir Palavras Inativas
          </DialogTitle>
          <DialogDescription>
            Esta ação irá excluir permanentemente <strong>{inactiveWordsCount}</strong> palavras inativas do banco de dados.
            <br /><br />
            <span className="text-red-600 font-medium">Esta ação não pode ser desfeita!</span>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || inactiveWordsCount === 0}
          >
            {isDeleting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Excluindo...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir {inactiveWordsCount} Palavras
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
