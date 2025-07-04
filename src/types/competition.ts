
export interface UnifiedCompetition {
  id: string;
  title: string;
  description: string;
  type: 'daily'; // Apenas competições diárias
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  duration?: number; // Nova propriedade para duração em horas
  maxParticipants: number;
  theme?: string;
  totalParticipants?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitionFormData {
  title: string;
  description: string;
  type: 'daily'; // Apenas competições diárias
  startDate: string;
  endDate: string;
  duration: number; // Nova propriedade obrigatória para duração em horas
  maxParticipants: number;
}

export interface CompetitionValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface CompetitionApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}
