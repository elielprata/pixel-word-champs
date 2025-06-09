
import React from 'react';
import { GameContentTabHeader } from "./layout/GameContentTabHeader";
import { GameContentTabMetrics } from "./layout/GameContentTabMetrics";
import { GameContentTabContent } from "./layout/GameContentTabContent";

export const GameContentTab = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <GameContentTabHeader />
        <GameContentTabMetrics />
        <GameContentTabContent />
      </div>
    </div>
  );
};
