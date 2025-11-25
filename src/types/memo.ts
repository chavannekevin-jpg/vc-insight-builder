export interface MemoParagraph {
  text: string;
  emphasis?: "high" | "medium" | "normal";
}

export interface MemoHighlight {
  metric: string;
  label: string;
}

export interface MemoVCReflection {
  analysis: string;
  questions: string[];
  benchmarking?: string;
  conclusion: string;
}

export interface MemoStructuredSection {
  title: string;
  narrative?: {
    paragraphs?: MemoParagraph[];
    highlights?: MemoHighlight[];
    keyPoints?: string[];
  };
  // Legacy support - direct properties
  paragraphs?: MemoParagraph[];
  highlights?: MemoHighlight[];
  keyPoints?: string[];
  // New VC reflection
  vcReflection?: MemoVCReflection;
}

export interface MemoStructuredContent {
  sections: MemoStructuredSection[];
  generatedAt?: string;
}
