
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone } from 'lucide-react';

interface PhoneSectionProps {
  phone: string;
  editPhone: string;
  isEditing: boolean;
  onPhoneChange: (phone: string) => void;
}

const PhoneSection = ({ phone, editPhone, isEditing, onPhoneChange }: PhoneSectionProps) => {
  const formatPhone = (value: string) => {
    // Remove todos os caracteres não numéricos
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara (XX) XXXXX-XXXX
    if (cleaned.length <= 11) {
      const match = cleaned.match(/^(\d{0,2})(\d{0,5})(\d{0,4})$/);
      if (match) {
        let formatted = '';
        if (match[1]) formatted += `(${match[1]}`;
        if (match[2]) formatted += `) ${match[2]}`;
        if (match[3]) formatted += `-${match[3]}`;
        return formatted;
      }
    }
    return value;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    onPhoneChange(formatted);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        <Phone className="w-4 h-4" />
        Telefone
      </Label>
      
      {isEditing ? (
        <Input
          type="tel"
          value={editPhone}
          onChange={handlePhoneChange}
          placeholder="(11) 99999-9999"
          className="w-full"
          maxLength={15}
        />
      ) : (
        <div className="min-h-[40px] flex items-center px-3 py-2 bg-gray-50 border border-gray-200 rounded-md">
          <span className="text-gray-800">
            {phone || 'Não informado'}
          </span>
        </div>
      )}
    </div>
  );
};

export default PhoneSection;
