
import { Badge } from "@/components/ui/badge";

interface CompetitionStatusBadgeProps {
  status: string;
}

export const CompetitionStatusBadge: React.FC<CompetitionStatusBadgeProps> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Finalizada';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  return (
    <Badge className={getStatusColor(status)}>
      {getStatusText(status)}
    </Badge>
  );
};
