
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from 'lucide-react';

interface LanguageSelectionScreenProps {
  onBack: () => void;
}

const LanguageSelectionScreen = ({ onBack }: LanguageSelectionScreenProps) => {
  const [selectedLanguage, setSelectedLanguage] = useState('pt-BR');

  const languages = [
    { code: 'pt-BR', name: 'Português (Brasil)', flag: '🇧🇷' },
    { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
    { code: 'es-ES', name: 'Español', flag: '🇪🇸' },
  ];

  const handleSave = () => {
    // Aqui seria implementada a lógica para salvar o idioma
    console.log('Idioma selecionado:', selectedLanguage);
    onBack();
  };

  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Selecionar Idioma</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Idiomas Disponíveis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {languages.map((language) => (
            <div
              key={language.code}
              className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedLanguage === language.code
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-white border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedLanguage(language.code)}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </div>
              {selectedLanguage === language.code && (
                <Check className="w-5 h-5 text-purple-600" />
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">
        Salvar Alterações
      </Button>
    </div>
  );
};

export default LanguageSelectionScreen;
