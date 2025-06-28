
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check } from 'lucide-react';
import { logger } from '@/utils/logger';

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

  logger.debug('LanguageSelectionScreen carregado', { selectedLanguage }, 'LANGUAGE_SELECTION');

  const handleLanguageSelect = (languageCode: string) => {
    logger.info('Idioma selecionado', { from: selectedLanguage, to: languageCode }, 'LANGUAGE_SELECTION');
    setSelectedLanguage(languageCode);
  };

  const handleSave = () => {
    // Aqui seria implementada a lógica para salvar o idioma
    logger.info('Idioma salvo', { selectedLanguage }, 'LANGUAGE_SELECTION');
    onBack();
  };

  const handleBack = () => {
    logger.debug('Voltando da seleção de idioma', undefined, 'LANGUAGE_SELECTION');
    onBack();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-3 pb-20">
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Selecionar Idioma</h1>
            <p className="text-sm text-gray-600">Escolha seu idioma preferido</p>
          </div>
        </div>

        <Card className="shadow-sm border-0">
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
                onClick={() => handleLanguageSelect(language.code)}
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
    </div>
  );
};

export default LanguageSelectionScreen;
