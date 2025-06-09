
import { supabase } from '@/integrations/supabase/client';
import { 
  GameSession, 
  GameConfig, 
  WordFound, 
  Position, 
  ApiResponse 
} from '@/types';
import { createSuccessResponse, createErrorResponse, handleServiceError } from '@/utils/apiHelpers';
import { dailyCompetitionService } from './dailyCompetitionService';

class GameService {
  async createGameSession(config: GameConfig): Promise<ApiResponse<GameSession>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const board = this.generateBoard(config.boardSize || 10);

      const { data, error } = await supabase
        .from('game_sessions')
        .insert({
          user_id: user.id,
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

      const session = this.mapGameSession(data);
      
      // Participação automática em competições diárias
      await dailyCompetitionService.joinCompetitionAutomatically(session.id);
      
      return createSuccessResponse(session);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'GAME_CREATE_SESSION'));
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

      const session = this.mapGameSession(data);
      return createSuccessResponse(session);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'GAME_GET_SESSION'));
    }
  }

  async submitWord(
    sessionId: string, 
    word: string, 
    positions: Position[],
    points: number
  ): Promise<ApiResponse<WordFound>> {
    try {
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

      await this.updateSessionScore(sessionId, points);

      const wordFound: WordFound = {
        word: data.word,
        points: data.points,
        positions: this.parsePositions(data.positions),
        foundAt: data.found_at
      };

      return createSuccessResponse(wordFound);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'GAME_SUBMIT_WORD'));
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

      const session = this.mapGameSession(data);
      
      // Atualizar pontuação final na competição diária
      if (session.total_score > 0) {
        await dailyCompetitionService.updateParticipationScore(sessionId, session.total_score);
      }
      
      return createSuccessResponse(session);
    } catch (error) {
      return createErrorResponse(handleServiceError(error, 'GAME_COMPLETE_SESSION'));
    }
  }

  private async updateSessionScore(sessionId: string, additionalPoints: number): Promise<void> {
    const { data: session } = await supabase
      .from('game_sessions')
      .select('total_score')
      .eq('id', sessionId)
      .single();

    if (session) {
      const newTotalScore = session.total_score + additionalPoints;
      
      await supabase
        .from('game_sessions')
        .update({ total_score: newTotalScore })
        .eq('id', sessionId);

      // Atualizar pontuação na competição diária em tempo real
      await dailyCompetitionService.updateParticipationScore(sessionId, newTotalScore);
    }
  }

  private mapGameSession(data: any): GameSession {
    return {
      id: data.id,
      user_id: data.user_id,
      competition_id: data.competition_id,
      level: data.level,
      board: data.board as string[][],
      words_found: this.parseWordsFound(data.words_found),
      total_score: data.total_score,
      time_elapsed: data.time_elapsed,
      is_completed: data.is_completed,
      started_at: data.started_at,
      completed_at: data.completed_at
    };
  }

  private parseWordsFound(wordsFoundData: any): string[] {
    if (!Array.isArray(wordsFoundData)) return [];
    return wordsFoundData;
  }

  private parsePositions(positionsData: any): Position[] {
    if (!Array.isArray(positionsData)) return [];
    return (positionsData as unknown[]).map((pos: any) => ({
      row: pos?.row || 0,
      col: pos?.col || 0
    }));
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

  private generateBoard(size: number): string[][] {
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
