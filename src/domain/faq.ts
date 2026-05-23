export interface FAQEntry {
  id: string;
  question: string;
  answer: string; // Markdown supported
  sortOrder: number;
  isActive: boolean;
}

export interface FAQResponse {
  items: FAQEntry[];
}
