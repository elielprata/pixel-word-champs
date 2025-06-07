
import { useChallengeProgress } from './useChallengeProgress';

export const useLevelProgression = (challengeId: number) => {
  const { updateProgress } = useChallengeProgress();

  const saveLevelProgress = async (level: number, score: number) => {
    console.log(`Salvando progresso do nível ${level} com ${score} pontos para o desafio ${challengeId}`);
    try {
      await updateProgress(challengeId, score, level + 1);
      console.log('Progresso salvo com sucesso no banco de dados');
    } catch (error) {
      console.error('Erro ao salvar progresso:', error);
    }
  };

  return {
    saveLevelProgress
  };
};
