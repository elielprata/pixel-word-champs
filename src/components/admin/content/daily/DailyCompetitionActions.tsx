
import React from 'react';
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from 'lucide-react';

interface DailyCompetition {
  id: string;
  title: string;
  description: string;
  theme: string;
  start_date: string;
  end_date: string;
  max_participants: number;
  status: string;
  created_at: string;
}

interface DailyCompetitionActionsProps {
  competition: DailyCompetition;
  onEdit: (competition: DailyCompetition) => void;
  onDelete: (id: string) => void;
}

export const DailyCompetitionActions: React.FC<DailyCompetitionActionsProps> = ({
  competition,
  onEdit,
  onDelete
}) => {
  return (
    <div className="flex gap-2 justify-center">
      <Button
        size="sm"
        variant="outline"
        onClick={() => onEdit(competition)}
      >
        <Edit className="h-3 w-3" />
      </Button>
      <Button
        size="sm"
        variant="outline"
        onClick={() => onDelete(competition.id)}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-3 w-3" />
      </Button>
    </div>
  );
};
