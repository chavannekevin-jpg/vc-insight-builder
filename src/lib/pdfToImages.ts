export interface PDFConversionProgress {
  currentPage: number;
  totalPages: number;
  stage: 'loading' | 'converting' | 'complete';
}

export interface PDFConversionResult {
  images: Blob[];
  pageCount: number;
}

// pdf.js (client-side PDF rendering)
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";
// Vite will turn this into a URL string for the worker bundle
import pdfWorkerSrc from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

// Threshold for when to convert PDF to images (5MB)
export const PDF_SIZE_THRESHOLD_BYTES = 5 * 1024 * 1024;

// Sensible defaults to keep uploads fast + memory safe
const DEFAULT_MAX_PAGES = 8;
const DEFAULT_SCALE = 1.15;
const DEFAULT_QUALITY = 0.68;
const DEFAULT_MAX_DIMENSION = 1600; // px (max width/height)

// Configure worker once
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(pdfjs as any).GlobalWorkerOptions.workerSrc = pdfWorkerSrc;

/**
 * Convert a PDF file to an array of JPEG images (one per page).
 * We keep images reasonably small to avoid upload + backend memory issues.
 */
export async function convertPDFToImages(
  file: File,
  onProgress?: (progress: PDFConversionProgress) => void,
  options: {
    maxPages?: number;
    scale?: number;
    quality?: number;
    maxDimension?: number;
  } = {}
): Promise<PDFConversionResult> {
  if (file.type !== 'application/pdf') {
    throw new Error('Only PDF files can be converted to images');
  }

  const maxPages = options.maxPages ?? DEFAULT_MAX_PAGES;
  const scale = options.scale ?? DEFAULT_SCALE;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const maxDimension = options.maxDimension ?? DEFAULT_MAX_DIMENSION;

  onProgress?.({ currentPage: 0, totalPages: 0, stage: 'loading' });

  const arrayBuffer = await file.arrayBuffer();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const loadingTask = (pdfjs as any).getDocument({ data: arrayBuffer });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdf = (await loadingTask.promise) as any;

  const total = pdf.numPages;
  const pagesToRender = Math.min(total, maxPages);

  const images: Blob[] = [];
  for (let pageNumber = 1; pageNumber <= pagesToRender; pageNumber++) {
    onProgress?.({ currentPage: pageNumber, totalPages: pagesToRender, stage: 'converting' });

    const page = await pdf.getPage(pageNumber);

    // Cap output dimensions per page for reliability (decks can include huge pages)
    const baseViewport = page.getViewport({ scale });
    const maxSide = Math.max(baseViewport.width, baseViewport.height);
    const dimensionScale = maxSide > maxDimension ? maxDimension / maxSide : 1;
    const viewport = page.getViewport({ scale: scale * dimensionScale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    if (!context) throw new Error('Failed to create canvas context');

    canvas.width = Math.ceil(viewport.width);
    canvas.height = Math.ceil(viewport.height);

    await page.render({ canvasContext: context, viewport }).promise;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Failed to encode page as image'))),
        'image/jpeg',
        quality
      );
    });

    images.push(blob);

    // Help GC
    canvas.width = 0;
    canvas.height = 0;
  }

  onProgress?.({ currentPage: pagesToRender, totalPages: pagesToRender, stage: 'complete' });
  return { images, pageCount: total };
}

/**
 * Check if a file should be converted to images based on size
 * Returns false since client-side conversion is disabled
 */
export function shouldConvertPDF(_file: File): boolean {
  // Always convert PDFs to images client-side to avoid backend PDF memory limits.
  return _file.type === 'application/pdf';
}
