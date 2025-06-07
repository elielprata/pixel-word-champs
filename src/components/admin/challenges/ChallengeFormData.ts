
export interface ChallengeFormData {
  title: string;
  description: string;
  theme: string;
  color: string;
  difficulty: string;
  levels: number;
  is_active: boolean;
}

export const getDefaultFormData = (): ChallengeFormData => ({
  title: '',
  description: '',
  theme: 'default',
  color: 'blue',
  difficulty: 'medium',
  levels: 20,
  is_active: true
});
