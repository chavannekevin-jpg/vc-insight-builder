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
const DEFAULT_MAX_PAGES = 25; // Process ALL slides for most decks (95% are ≤25 pages)
const DEFAULT_SCALE = 1.15;
const DEFAULT_QUALITY = 0.68;
const DEFAULT_MAX_DIMENSION = 1600; // px (max width/height)

type PageScore = { pageNumber: number; score: number };

const KEYWORD_WEIGHTS: Array<{ weight: number; keywords: string[] }> = [
  {
    weight: 5,
    keywords: [
      "team",
      "founder",
      "founders",
      "cofounder",
      "co-founder",
      "leadership",
      "management",
      "advisors",
      "advisory",
      "board",
      "ceo",
      "cto",
      "cpo",
      "cfo",
      "bios",
      "background",
    ],
  },
  {
    weight: 4,
    keywords: [
      "vision",
      "mission",
      "roadmap",
      "strategy",
      "future",
      "next",
      "plan",
      "milestones",
      "18 months",
      "12 months",
    ],
  },
  {
    weight: 6,
    keywords: [
      "raise",
      "raising",
      "funding",
      "round",
      "valuation",
      "pre-money",
      "post-money",
      "committed",
      "secured",
      "use of funds",
      "allocation",
      "runway",
      "investment",
      "investors",
      "lead investor",
      "ticket",
    ],
  },
];

function scoreText(text: string): number {
  const t = text.toLowerCase();
  let score = 0;

  for (const group of KEYWORD_WEIGHTS) {
    for (const k of group.keywords) {
      if (t.includes(k)) score += group.weight;
    }
  }

  return score;
}

async function extractPageText(pdf: any, pageNumber: number): Promise<string> {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (content?.items || []) as any[];
  return items
    .map((it) => (typeof it?.str === "string" ? it.str : ""))
    .filter(Boolean)
    .join(" ");
}

async function selectPagesToRender(pdf: any, totalPages: number, maxPages: number): Promise<number[]> {
  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  // Always include cover + last pages (team/funding often live near the end)
  const selected = new Set<number>();
  selected.add(1);
  selected.add(totalPages);
  selected.add(Math.max(1, totalPages - 1));
  selected.add(Math.max(1, totalPages - 2));

  // Score every page for likely VC-critical slides (team/vision/funding)
  const scores: PageScore[] = [];
  for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
    try {
      const text = await extractPageText(pdf, pageNumber);
      const score = scoreText(text);
      scores.push({ pageNumber, score });
    } catch {
      // Ignore text extraction failures; we'll still fill with fallbacks
      scores.push({ pageNumber, score: 0 });
    }
  }

  scores
    .filter((s) => !selected.has(s.pageNumber))
    .sort((a, b) => b.score - a.score)
    .forEach((s) => {
      if (selected.size >= maxPages) return;
      // Only include scored pages if they likely contain relevant content
      if (s.score > 0) selected.add(s.pageNumber);
    });

  // Fill remaining slots with evenly-spaced pages for broader context
  if (selected.size < maxPages) {
    const needed = maxPages - selected.size;
    for (let i = 1; i <= needed * 2 && selected.size < maxPages; i++) {
      const pageNumber = Math.round(1 + (i * (totalPages - 1)) / (needed * 2 + 1));
      selected.add(Math.min(totalPages, Math.max(1, pageNumber)));
    }
  }

  return Array.from(selected)
    .sort((a, b) => a - b)
    .slice(0, maxPages);
}

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

  // IMPORTANT: we don't just take the first N pages.
  // We pick a small set of pages likely to contain TEAM / VISION / FUNDING slides,
  // plus the cover + end pages, so the AI can actually see them.
  const pageNumbers = await selectPagesToRender(pdf, total, maxPages);
  const pagesToRender = pageNumbers.length;

  const images: Blob[] = [];
  for (let i = 0; i < pageNumbers.length; i++) {
    const pageNumber = pageNumbers[i];
    onProgress?.({ currentPage: i + 1, totalPages: pagesToRender, stage: 'converting' });

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
