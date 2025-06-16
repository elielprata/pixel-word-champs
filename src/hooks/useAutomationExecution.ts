
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { automationService } from '@/services/automationService';

export const useAutomationExecution = () => {
  const { toast } = useToast();
  const [isExecuting, setIsExecuting] = useState(false);

  const executeManualReset = async (): Promise<boolean> => {
    setIsExecuting(true);
    try {
      const success = await automationService.executeManualReset();
      
      toast({
        title: "Reset executado!",
        description: "O reset de pontuações foi executado manualmente",
      });

      return success;
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao executar reset manual",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsExecuting(false);
    }
  };

  return {
    isExecuting,
    executeManualReset
  };
};
