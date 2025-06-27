
import React from 'react';
import { Button } from "@/components/ui/button";

interface WeeklyConfigModalActionsProps {
  onClose: () => void;
  isLoading: boolean;
  isActivating: boolean;
}

export const WeeklyConfigModalActions: React.FC<WeeklyConfigModalActionsProps> = ({
  onClose,
  isLoading,
  isActivating
}) => {
  return (
    <div className="flex justify-end">
      <Button 
        variant="outline" 
        onClick={onClose}
        disabled={isLoading || isActivating}
      >
        Fechar
      </Button>
    </div>
  );
};
