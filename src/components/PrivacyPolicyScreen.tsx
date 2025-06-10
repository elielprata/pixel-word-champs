
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyScreenProps {
  onBack: () => void;
}

const PrivacyPolicyScreen = ({ onBack }: PrivacyPolicyScreenProps) => {
  return (
    <div className="p-4 pb-20 bg-gradient-to-b from-purple-50 to-blue-50 min-h-screen">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <h1 className="text-2xl font-bold text-purple-800 ml-3">Política de Privacidade</h1>
      </div>

      <div className="bg-white rounded-lg shadow-md border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-500" />
            Sua Privacidade é Importante
          </h2>
        </div>
        <div className="p-4 space-y-4">
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
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyScreen;
