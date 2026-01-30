// Types for Data Room Analyzer

export interface DataRoom {
  id: string;
  investor_id: string;
  company_name: string;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  summary_json: DataRoomMemo | null;
  created_at: string;
  updated_at: string;
}

export interface DataRoomFile {
  id: string;
  room_id: string;
  file_name: string;
  file_type: string;
  file_size: number | null;
  storage_path: string;
  extracted_text: string | null;
  extraction_status: 'pending' | 'processing' | 'completed' | 'error';
  page_count: number | null;
  created_at: string;
}

export interface DataRoomMessage {
  id: string;
  room_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources: DataRoomSource[] | null;
  created_at: string;
}

export interface DataRoomSource {
  file_name: string;
  excerpt: string;
  confidence?: number;
}

// Memo structure for due diligence analysis
export interface DataRoomMemoSection {
  title: string;
  assessment: 'strong' | 'moderate' | 'weak' | 'unclear';
  strengths: string[];
  concerns: string[];
  inconsistencies: string[];
  analyst_notes: string;
}

export interface DataRoomMemo {
  company_name: string;
  analysis_date: string;
  executive_summary: string;
  investment_thesis: string;
  overall_score: number; // 0-100
  verdict: string;
  
  sections: {
    business_model: DataRoomMemoSection;
    market_opportunity: DataRoomMemoSection;
    competitive_position: DataRoomMemoSection;
    financials: DataRoomMemoSection;
    team: DataRoomMemoSection;
    traction: DataRoomMemoSection;
    risks: DataRoomMemoSection;
    terms: DataRoomMemoSection;
  };
  
  key_metrics: {
    label: string;
    value: string;
    source_file: string;
  }[];
  
  red_flags: string[];
  diligence_questions: string[];
  
  // Metadata about document coverage
  document_coverage: {
    file_name: string;
    topics_covered: string[];
  }[];
}
