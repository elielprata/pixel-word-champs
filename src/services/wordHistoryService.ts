
import { wordUsageService } from './wordHistory/wordUsageService';
import { wordRetrievalService } from './wordHistory/wordRetrievalService';
import { wordSelectionService } from './wordHistory/wordSelectionService';
import { wordHistoryMaintenanceService } from './wordHistory/wordHistoryMaintenanceService';

// Re-export all services and their methods for backward compatibility
class WordHistoryService {
  // Word usage methods
  recordWordsUsage = wordUsageService.recordWordsUsage.bind(wordUsageService);

  // Word retrieval methods
  getUserWordHistory = wordRetrievalService.getUserWordHistory.bind(wordRetrievalService);
  getCompetitionWordHistory = wordRetrievalService.getCompetitionWordHistory.bind(wordRetrievalService);

  // Word selection methods
  selectRandomizedWords = wordSelectionService.selectRandomizedWords.bind(wordSelectionService);

  // Maintenance methods
  cleanOldHistory = wordHistoryMaintenanceService.cleanOldHistory.bind(wordHistoryMaintenanceService);
}

export const wordHistoryService = new WordHistoryService();

// Also export individual services for more granular usage
export {
  wordUsageService,
  wordRetrievalService,
  wordSelectionService,
  wordHistoryMaintenanceService
};
