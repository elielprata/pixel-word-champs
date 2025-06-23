
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from 'lucide-react';

interface RegisterFormSubmitProps {
  isLoading: boolean;
  isFormDisabled: boolean;
  error: string;
}

export const RegisterFormSubmit = ({ isLoading, isFormDisabled, error }: RegisterFormSubmitProps) => {
  return (
    <>
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isFormDisabled}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Criar conta
      </Button>
    </>
  );
};
