
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="mr-3 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-bold text-white">Política de Privacidade</h1>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Política de Privacidade - Letra Arena</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-3">1. Informações que Coletamos</h3>
              <p className="text-gray-700">
                Coletamos informações pessoais como nome, email, dados bancários para premiações 
                e dados de gameplay para melhorar a experiência.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">2. Como Usamos suas Informações</h3>
              <p className="text-gray-700">
                Suas informações são usadas para gerenciar sua conta, processar premiações, 
                melhorar nossos serviços e enviar comunicações relevantes.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">3. Compartilhamento de Dados</h3>
              <p className="text-gray-700">
                Não vendemos ou compartilhamos seus dados pessoais com terceiros, exceto 
                quando necessário para processar pagamentos ou cumprir obrigações legais.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">4. Segurança</h3>
              <p className="text-gray-700">
                Implementamos medidas de segurança para proteger suas informações contra 
                acesso não autorizado, alteração ou divulgação.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">5. Cookies e Tecnologias Similares</h3>
              <p className="text-gray-700">
                Usamos cookies para melhorar sua experiência, manter você logado e 
                analisar o uso do aplicativo.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">6. Seus Direitos</h3>
              <p className="text-gray-700">
                Você tem direito a acessar, corrigir ou excluir suas informações pessoais. 
                Entre em contato conosco para exercer esses direitos.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">7. Retenção de Dados</h3>
              <p className="text-gray-700">
                Mantemos suas informações apenas pelo tempo necessário para fornecer 
                nossos serviços ou conforme exigido por lei.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">8. Alterações nesta Política</h3>
              <p className="text-gray-700">
                Podemos atualizar esta política periodicamente. Notificaremos sobre 
                mudanças significativas através do aplicativo.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-3">9. Contato</h3>
              <p className="text-gray-700">
                Para questões sobre privacidade, entre em contato através do suporte 
                dentro do aplicativo ou pelo email privacy@letraarena.com.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
