
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmailCheckState {
  checking: boolean;
  available: boolean;
  exists: boolean;
}

export const useEmailVerification = (email: string) => {
  const [emailCheck, setEmailCheck] = useState<EmailCheckState>({
    checking: false,
    available: true,
    exists: false
  });

  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!email || email.length < 5 || !email.includes('@')) {
        setEmailCheck({ checking: false, available: true, exists: false });
        return;
      }

      setEmailCheck({ checking: true, available: true, exists: false });
      
      try {
        const { data, error } = await supabase.functions.invoke('check-user-availability', {
          body: { email }
        });

        if (error) throw error;

        setEmailCheck({ 
          checking: false, 
          available: data.email_available || false,
          exists: data.email_exists || false
        });
      } catch (error) {
        console.error('Erro ao verificar email:', error);
        setEmailCheck({ checking: false, available: true, exists: false });
      }
    };

    const debounceTimer = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [email]);

  return emailCheck;
};
