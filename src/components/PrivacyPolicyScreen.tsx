
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield } from 'lucide-react';
import { logger } from '@/utils/logger';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen = ({ onBack }: PrivacyPolicyScreenProps) => {
  logger.debug('PrivacyPolicyScreen carregado', undefined, 'PRIVACY_POLICY_SCREEN');

  const handleBack = () => {
    logger.debug('Voltando da política de privacidade', undefined, 'PRIVACY_POLICY_SCREEN');
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
            <h1 className="text-xl font-bold text-gray-800">Política de Privacidade</h1>
            <p className="text-sm text-gray-600">Como protegemos seus dados</p>
          </div>
        </div>

        <Card className="shadow-sm border-0">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Sua Privacidade é Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Última atualização: Janeiro 2025
            </p>

            <div className="space-y-4">
              <section>
                <h3 className="font-semibold text-gray-800 mb-2">1. Informações que Coletamos</h3>
                <p className="text-sm text-gray-600">
                  Coletamos apenas as informações necessárias para oferecer uma experiência de jogo personalizada:
                </p>
                <ul className="text-sm text-gray-600 ml-4 mt-2 space-y-1">
                  <li>• Nome de usuário e estatísticas de jogo</li>
                  <li>• Pontuações e rankings</li>
                  <li>• Preferências de configuração</li>
                  <li>• Dados de uso do aplicativo</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-2">2. Como Usamos suas Informações</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Personalizar sua experiência de jogo</li>
                  <li>• Manter rankings e estatísticas</li>
                  <li>• Melhorar nossos serviços</li>
                  <li>• Comunicar atualizações importantes</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-2">3. Compartilhamento de Dados</h3>
                <p className="text-sm text-gray-600">
                  Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros, 
                  exceto quando necessário para operar o serviço ou conforme exigido por lei.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-2">4. Segurança</h3>
                <p className="text-sm text-gray-600">
                  Implementamos medidas de segurança para proteger suas informações contra acesso, 
                  alteração, divulgação ou destruição não autorizados.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-gray-800 mb-2">5. Seus Direitos</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Acessar suas informações pessoais</li>
                  <li>• Corrigir dados incorretos</li>
                  <li>• Solicitar exclusão da conta</li>
                  <li>• Portabilidade de dados</li>
                </ul>
              </section>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                📧 Dúvidas sobre privacidade? Entre em contato: privacidade@letraarena.com
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
