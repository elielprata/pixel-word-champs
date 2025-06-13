import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';

export interface CompetitionValidation {
  success: boolean;
  competition?: any;
  error?: string;
}

export interface JoinValidation {
  canJoin: boolean;
  reason: string;
}

class CompetitionValidationService {
  async validateCompetition(competitionId: string): Promise<CompetitionValidation> {
    try {
      logger.debug('Validando competição', { competitionId }, 'COMPETITION_VALIDATION_SERVICE');

      const { data: competition, error } = await supabase
        .from('custom_competitions')
        .select('*')
        .eq('id', competitionId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.warn('Competição não encontrada', { competitionId }, 'COMPETITION_VALIDATION_SERVICE');
          return {
            success: false,
            error: 'Competição não encontrada'
          };
        }
        logger.error('Erro ao buscar competição para validação', { 
          competitionId, 
          error 
        }, 'COMPETITION_VALIDATION_SERVICE');
        throw error;
      }

      // Verificar se está ativa
      if (competition.status !== 'active') {
        logger.warn('Competição não está ativa', { 
          competitionId, 
          status: competition.status 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return {
          success: false,
          error: `Competição não está ativa (status: ${competition.status})`
        };
      }

      // Verificar datas
      const now = new Date();
      const startDate = new Date(competition.start_date);
      const endDate = new Date(competition.end_date);

      if (now < startDate) {
        logger.warn('Competição ainda não começou', { 
          competitionId, 
          startDate, 
          currentTime: now 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return {
          success: false,
          error: 'Competição ainda não começou'
        };
      }

      if (now > endDate) {
        logger.warn('Competição já terminou', { 
          competitionId, 
          endDate, 
          currentTime: now 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return {
          success: false,
          error: 'Competição já terminou'
        };
      }

      // Verificar limite de participantes
      if (competition.max_participants) {
        const { count, error: countError } = await supabase
          .from('competition_participations')
          .select('*', { count: 'exact', head: true })
          .eq('competition_id', competitionId);

        if (countError) {
          logger.error('Erro ao verificar número de participantes', { 
            competitionId, 
            error: countError 
          }, 'COMPETITION_VALIDATION_SERVICE');
          throw countError;
        }

        if ((count || 0) >= competition.max_participants) {
          logger.warn('Competição atingiu limite de participantes', { 
            competitionId, 
            currentCount: count,
            maxParticipants: competition.max_participants 
          }, 'COMPETITION_VALIDATION_SERVICE');
          return {
            success: false,
            error: 'Competição atingiu o limite de participantes'
          };
        }
      }

      logger.debug('Competição validada com sucesso', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');

      return {
        success: true,
        competition
      };
    } catch (error) {
      logger.error('Erro crítico ao validar competição', { 
        competitionId, 
        error 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return {
        success: false,
        error: 'Erro interno na validação'
      };
    }
  }

  async getCompetitionTable(competitionId: string): Promise<string | null> {
    try {
      logger.debug('Identificando tabela da competição', { competitionId }, 'COMPETITION_VALIDATION_SERVICE');

      // Verificar se existe na tabela custom_competitions
      const { data: customCompetition, error: customError } = await supabase
        .from('custom_competitions')
        .select('id')
        .eq('id', competitionId)
        .single();

      if (!customError && customCompetition) {
        logger.debug('Competição encontrada na tabela custom_competitions', { 
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return 'custom_competitions';
      }

      // Se chegou aqui, a competição não foi encontrada
      logger.warn('Competição não encontrada em nenhuma tabela', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return null;
    } catch (error) {
      logger.error('Erro crítico ao identificar tabela da competição', { 
        competitionId, 
        error 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return null;
    }
  }

  async isUserParticipating(competitionId: string): Promise<boolean> {
    try {
      logger.debug('Verificando se usuário está participando da competição', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');

      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        logger.warn('Verificação de participação sem usuário autenticado', { 
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return false;
      }

      const { data: participation, error } = await supabase
        .from('competition_participations')
        .select('id')
        .eq('competition_id', competitionId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          logger.debug('Usuário não está participando da competição', { 
            competitionId, 
            userId: user.id 
          }, 'COMPETITION_VALIDATION_SERVICE');
          return false;
        }
        logger.error('Erro ao verificar participação do usuário', { 
          competitionId, 
          userId: user.id, 
          error 
        }, 'COMPETITION_VALIDATION_SERVICE');
        throw error;
      }

      logger.debug('Usuário está participando da competição', { 
        competitionId, 
        userId: user.id 
      }, 'COMPETITION_VALIDATION_SERVICE');

      return true;
    } catch (error) {
      logger.error('Erro crítico ao verificar participação do usuário', { 
        competitionId, 
        error 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return false;
    }
  }

  async canJoinCompetition(competitionId: string): Promise<JoinValidation> {
    try {
      logger.debug('Verificando se pode participar da competição', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');

      // Validar a competição
      const competitionValidation = await this.validateCompetition(competitionId);
      
      if (!competitionValidation.success) {
        return {
          canJoin: false,
          reason: competitionValidation.error || 'Competição inválida'
        };
      }

      // Verificar se já está participando
      const isParticipating = await this.isUserParticipating(competitionId);
      
      if (isParticipating) {
        logger.debug('Usuário já está participando da competição', { 
          competitionId 
        }, 'COMPETITION_VALIDATION_SERVICE');
        return {
          canJoin: false,
          reason: 'Usuário já está participando'
        };
      }

      logger.debug('Usuário pode participar da competição', { 
        competitionId 
      }, 'COMPETITION_VALIDATION_SERVICE');

      return {
        canJoin: true,
        reason: 'Pode participar'
      };
    } catch (error) {
      logger.error('Erro crítico ao verificar se pode participar', { 
        competitionId, 
        error 
      }, 'COMPETITION_VALIDATION_SERVICE');
      return {
        canJoin: false,
        reason: 'Erro interno na validação'
      };
    }
  }
}

export const competitionValidationService = new CompetitionValidationService();
