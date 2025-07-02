
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PhoneCheckState {
  checking: boolean;
  available: boolean;
  exists: boolean;
}

export const usePhoneVerification = (phone: string, currentUserPhone?: string) => {
  const [phoneCheck, setPhoneCheck] = useState<PhoneCheckState>({
    checking: false,
    available: true,
    exists: false
  });

  useEffect(() => {
    const checkPhoneAvailability = async () => {
      // Limpar formato do telefone para comparação
      const cleanPhone = phone.replace(/\D/g, '');
      const cleanCurrentPhone = currentUserPhone?.replace(/\D/g, '') || '';
      
      // Se não tem telefone ou é muito curto, não verificar
      if (!cleanPhone || cleanPhone.length < 10) {
        setPhoneCheck({ checking: false, available: true, exists: false });
        return;
      }

      // Se é o mesmo telefone do usuário atual, considerar disponível
      if (cleanPhone === cleanCurrentPhone) {
        setPhoneCheck({ checking: false, available: true, exists: false });
        return;
      }

      setPhoneCheck({ checking: true, available: true, exists: false });
      
      try {
        const { data, error } = await supabase.functions.invoke('check-user-availability', {
          body: { phone: cleanPhone }
        });

        if (error) throw error;

        setPhoneCheck({ 
          checking: false, 
          available: data.phone_available || false,
          exists: data.phone_exists || false
        });
        } catch (error) {
          // Erro silencioso em produção
          setPhoneCheck({ checking: false, available: true, exists: false });
      }
    };

    const debounceTimer = setTimeout(checkPhoneAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [phone, currentUserPhone]);

  return phoneCheck;
};
