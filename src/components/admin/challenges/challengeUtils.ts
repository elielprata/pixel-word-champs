
export const formatDateForInput = (dateString: string | null | undefined) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    // Formatar para datetime-local input (YYYY-MM-DDTHH:mm)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return '';
  }
};

export const getNextId = (challenges: any[]) => {
  if (challenges.length === 0) return 1;
  return Math.max(...challenges.map(c => c.id)) + 1;
};
