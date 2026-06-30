export interface TeachingEntry {
  id: string;
  period: string;
  standard: string;
  subject: string;
  topic: string;
  description: string;
  timestamp: string;
}

export interface TeachingDataProps {
  entries: TeachingEntry[];
  onRefresh?: () => void;
  onEntryPress?: (entry: TeachingEntry) => void;
}