export interface OCRResult {
    text: string;
    confidence: number;
    blocks: OCRBlock[];
    lines: OCRLine[];
}
export interface OCRBlock {
    text: string;
    confidence: number;
    bbox: BoundingBox;
}
export interface OCRLine {
    text: string;
    confidence: number;
    words: OCRWord[];
}
export interface OCRWord {
    text: string;
    confidence: number;
}
export interface BoundingBox {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
}
/**
 * Enhanced OCR Service
 * Features:
 * - Image preprocessing (deskew, contrast, noise removal)
 * - Worker pool for batch processing
 * - Field-level confidence scores
 * - Handwriting optimization
 * - Parallel processing
 */
export declare class OCRService {
    private workers;
    private workerQueue;
    private isInitialized;
    /**
     * Initialize worker pool for parallel processing
     * Recommended: 2-4 workers based on CPU cores
     */
    initWorkerPool(poolSize?: number): Promise<void>;
    /**
     * Terminate all workers
     */
    shutdown(): Promise<void>;
    /**
     * Get worker from pool (wait if all busy)
     */
    private getWorker;
    /**
     * Release worker back to pool
     */
    private releaseWorker;
    /**
     * Preprocess image for better OCR results
     * Steps:
     * 1. Deskew (fix rotation)
     * 2. Adjust contrast
     * 3. Remove noise
     * 4. Optimize for handwriting
     */
    preprocessImage(imagePath: string, options?: {
        deskew?: boolean;
        contrast?: number;
        removeNoise?: boolean;
        handwritingOptimized?: boolean;
    }): Promise<Buffer>;
    /**
     * Recognize text with confidence scores
     * Returns detailed OCR results including per-word confidence
     */
    recognizeWithConfidence(imagePath: string, optimize?: {
        handwriting?: boolean;
        preprocessing?: boolean;
    }): Promise<OCRResult>;
    /**
     * Extract handwriting with confidence
     * Optimized specifically for handwritten forms
     */
    extractHandwritingWithConfidence(imagePath: string): Promise<{
        text: string;
        confidence: number;
        handwritingScore: number;
    }>;
    /**
     * Deskew image (rotate to correct orientation)
     * Note: This is a placeholder. Real implementation would use
     * a dedicated deskew algorithm or library
     */
    private deskewImage;
    /**
     * Adjust image contrast for better OCR
     */
    private adjustContrast;
    /**
     * Remove noise from image
     */
    private removeNoise;
}
export declare const ocrService: OCRService;
//# sourceMappingURL=ocr.service.d.ts.map