
import React, { useEffect, useState } from 'react';
import { Gamepad2, Zap, Target, Trophy } from 'lucide-react';

interface GameifiedLoadingScreenProps {
  level: number;
  loadingStep: string;
  isResuming?: boolean;
}

const GameifiedLoadingScreen = ({ level, loadingStep, isResuming = false }: GameifiedLoadingScreenProps) => {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  const getLoadingIcon = () => {
    if (loadingStep.includes('Validando')) return <Target className="w-8 h-8" />;
    if (loadingStep.includes('Criando')) return <Gamepad2 className="w-8 h-8" />;
    if (loadingStep.includes('Continuando')) return <Trophy className="w-8 h-8" />;
    return <Zap className="w-8 h-8" />;
  };

  const getBackgroundGradient = () => {
    if (isResuming) {
      return 'bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900';
    }
    return 'bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900';
  };

  const getAccentColor = () => {
    if (isResuming) {
      return 'text-blue-400';
    }
    return 'text-green-400';
  };

  return (
    <div className={`min-h-screen ${getBackgroundGradient()} flex items-center justify-center p-4 relative overflow-hidden no-zoom`}>
      {/* Partículas de fundo animadas */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${getAccentColor()} rounded-full animate-pulse opacity-20`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto">
        {/* Ícone principal animado */}
        <div className="mb-8 relative">
          <div className={`w-20 h-20 mx-auto ${getAccentColor()} animate-bounce flex items-center justify-center rounded-full bg-white/10 backdrop-blur-sm border border-white/20`}>
            {getLoadingIcon()}
          </div>
          
          {/* Círculos concêntricos */}
          <div className="absolute inset-0 animate-ping">
            <div className={`w-20 h-20 mx-auto rounded-full border-2 ${isResuming ? 'border-blue-400' : 'border-green-400'} opacity-30`}></div>
          </div>
          <div className="absolute inset-0 animate-pulse" style={{ animationDelay: '0.5s' }}>
            <div className={`w-24 h-24 mx-auto rounded-full border ${isResuming ? 'border-blue-400' : 'border-green-400'} opacity-20 ml-[-8px] mt-[-8px]`}></div>
          </div>
        </div>

        {/* Título principal */}
        <h1 className="text-4xl font-bold text-white mb-2">
          {isResuming ? 'Retomando Desafio' : 'Preparando Desafio'}
        </h1>
        
        {/* Nível atual */}
        <div className={`inline-flex items-center px-4 py-2 rounded-full ${isResuming ? 'bg-blue-400/20 border-blue-400/30' : 'bg-green-400/20 border-green-400/30'} border mb-6`}>
          <Trophy className={`w-5 h-5 ${getAccentColor()} mr-2`} />
          <span className="text-white font-semibold">
            {isResuming ? `Continuando do Nível ${level}` : `Nível ${level}`}
          </span>
        </div>

        {/* Status de carregamento */}
        <div className="mb-8">
          <div className={`text-xl ${getAccentColor()} mb-4 font-medium flex items-center justify-center gap-2`}>
            <span>{loadingStep}</span>
            <span className="w-4 text-left">{dots}</span>
          </div>
          
          {/* Barra de progresso animada */}
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden backdrop-blur-sm">
            <div className={`h-full ${isResuming ? 'bg-gradient-to-r from-blue-400 to-purple-500' : 'bg-gradient-to-r from-green-400 to-blue-500'} animate-pulse`}
                 style={{ width: '60%', animation: 'pulse 2s ease-in-out infinite' }}></div>
          </div>
        </div>

        {/* Mensagem motivacional */}
        <p className="text-white/80 text-lg font-light">
          {isResuming 
            ? 'Você está voltando forte! Continue de onde parou e complete seu desafio.'
            : 'Prepare-se para encontrar palavras escondidas e conquistar pontos!'
          }
        </p>

        {/* Estatísticas (se retomando) */}
        {isResuming && (
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="text-blue-400 font-bold text-lg">{level - 1}</div>
              <div className="text-white/70 text-sm">Níveis Completos</div>
            </div>
            <div className="bg-white/10 rounded-lg p-3 backdrop-blur-sm border border-white/20">
              <div className="text-blue-400 font-bold text-lg">{20 - level}</div>
              <div className="text-white/70 text-sm">Níveis Restantes</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameifiedLoadingScreen;
