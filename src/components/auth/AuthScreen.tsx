
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import SocialLogin from './SocialLogin';
import { Gamepad2, Trophy, Users, ArrowLeft } from 'lucide-react';

const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState('auth');

  const renderAuthContent = () => (
    <>
      {/* Logo e Título */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <div className="p-3 bg-white rounded-full shadow-lg">
            <Gamepad2 className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">Letra Arena</h1>
        <p className="text-purple-200">Encontre palavras, ganhe prêmios!</p>
      </div>

      {/* Features Cards */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center">
          <div className="p-3 bg-white/10 rounded-lg mb-2">
            <Gamepad2 className="w-6 h-6 text-white mx-auto" />
          </div>
          <p className="text-white text-xs">Desafios Diários</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white/10 rounded-lg mb-2">
            <Trophy className="w-6 h-6 text-white mx-auto" />
          </div>
          <p className="text-white text-xs">Prêmios Reais</p>
        </div>
        <div className="text-center">
          <div className="p-3 bg-white/10 rounded-lg mb-2">
            <Users className="w-6 h-6 text-white mx-auto" />
          </div>
          <p className="text-white text-xs">Competições</p>
        </div>
      </div>

      {/* Auth Card */}
      <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl text-center">Bem-vindo!</CardTitle>
          <CardDescription className="text-center">
            Entre na sua conta ou crie uma nova para começar
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Cadastrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="space-y-4">
              <LoginForm />
            </TabsContent>
            
            <TabsContent value="register" className="space-y-4">
              <RegisterForm />
            </TabsContent>
          </Tabs>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">Ou continue com</span>
            </div>
          </div>

          {/* Social Login */}
          <SocialLogin />
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center mt-6">
        <p className="text-purple-200 text-sm">
          Ao continuar, você concorda com nossos{' '}
          <button 
            onClick={() => setActiveTab('terms')} 
            className="underline hover:text-white"
          >
            Termos de Uso
          </button>
          {' '}e{' '}
          <button 
            onClick={() => setActiveTab('privacy')} 
            className="underline hover:text-white"
          >
            Política de Privacidade
          </button>
        </p>
      </div>
    </>
  );

  const renderTermsContent = () => (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab('auth')}
            className="mr-3 text-purple-600 hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl">Termos de Uso</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-h-96 overflow-y-auto">
        <section>
          <h3 className="text-lg font-semibold mb-3">1. Aceitação dos Termos</h3>
          <p className="text-gray-700">
            Ao usar o Letra Arena, você concorda com estes termos de uso. Se não concordar, 
            não utilize nossos serviços.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">2. Descrição do Serviço</h3>
          <p className="text-gray-700">
            O Letra Arena é um jogo de palavras onde os usuários participam de desafios 
            diários e competições com premiações reais.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">3. Elegibilidade e Registro</h3>
          <p className="text-gray-700">
            Para participar, você deve ter pelo menos 18 anos e fornecer informações 
            verdadeiras durante o registro.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">4. Regras do Jogo</h3>
          <p className="text-gray-700">
            Os usuários devem jogar de forma justa, sem usar ferramentas automatizadas 
            ou trapacear. Violações podem resultar em banimento.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">5. Premiações</h3>
          <p className="text-gray-700">
            As premiações são distribuídas semanalmente via PIX para os vencedores. 
            É necessário fornecer dados bancários válidos.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">6. Propriedade Intelectual</h3>
          <p className="text-gray-700">
            Todo o conteúdo do Letra Arena é protegido por direitos autorais e 
            não pode ser reproduzido sem autorização.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">7. Modificações</h3>
          <p className="text-gray-700">
            Reservamos o direito de modificar estes termos a qualquer momento. 
            Usuários serão notificados sobre mudanças importantes.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold mb-3">8. Contato</h3>
          <p className="text-gray-700">
            Para dúvidas sobre estes termos, entre em contato através do suporte 
            dentro do aplicativo.
          </p>
        </section>
      </CardContent>
    </Card>
  );

  const renderPrivacyContent = () => (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center mb-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setActiveTab('auth')}
            className="mr-3 text-purple-600 hover:bg-purple-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <CardTitle className="text-2xl">Política de Privacidade</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 max-h-96 overflow-y-auto">
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
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {activeTab === 'auth' && renderAuthContent()}
        {activeTab === 'terms' && renderTermsContent()}
        {activeTab === 'privacy' && renderPrivacyContent()}
      </div>
    </div>
  );
};

export default AuthScreen;
