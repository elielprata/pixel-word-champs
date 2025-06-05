
import { apiClient } from './api';
import { 
  GameSession, 
  GameConfig, 
  WordFound, 
  Position, 
  ApiResponse 
} from '@/types';

class GameService {
  async createGameSession(config: GameConfig): Promise<ApiResponse<GameSession>> {
    return apiClient.post<GameSession>('/game/sessions', config);
  }

  async getGameSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    return apiClient.get<GameSession>(`/game/sessions/${sessionId}`);
  }

  async submitWord(
    sessionId: string, 
    word: string, 
    positions: Position[]
  ): Promise<ApiResponse<WordFound>> {
    return apiClient.post<WordFound>(`/game/sessions/${sessionId}/words`, {
      word,
      positions,
    });
  }

  async completeGameSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    return apiClient.put<GameSession>(`/game/sessions/${sessionId}/complete`);
  }

  async validateWord(word: string): Promise<ApiResponse<{ isValid: boolean; definition?: string }>> {
    return apiClient.post<{ isValid: boolean; definition?: string }>('/game/validate-word', {
      word,
    });
  }

  async getHint(sessionId: string): Promise<ApiResponse<{ word: string; positions: Position[] }>> {
    return apiClient.post<{ word: string; positions: Position[] }>(`/game/sessions/${sessionId}/hint`);
  }

  async getUserGameHistory(userId: string, limit = 10): Promise<ApiResponse<GameSession[]>> {
    return apiClient.get<GameSession[]>(`/game/users/${userId}/history?limit=${limit}`);
  }

  // Cálculo local de pontos (pode ser validado no backend)
  calculateWordPoints(word: string): number {
    const length = word.length;
    const pointsTable: Record<number, number> = {
      3: 1, 4: 2, 5: 3, 6: 5, 7: 8, 8: 13, 9: 21, 10: 34
    };
    
    return pointsTable[length] || Math.max(34, length * 5);
  }

  // Validação local de posições adjacentes
  validateAdjacentPositions(positions: Position[]): boolean {
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      
      const rowDiff = Math.abs(curr.row - prev.row);
      const colDiff = Math.abs(curr.col - prev.col);
      
      // Verifica se as posições são adjacentes (incluindo diagonais)
      if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
        return false;
      }
    }
    return true;
  }
}

export const gameService = new GameService();
