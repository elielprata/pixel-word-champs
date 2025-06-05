
import { Winner } from '@/types/winner';

export const exportToCSV = (winners: Winner[], prizeLevel: string): void => {
  const headers = ['Posição', 'Usuário', 'Chave PIX', 'Nome do Titular', 'Data Consolidada', 'Prêmio', 'Status Pagamento'];
  const csvContent = [
    headers.join(','),
    ...winners.map(winner => [
      winner.position,
      winner.username,
      `"${winner.pixKey}"`,
      `"${winner.holderName}"`,
      winner.consolidatedDate,
      `R$ ${winner.prize.toLocaleString('pt-BR')}`,
      winner.paymentStatus === 'paid' ? 'Pago' : 'Pendente'
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `pix_${prizeLevel.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
