
export interface ChallengeFormData {
  title: string;
  description: string;
  theme: string;
  color: string;
  difficulty: 'easy' | 'medium' | 'hard';
  levels: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
}

export const getDefaultFormData = (): ChallengeFormData => ({
  title: '',
  description: '',
  theme: 'default',
  color: 'blue',
  difficulty: 'medium',
  levels: 20,
  is_active: true,
  start_date: '',
  end_date: ''
});

export const difficultyOptions = [
  { value: 'easy', label: 'Fácil' },
  { value: 'medium', label: 'Médio' },
  { value: 'hard', label: 'Difícil' }
];

export const colorOptions = [
  { value: 'blue', label: 'Azul' },
  { value: 'green', label: 'Verde' },
  { value: 'purple', label: 'Roxo' },
  { value: 'red', label: 'Vermelho' },
  { value: 'yellow', label: 'Amarelo' },
  { value: 'pink', label: 'Rosa' }
];
