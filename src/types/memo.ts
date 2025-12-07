export interface MemoParagraph {
  text: string;
  emphasis?: "high" | "medium" | "normal";
}

export interface MemoHighlight {
  metric: string;
  label: string;
}

// Enhanced VC Question with economics perspective
export interface MemoVCQuestion {
  question: string;
  vcRationale: string;
  whatToPrepare: string;
}

export interface MemoVCReflection {
  analysis: string;
  questions: (string | MemoVCQuestion)[]; // Support both string[] and MemoVCQuestion[] for backwards compatibility
  benchmarking?: string;
  conclusion: string;
}

// VC Quick Take - visible in free preview
export interface MemoVCQuickTake {
  verdict: string;
  concerns: string[];
  strengths: string[];
  readinessLevel: "LOW" | "MEDIUM" | "HIGH";
  readinessRationale: string;
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
  vcQuickTake?: MemoVCQuickTake;
  generatedAt?: string;
}
