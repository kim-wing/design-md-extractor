// This file contains the design case count for the extension
// The full data is in the showcase website

export interface DesignCase {
  id: string;
  name: string;
  description: string;
  category: string;
  colors: string[];
  textColor: string;
  downloads: string;
  likes: string;
}

// Simplified data - just the count for display
export const designCases: DesignCase[] = [];

// This will be imported from the showcase website
export const totalDesignCount = 68;
