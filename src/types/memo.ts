export interface MemoParagraph {
  text: string;
  emphasis?: "high" | "medium" | "normal";
}

export interface MemoHighlight {
  metric: string;
  label: string;
}

export interface MemoStructuredSection {
  title: string;
  paragraphs?: MemoParagraph[];
  highlights?: MemoHighlight[];
  keyPoints?: string[];
}

export interface MemoStructuredContent {
  sections: MemoStructuredSection[];
}
