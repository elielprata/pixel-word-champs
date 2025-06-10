
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Medal, Award, Crown, Gift } from 'lucide-react';

const WeeklyCompetitionRanking = () => {
  const navigate = useNavigate();

  const weeklyWinners = [
    { pos: 1, name: "João Silva", score: 18750, prize: 50.00, paid: false },
    { pos: 2, name: "Maria Santos", score: 17890, prize: 30.00, paid: false },
    { pos: 3, name: "Pedro Costa", score: 17320, prize: 20.00, paid: false },
    { pos: 4, name: "Ana Lima", score: 16540, prize: 10.00, paid: true },
    { pos: 5, name: "Carlos Souza", score: 16180, prize: 10.00, paid: true },
  ];

  const getRankingIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2: return <Medal className="w-6 h-6 text-gray-400" />;
      case 3: return <Award className="w-6 h-6 text-orange-500" />;
      default: return <Crown className="w-6 h-6 text-purple-500" />;
    }
  };

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate('/')}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-800">
              Ranking Semanal
            </h1>
            <p className="text-purple-600">Competição encerrada • Semana 15-21 Jan</p>
          </div>
        </div>

        {/* Resumo da competição */}
        <div className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl text-white mb-8">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-3 rounded-xl">
                  <Gift className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Competição Finalizada</h2>
                  <p className="text-purple-100 text-sm">Prêmios sendo distribuídos</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="bg-white/10 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{formatCurrency(120)}</div>
                  <div className="text-xs text-purple-100">Total Premiado</div>
                </div>
                <div className="bg-white/10 rounded-lg p-3 text-center min-w-[100px]">
                  <div className="text-xl font-bold">{weeklyWinners.length}</div>
                  <div className="text-xs text-purple-100">Ganhadores</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pódio */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 mb-8">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-500" />
              Pódio da Semana
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {weeklyWinners.slice(0, 3).map((winner) => (
                <div key={winner.pos} className={`p-4 rounded-lg border-2 ${
                  winner.pos === 1 ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300' :
                  winner.pos === 2 ? 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-300' :
                  'bg-gradient-to-br from-orange-50 to-red-50 border-orange-300'
                }`}>
                  <div className="text-center">
                    <div className="flex justify-center mb-3">
                      {getRankingIcon(winner.pos)}
                    </div>
                    <h4 className="font-bold text-lg text-gray-900">{winner.name}</h4>
                    <p className="text-sm text-gray-600 mb-2">{winner.pos}º Lugar</p>
                    <div className="space-y-1">
                      <p className="font-bold text-purple-600">{winner.score.toLocaleString()} pts</p>
                      <p className="font-bold text-green-600">{formatCurrency(winner.prize)}</p>
                      <Badge variant={winner.paid ? "default" : "secondary"} className="text-xs">
                        {winner.paid ? 'Pago' : 'Processando'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Ranking completo */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold">Ranking Completo</h3>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {weeklyWinners.map((winner) => (
                <div key={winner.pos} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-sm">
                      {winner.pos <= 3 ? getRankingIcon(winner.pos) : (
                        <span className="font-bold text-gray-600">{winner.pos}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{winner.name}</p>
                      <p className="text-sm text-gray-600">{winner.pos}º lugar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-purple-600">{winner.score.toLocaleString()}</p>
                    <p className="text-sm font-medium text-green-600">{formatCurrency(winner.prize)}</p>
                    <Badge variant={winner.paid ? "default" : "secondary"} className="text-xs mt-1">
                      {winner.paid ? 'Pago' : 'Processando'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
          <p className="text-sm text-blue-800">
            <strong>Pagamentos:</strong> Os prêmios são processados até segunda-feira às 18h via PIX.
            Ganhadores são notificados por email com instruções para recebimento.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCompetitionRanking;
