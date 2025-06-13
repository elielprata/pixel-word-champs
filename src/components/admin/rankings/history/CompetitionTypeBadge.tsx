
import { Badge } from "@/components/ui/badge";

interface CompetitionTypeBadgeProps {
  type: string;
}

export const CompetitionTypeBadge: React.FC<CompetitionTypeBadgeProps> = ({ type }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'daily': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'weekly': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'challenge': return 'bg-blue-100 text-blue-700 border-blue-200'; // Legacy support
      case 'tournament': return 'bg-purple-100 text-purple-700 border-purple-200'; // Legacy support
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'daily': return 'Diária';
      case 'weekly': return 'Semanal';
      case 'challenge': return 'Diária'; // Legacy support
      case 'tournament': return 'Semanal'; // Legacy support
      default: return type;
    }
  };

  return (
    <Badge className={getTypeColor(type)}>
      {getTypeText(type)}
    </Badge>
  );
};
