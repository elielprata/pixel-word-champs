
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/utils/logger';
import { AllUsersData } from '@/hooks/useUsersQuery';

interface UserExportData {
  id: string;
  username: string;
  email: string;
  totalScore: number;
  gamesPlayed: number;
  isBanned: boolean;
  createdAt: string;
  roles: string;
  bannedAt?: string;
  banReason?: string;
}

export const userExportService = {
  async exportUsersToCSV(users: AllUsersData[]): Promise<void> {
    try {
      logger.info('Iniciando exportação de dados dos usuários', { count: users.length }, 'USER_EXPORT_SERVICE');
      
      const exportData: UserExportData[] = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        totalScore: user.total_score,
        gamesPlayed: user.games_played,
        isBanned: user.is_banned,
        createdAt: user.created_at,
        roles: user.roles.join(', '),
        bannedAt: user.banned_at || '',
        banReason: user.ban_reason || ''
      }));

      // Gerar CSV
      const headers = [
        'ID', 'Nome de Usuário', 'Email', 'Pontuação Total', 'Jogos', 
        'Banido', 'Data de Criação', 'Funções', 'Data do Banimento', 'Motivo do Banimento'
      ];
      
      const csvContent = [
        headers.join(','),
        ...exportData.map(user => [
          user.id,
          `"${user.username.replace(/"/g, '""')}"`,
          `"${user.email.replace(/"/g, '""')}"`,
          user.totalScore,
          user.gamesPlayed,
          user.isBanned ? 'Sim' : 'Não',
          new Date(user.createdAt).toLocaleDateString('pt-BR'),
          `"${user.roles.replace(/"/g, '""')}"`,
          user.bannedAt ? new Date(user.bannedAt).toLocaleDateString('pt-BR') : '',
          `"${user.banReason.replace(/"/g, '""')}"`
        ].join(','))
      ].join('\n');

      // Baixar arquivo
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `usuarios_${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info('Exportação de usuários concluída com sucesso', { filename }, 'USER_EXPORT_SERVICE');
    } catch (error) {
      logger.error('Erro na exportação de usuários', { error }, 'USER_EXPORT_SERVICE');
      throw error;
    }
  },

  async exportUserStats(): Promise<void> {
    try {
      logger.info('Iniciando exportação de estatísticas dos usuários', undefined, 'USER_EXPORT_SERVICE');
      
      // Buscar estatísticas gerais
      const { data: stats, error } = await supabase
        .rpc('get_users_with_real_emails');

      if (error) throw error;

      const statsData = stats.map((user: any) => ({
        username: user.username || 'Usuário',
        totalScore: user.total_score || 0,
        gamesPlayed: user.games_played || 0,
        bestDailyPosition: user.best_daily_position || 'N/A',
        bestWeeklyPosition: user.best_weekly_position || 'N/A',
        createdAt: new Date(user.created_at).toLocaleDateString('pt-BR')
      }));

      // Gerar CSV de estatísticas
      const headers = [
        'Usuário', 'Pontuação Total', 'Jogos Realizados', 
        'Melhor Posição Diária', 'Melhor Posição Semanal', 'Data de Cadastro'
      ];
      
      const csvContent = [
        headers.join(','),
        ...statsData.map(stat => [
          `"${stat.username.replace(/"/g, '""')}"`,
          stat.totalScore,
          stat.gamesPlayed,
          stat.bestDailyPosition,
          stat.bestWeeklyPosition,
          stat.createdAt
        ].join(','))
      ].join('\n');

      // Baixar arquivo
      const BOM = '\uFEFF';
      const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      const dateStr = new Date().toISOString().split('T')[0];
      const filename = `estatisticas_usuarios_${dateStr}.csv`;
      
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info('Exportação de estatísticas concluída com sucesso', { filename }, 'USER_EXPORT_SERVICE');
    } catch (error) {
      logger.error('Erro na exportação de estatísticas', { error }, 'USER_EXPORT_SERVICE');
      throw error;
    }
  }
};
