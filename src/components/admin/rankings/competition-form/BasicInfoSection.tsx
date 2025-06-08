
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

interface BasicInfoSectionProps {
  title: string;
  description: string;
  onTitleChange: (title: string) => void;
  onDescriptionChange: (description: string) => void;
}

export const BasicInfoSection = ({ 
  title, 
  description, 
  onTitleChange, 
  onDescriptionChange 
}: BasicInfoSectionProps) => {
  return (
    <>
      {/* Título */}
      <div className="space-y-1">
        <Label htmlFor="title" className="text-sm">Título da Competição</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Ex: Torneio de Palavras Semanal"
          className="h-8"
          required
        />
      </div>

      {/* Descrição */}
      <div className="space-y-1">
        <Label htmlFor="description" className="text-sm">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Descreva as regras e objetivos da competição..."
          rows={2}
          className="text-sm"
        />
      </div>
    </>
  );
};
