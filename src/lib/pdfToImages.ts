export interface PDFConversionProgress {
  currentPage: number;
  totalPages: number;
  stage: 'loading' | 'converting' | 'complete';
}

export interface PDFConversionResult {
  images: Blob[];
  pageCount: number;
}

// Threshold for when to convert PDF to images (5MB)
export const PDF_SIZE_THRESHOLD_BYTES = 5 * 1024 * 1024;

/**
 * Convert a PDF file to an array of JPEG images (one per page)
 * 
 * NOTE: pdfjs-dist has been removed to reduce bundle/install size.
 * For large PDFs, consider using a backend edge function instead.
 * This stub returns an empty result so callers don't break.
 */
export async function convertPDFToImages(
  file: File,
  onProgress?: (progress: PDFConversionProgress) => void,
  _options: {
    maxPages?: number;
    scale?: number;
    quality?: number;
  } = {}
): Promise<PDFConversionResult> {
  console.warn('[pdfToImages] PDF client-side conversion is disabled. Use backend processing for large PDFs.');
  
  onProgress?.({ currentPage: 0, totalPages: 0, stage: 'complete' });
  
  // Return empty result - caller should handle this gracefully
  return { images: [], pageCount: 0 };
}

/**
 * Check if a file should be converted to images based on size
 * Returns false since client-side conversion is disabled
 */
export function shouldConvertPDF(_file: File): boolean {
  // Disabled - always return false so we don't attempt client-side conversion
  return false;
}
