
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play, Loader2 } from 'lucide-react';

interface ManualTestSectionProps {
  showTestSection: boolean;
  isExecuting: boolean;
  onExecuteTest: () => void;
  onCancel: () => void;
}

export const ManualTestSection = ({ 
  showTestSection, 
  isExecuting, 
  onExecuteTest, 
  onCancel 
}: ManualTestSectionProps) => {
  if (!showTestSection) return null;

  return (
    <div className="border-t pt-4 space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">Executar Reset Manual</h4>
        <p className="text-sm text-blue-800 mb-4">
          Teste a automação executando o reset manualmente agora.
        </p>
        
        <div className="flex gap-2">
          <Button
            onClick={onExecuteTest}
            disabled={isExecuting}
            variant="destructive"
          >
            {isExecuting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Executando...
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Executar Reset Agora
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isExecuting}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
