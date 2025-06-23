
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Trophy, Users, DollarSign } from 'lucide-react';

export const TutorialInfo = () => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Como Funciona o Letra Arena
        </h3>
        <p className="text-sm text-gray-600">
          Descubra tudo sobre nosso sistema de jogos e prêmios
        </p>
      </div>

      <div className="grid gap-4">
        {/* Verificação de Email */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Mail className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">
                  Verificação Obrigatória
                </h4>
                <p className="text-sm text-blue-700">
                  Você só pode jogar após confirmar seu email. Verifique sua caixa de entrada e spam!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Competições Diárias */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full">
                <Trophy className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">
                  Competições Diárias
                </h4>
                <p className="text-sm text-amber-700">
                  Participe de desafios todos os dias e concorra a prêmios semanais em dinheiro!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Convites */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-green-900 mb-1">
                  Indique Amigos
                </h4>
                <p className="text-sm text-green-700">
                  Convide amigos e ganhe 50 XP para cada pessoa que se cadastrar e jogar!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Prêmios PIX */}
        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-purple-900 mb-1">
                  Prêmios em PIX
                </h4>
                <p className="text-sm text-purple-700">
                  Ganhe dinheiro real direto na sua conta! Prêmios semanais pagos via PIX.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
