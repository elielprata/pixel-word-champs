
import { apiClient } from './api';
import { ApiResponse } from '@/types';

export interface ChallengeRanking {
  challengeId: number;
  rankings: {
    position: number;
    playerName: string;
    score: number;
    completionTime: number;
    isCurrentUser?: boolean;
  }[];
  userPosition?: number;
  totalParticipants: number;
  lastUpdated: string;
}

class ChallengeRankingService {
  async getChallengeRanking(challengeId: number): Promise<ApiResponse<ChallengeRanking>> {
    return apiClient.get<ChallengeRanking>(`/challenges/${challengeId}/ranking`);
  }

  async updateUserScore(challengeId: number, score: number): Promise<ApiResponse<{ newPosition: number }>> {
    return apiClient.post<{ newPosition: number }>(`/challenges/${challengeId}/score`, { score });
  }

  // Dados mock para desenvolvimento
  getMockRanking(challengeId: number): ChallengeRanking {
    const baseRankings = [
      { position: 1, playerName: "Maria Santos", score: 2840, completionTime: 145 },
      { position: 2, playerName: "João Silva", score: 2650, completionTime: 160 },
      { position: 3, playerName: "Pedro Costa", score: 2420, completionTime: 175 },
      { position: 4, playerName: "Ana Oliveira", score: 2380, completionTime: 180 },
      { position: 5, playerName: "Carlos Lima", score: 2320, completionTime: 185 },
      { position: 6, playerName: "Julia Fernandes", score: 2280, completionTime: 190 },
      { position: 7, playerName: "Roberto Alves", score: 2240, completionTime: 195 },
      { position: 8, playerName: "Camila Rodrigues", score: 2200, completionTime: 200 },
      { position: 9, playerName: "Lucas Martins", score: 2160, completionTime: 205 },
      { position: 10, playerName: "Beatriz Souza", score: 2120, completionTime: 210 },
    ];

    // Simular variação por desafio
    const rankings = baseRankings.map(player => ({
      ...player,
      score: player.score + (challengeId * 100) - 50,
      completionTime: player.completionTime + (challengeId * 5)
    }));

    return {
      challengeId,
      rankings,
      userPosition: 15,
      totalParticipants: 1247 + (challengeId * 50),
      lastUpdated: new Date().toISOString()
    };
  }
}

export const challengeRankingService = new ChallengeRankingService();
