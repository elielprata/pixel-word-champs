
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailCheckState {
  checking: boolean;
  exists: boolean;
}

export const useEmailVerification = (email: string) => {
  const [emailCheck, setEmailCheck] = useState<EmailCheckState>({
    checking: false,
    exists: false
  });

  useEffect(() => {
    const checkEmailExists = async () => {
      if (!email || email.length < 5) {
        setEmailCheck({ checking: false, exists: false });
        return;
      }

      setEmailCheck({ checking: true, exists: false });
      
      try {
        // Verificar se email já existe (usando função que não requer auth)
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .limit(1);
        
        // Simular verificação - em produção seria uma função específica
        setEmailCheck({ checking: false, exists: false });
      } catch (error) {
        setEmailCheck({ checking: false, exists: false });
      }
    };

    const debounceTimer = setTimeout(checkEmailExists, 500);
    return () => clearTimeout(debounceTimer);
  }, [email]);

  return emailCheck;
};
