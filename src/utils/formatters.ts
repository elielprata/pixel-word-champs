
export const formatDateTimeRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const formatOptions: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const startFormatted = start.toLocaleDateString('pt-BR', formatOptions);
  const endFormatted = end.toLocaleDateString('pt-BR', formatOptions);
  
  // Se for o mesmo dia, mostrar apenas uma data
  if (start.toDateString() === end.toDateString()) {
    const dateOnly = start.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const startTime = start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const endTime = end.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dateOnly} (${startTime} - ${endTime})`;
  }
  
  return `${startFormatted} - ${endFormatted}`;
};
