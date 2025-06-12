
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
import { competitionValidationService } from './competitionValidationService';
import { logger } from '@/utils/logger';

class GameService {
  async createGameSession(config: GameConfig): Promise<ApiResponse<GameSession>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        logger.warn('Usuário não autenticado ao criar sessão', undefined, 'GAME_SERVICE');
        throw new Error('Usuário não autenticado');
      }

      logger.info('Criando sessão de jogo', { userId: user.id, level: config.level }, 'GAME_SERVICE');

      const board = this.generateBoard(config.boardSize || 10);

      let sessionData: any = {
        user_id: user.id,
        level: config.level,
        board: board,
        words_found: [],
        total_score: 0,
        time_elapsed: 0,
        is_completed: false,
      };

      // CORREÇÃO PRINCIPAL: Não inserir competition_id diretamente se for custom_competition
      if (config.competitionId) {
        try {
          const competitionTable = await competitionValidationService.getCompetitionTable(config.competitionId);
          
          if (competitionTable === 'competitions') {
            // Apenas se for da tabela competitions, usar foreign key diretamente
            sessionData.competition_id = config.competitionId;
            logger.debug('Competição encontrada em competitions - usando foreign key', { competitionId: config.competitionId }, 'GAME_SERVICE');
          } else if (competitionTable === 'custom_competitions') {
            // Para custom_competitions, armazenar apenas no metadata do board
            logger.debug('Competição encontrada em custom_competitions - armazenando em metadata', { competitionId: config.competitionId }, 'GAME_SERVICE');
            sessionData.board = { 
              ...board, 
              _custom_competition_id: config.competitionId 
            };
            // NÃO definir competition_id para evitar foreign key constraint
          } else {
            logger.warn('Competição não encontrada, criando sessão sem vinculação', { competitionId: config.competitionId }, 'GAME_SERVICE');
          }
        } catch (validationError) {
          logger.warn('Erro na validação da competição, criando sessão sem vinculação', { error: validationError, competitionId: config.competitionId }, 'GAME_SERVICE');
          // Continuar criando a sessão mesmo se a validação da competição falhar
        }
      }

      const { data, error } = await supabase
        .from('game_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao inserir sessão no banco', { error: error.message }, 'GAME_SERVICE');
        throw error;
      }

      logger.info('Sessão criada com sucesso', { sessionId: data.id }, 'GAME_SERVICE');

      const session = this.mapGameSession(data);
      
      // Tentar registrar participação automaticamente, mas não falhar se der erro
      if (config.competitionId) {
        try {
          await dailyCompetitionService.joinCompetitionAutomatically(session.id);
          logger.info('Participação automática registrada', { sessionId: session.id }, 'GAME_SERVICE');
        } catch (participationError) {
          logger.warn('Erro ao registrar participação automática - continuando', { error: participationError, sessionId: session.id }, 'GAME_SERVICE');
          // Não falhar a criação da sessão por causa disso
        }
      }
      
      return createSuccessResponse(session);
    } catch (error) {
      logger.error('Erro ao criar sessão de jogo', { error }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GAME_CREATE_SESSION'));
    }
  }

  async getGameSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    try {
      logger.debug('Buscando sessão de jogo', { sessionId }, 'GAME_SERVICE');

      const { data, error } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (error) {
        logger.error('Erro ao buscar sessão no banco', { error: error.message, sessionId }, 'GAME_SERVICE');
        throw error;
      }

      if (!data) {
        logger.warn('Sessão não encontrada', { sessionId }, 'GAME_SERVICE');
        throw new Error('Sessão não encontrada');
      }

      logger.debug('Sessão encontrada com sucesso', { sessionId }, 'GAME_SERVICE');
      const session = this.mapGameSession(data);
      return createSuccessResponse(session);
    } catch (error) {
      logger.error('Erro ao obter sessão de jogo', { error, sessionId }, 'GAME_SERVICE');
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
      logger.info('Submetendo palavra', { sessionId, word, points }, 'GAME_SERVICE');
      
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

      if (error) {
        logger.error('Erro ao inserir palavra encontrada', { error: error.message, sessionId, word }, 'GAME_SERVICE');
        throw error;
      }

      await this.updateSessionScore(sessionId, points);

      const wordFound: WordFound = {
        word: data.word,
        points: data.points,
        positions: this.parsePositions(data.positions),
        foundAt: data.found_at
      };

      logger.info('Palavra submetida com sucesso', { sessionId, word, points }, 'GAME_SERVICE');
      return createSuccessResponse(wordFound);
    } catch (error) {
      logger.error('Erro ao submeter palavra', { error, sessionId, word }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GAME_SUBMIT_WORD'));
    }
  }

  async completeGameSession(sessionId: string): Promise<ApiResponse<GameSession>> {
    try {
      logger.info('Completando sessão de jogo', { sessionId }, 'GAME_SERVICE');

      const { data, error } = await supabase
        .from('game_sessions')
        .update({
          is_completed: true,
          completed_at: new Date().toISOString()
        })
        .eq('id', sessionId)
        .select()
        .single();

      if (error) {
        logger.error('Erro ao completar sessão no banco', { error: error.message, sessionId }, 'GAME_SERVICE');
        throw error;
      }

      const session = this.mapGameSession(data);
      
      // Tentar atualizar pontuação na competição, mas não falhar se der erro
      if (session.total_score > 0) {
        try {
          await dailyCompetitionService.updateParticipationScore(sessionId, session.total_score);
          logger.info('Pontuação final atualizada na competição', { sessionId, totalScore: session.total_score }, 'GAME_SERVICE');
        } catch (updateError) {
          logger.warn('Erro ao atualizar pontuação na competição - continuando', { error: updateError, sessionId }, 'GAME_SERVICE');
          // Não falhar a conclusão da sessão por causa disso
        }
      }
      
      logger.info('Sessão completada com sucesso', { sessionId, totalScore: session.total_score }, 'GAME_SERVICE');
      return createSuccessResponse(session);
    } catch (error) {
      logger.error('Erro ao completar sessão de jogo', { error, sessionId }, 'GAME_SERVICE');
      return createErrorResponse(handleServiceError(error, 'GAME_COMPLETE_SESSION'));
    }
  }

  private async updateSessionScore(sessionId: string, additionalPoints: number): Promise<void> {
    try {
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

        // Tentar atualizar participação, mas não falhar se der erro
        try {
          await dailyCompetitionService.updateParticipationScore(sessionId, newTotalScore);
        } catch (error) {
          logger.warn('Erro ao atualizar pontuação na competição - continuando', { error, sessionId }, 'GAME_SERVICE');
          // Não falhar a atualização da sessão por causa disso
        }
      }
    } catch (error) {
      logger.warn('Erro ao atualizar pontuação da sessão - continuando', { error, sessionId }, 'GAME_SERVICE');
      // Não falhar por causa de erro na atualização de pontuação
    }
  }

  private mapGameSession(data: any): GameSession {
    let customCompetitionId = null;
    if (data.board && typeof data.board === 'object' && data.board._custom_competition_id) {
      customCompetitionId = data.board._custom_competition_id;
      // Manter a metadata no board para referência futura
    }

    return {
      id: data.id,
      user_id: data.user_id,
      competition_id: data.competition_id || customCompetitionId,
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
    logger.debug('Gerando tabuleiro', { size }, 'GAME_SERVICE');
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const board: string[][] = [];
    
    for (let i = 0; i < size; i++) {
      board[i] = [];
      for (let j = 0; j < size; j++) {
        board[i][j] = letters[Math.floor(Math.random() * letters.length)];
      }
    }
    
    logger.debug('Tabuleiro gerado com sucesso', { size }, 'GAME_SERVICE');
    return board;
  }
}

export const gameService = new GameService();
