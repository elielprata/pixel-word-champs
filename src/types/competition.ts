
export interface UnifiedCompetition {
  id: string;
  title: string;
  description: string;
  type: 'daily'; // Removida opção 'weekly'
  status: 'draft' | 'scheduled' | 'active' | 'completed';
  startDate: string;
  endDate: string;
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
