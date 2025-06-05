
import { supabase } from '@/integrations/supabase/client';
import { 
  GameSession, 
  GameConfig, 
  WordFound, 
  Position, 
  ApiResponse 
} from '@/types';

class GameService {
  async createGameSession(config: GameConfig): Promise<ApiResponse<GameSession>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      // Gerar board básico (substituir por lógica real posteriormente)
      const board = this.generateMockBoard(config.boardSize || 10);

      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
          competition_id: config.level > 0 ? undefined : undefined, // Será definido quando implementarmos competições
          level: config.level,
          board: board,
          words_found: [],
          total_score: 0,
          time_elapsed: 0,
          is_completed: false
        })
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          challengeId: data.competition_id,
          level: data.level,
          board: data.board as string[][],
          wordsFound: this.parseWordsFound(data.words_found),
          totalScore: data.total_score,
          timeElapsed: data.time_elapsed,
          isCompleted: data.is_completed,
          startedAt: data.started_at,
          completedAt: data.completed_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao criar sessão de jogo'
      };
    }
  }

  async getGameSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          challengeId: data.competition_id,
          level: data.level,
          board: data.board as string[][],
          wordsFound: this.parseWordsFound(data.words_found),
          totalScore: data.total_score,
          timeElapsed: data.time_elapsed,
          isCompleted: data.is_completed,
          startedAt: data.started_at,
          completedAt: data.completed_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao buscar sessão de jogo'
      };
    }
  }

  async submitWord(
    sessionId: string, 
    word: string, 
    positions: Position[]
  ): Promise<ApiResponse<WordFound>> {
    try {
      const points = this.calculateWordPoints(word);

      const { data, error } = await supabase
        .from('words_found')
        .insert({
          session_id: sessionId,
          word: word.toUpperCase(),
          points,
          positions: positions as any
        })
        .select()
        .single();

      if (error) throw error;

      // Atualizar pontuação da sessão
      await this.updateSessionScore(sessionId, points);

      return {
        success: true,
        data: {
          word: data.word,
          points: data.points,
          positions: this.parsePositions(data.positions),
          foundAt: data.found_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao submeter palavra'
      };
    }
  }

  async completeGameSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        data: {
          id: data.id,
          userId: data.user_id,
          challengeId: data.competition_id,
          level: data.level,
          board: data.board as string[][],
          wordsFound: this.parseWordsFound(data.words_found),
          totalScore: data.total_score,
          timeElapsed: data.time_elapsed,
          isCompleted: data.is_completed,
          startedAt: data.started_at,
          completedAt: data.completed_at
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao completar sessão'
      };
    }
  }

  private async updateSessionScore(sessionId: string, additionalPoints: number): Promise<void> {
    // Buscar sessão atual e atualizar pontuação
    const { data: session } = await supabase
      .from('game_sessions')
      .select('total_score')
      .eq('id', sessionId)
      .single();

    if (session) {
      await supabase
        .from('game_sessions')
        .update({ total_score: session.total_score + additionalPoints })
        .eq('id', sessionId);
    }
  }

  private parseWordsFound(wordsFoundData: any): WordFound[] {
    if (!Array.isArray(wordsFoundData)) return [];
    
    return wordsFoundData.map((item: any) => ({
      word: item.word || '',
      points: item.points || 0,
      positions: this.parsePositions(item.positions),
      foundAt: item.foundAt || new Date().toISOString()
    }));
  }

  private parsePositions(positionsData: any): Position[] {
    if (!Array.isArray(positionsData)) return [];
    
    return (positionsData as unknown[]).map((pos: any) => ({
      row: pos?.row || 0,
      col: pos?.col || 0
    }));
  }

  calculateWordPoints(word: string): number {
    const length = word.length;
    const pointsTable: Record<number, number> = {
      3: 1, 4: 2, 5: 3, 6: 5, 7: 8, 8: 13, 9: 21, 10: 34
    };
    
    return pointsTable[length] || Math.max(34, length * 5);
  }

  validateAdjacentPositions(positions: Position[]): boolean {
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i - 1];
      const curr = positions[i];
      
      const rowDiff = Math.abs(curr.row - prev.row);
      const colDiff = Math.abs(curr.col - prev.col);
      
      if (rowDiff > 1 || colDiff > 1 || (rowDiff === 0 && colDiff === 0)) {
        return false;
      }
    }
    return true;
  }

  private generateMockBoard(size: number): string[][] {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const board: string[][] = [];
    
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
    
    return board;
  }
}

export const gameService = new GameService();
