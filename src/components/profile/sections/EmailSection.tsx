
import React from 'react';
import { Label } from "@/components/ui/label";

interface EmailSectionProps {
  email: string;
}

const EmailSection = ({ email }: EmailSectionProps) => {
  return (
    <div className="space-y-2">
      <Label>Email</Label>
      <div className="p-3 bg-gray-50 rounded-lg border">
        <span className="text-gray-900">{email}</span>
      </div>
      <p className="text-xs text-gray-500">O email não pode ser alterado</p>
    </div>
  );
};

export default EmailSection;
