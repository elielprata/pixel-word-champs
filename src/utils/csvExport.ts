
import { Winner } from '@/types/winner';
import { AllUsersData } from '@/hooks/useUsersQuery';

export const exportToCSV = (winners: Winner[], filename: string): void => {
  // Gerar nome do arquivo mais limpo
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${cleanFilename}_${dateStr}.csv`;

  const headers = ['Posição', 'Usuário', 'Chave PIX', 'Nome do Titular', 'Data Consolidada', 'Prêmio', 'Status Pagamento'];
  const csvContent = [
    headers.join(','),
    ...winners.map(winner => [
      winner.position,
      `"${winner.username.replace(/"/g, '""')}"`, // Escapar aspas duplas
      `"${winner.pixKey.replace(/"/g, '""')}"`,
      `"${winner.holderName.replace(/"/g, '""')}"`,
      winner.consolidatedDate,
      `R$ ${winner.prize.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      winner.paymentStatus === 'paid' ? 'Pago' : winner.paymentStatus === 'cancelled' ? 'Cancelado' : 'Pendente'
    ].join(','))
  ].join('\n');

  // Adicionar BOM para UTF-8 para melhor compatibilidade com Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportUsersToCSV = (users: AllUsersData[], filename: string = 'usuarios'): void => {
  // Gerar nome do arquivo mais limpo
  const cleanFilename = filename.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  const dateStr = new Date().toISOString().split('T')[0];
  const fullFilename = `${cleanFilename}_${dateStr}.csv`;

  const headers = [
    'ID', 
    'Nome de Usuário', 
    'Email', 
    'Pontuação Total', 
    'Jogos Jogados', 
    'Status', 
    'Data de Criação',
    'Roles'
  ];

  const csvContent = [
    headers.join(','),
    ...users.map(user => [
      user.id,
      `"${(user.username || 'N/A').replace(/"/g, '""')}"`, // Escapar aspas duplas
      `"${(user.email || 'N/A').replace(/"/g, '""')}"`,
      user.total_score || 0,
      user.games_played || 0,
      user.is_banned ? 'Banido' : 'Ativo',
      new Date(user.created_at).toLocaleDateString('pt-BR'),
      `"${(user.roles || ['user']).join(', ').replace(/"/g, '""')}"`
    ].join(','))
  ].join('\n');

  // Adicionar BOM para UTF-8 para melhor compatibilidade com Excel
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', fullFilename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
