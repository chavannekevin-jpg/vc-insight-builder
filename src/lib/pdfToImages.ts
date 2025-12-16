import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source - use CDN for reliability (v3.x compatible)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

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
 * This is used for large PDFs to avoid memory limits in edge functions
 */
export async function convertPDFToImages(
  file: File,
  onProgress?: (progress: PDFConversionProgress) => void,
  options: {
    maxPages?: number;
    scale?: number;
    quality?: number;
  } = {}
): Promise<PDFConversionResult> {
  const { maxPages = 30, scale = 1.5, quality = 0.85 } = options;
  
  console.log('[pdfToImages] Starting conversion for:', file.name, 'size:', file.size);
  
  onProgress?.({ currentPage: 0, totalPages: 0, stage: 'loading' });
  
  // Load the PDF
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  const totalPages = Math.min(pdf.numPages, maxPages);
  console.log('[pdfToImages] PDF loaded, pages:', pdf.numPages, 'processing:', totalPages);
  
  const images: Blob[] = [];
  
  for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
    onProgress?.({ currentPage: pageNum, totalPages, stage: 'converting' });
    
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    
    // Create canvas for rendering
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    // Render the page
    await page.render({
      canvasContext: context,
      viewport
    }).promise;
    
    // Convert canvas to blob
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => {
          if (b) resolve(b);
          else reject(new Error('Failed to convert canvas to blob'));
        },
        'image/jpeg',
        quality
      );
    });
    
    images.push(blob);
    console.log(`[pdfToImages] Converted page ${pageNum}/${totalPages}, size: ${blob.size} bytes`);
    
    // Clean up
    canvas.width = 0;
    canvas.height = 0;
  }
  
  onProgress?.({ currentPage: totalPages, totalPages, stage: 'complete' });
  
  const totalSize = images.reduce((sum, img) => sum + img.size, 0);
  console.log('[pdfToImages] Conversion complete. Total images:', images.length, 'Total size:', totalSize);
  
  return { images, pageCount: totalPages };
}

/**
 * Check if a file should be converted to images based on size
 */
export function shouldConvertPDF(file: File): boolean {
  const isPDF = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  return isPDF && file.size > PDF_SIZE_THRESHOLD_BYTES;
}
