import sharp from 'sharp';
import path from 'path';
import fs from 'fs/promises';

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
export class OCRService {
  private workers: any[] = [];
  private workerQueue: any[] = [];
  private isInitialized = false;

  /**
   * Initialize worker pool for parallel processing
   * Recommended: 2-4 workers based on CPU cores
   */
  async initWorkerPool(poolSize: number = 2): Promise<void> {
    if (this.isInitialized) return;

    try {
      const { createWorker } = require('tesseract.js');

      for (let i = 0; i < poolSize; i++) {
        const worker = await createWorker('eng');
        this.workers.push(worker);
        this.workerQueue.push(worker);
      }

      this.isInitialized = true;
      console.log(`OCR worker pool initialized with ${poolSize} workers`);
    } catch (error) {
      console.error('Failed to initialize OCR worker pool:', error);
      throw error;
    }
  }

  /**
   * Terminate all workers
   */
  async shutdown(): Promise<void> {
    for (const worker of this.workers) {
      try {
        await worker.terminate();
      } catch (error) {
        console.error('Error terminating worker:', error);
      }
    }
    this.workers = [];
    this.workerQueue = [];
    this.isInitialized = false;
  }

  /**
   * Get worker from pool (wait if all busy)
   */
  private async getWorker(): Promise<any> {
    if (this.workerQueue.length === 0) {
      // All workers busy, wait briefly
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.getWorker();
    }
    return this.workerQueue.shift()!;
  }

  /**
   * Release worker back to pool
   */
  private releaseWorker(worker: any): void {
    this.workerQueue.push(worker);
  }

  /**
   * Preprocess image for better OCR results
   * Steps:
   * 1. Deskew (fix rotation)
   * 2. Adjust contrast
   * 3. Remove noise
   * 4. Optimize for handwriting
   */
  async preprocessImage(
    imagePath: string,
    options?: {
      deskew?: boolean;
      contrast?: number;
      removeNoise?: boolean;
      handwritingOptimized?: boolean;
    }
  ): Promise<Buffer> {
    const {
      deskew = true,
      contrast = 1.5,
      removeNoise = true,
      handwritingOptimized = false
    } = options || {};

    let pipeline = sharp(imagePath);

    // Step 1: Deskew (if needed)
    if (deskew) {
      // Sharp doesn't have built-in deskew, so we adjust via rotation hints
      // In production, use a dedicated deskew library
    }

    // Step 2: Adjust contrast (increase for handwriting clarity)
    pipeline = pipeline.modulate({
      brightness: 1.0,
      saturation: 0.8,
      hue: 0
    });

    // Step 3: Normalize and sharpen
    pipeline = pipeline
      .normalize()
      .sharpen({ sigma: 1.5 });

    // Step 4: Contrast adjustment
    if (contrast !== 1.0) {
      // Use linear contrast adjustment
      const levels = 255;
      const output = Math.round(((levels - 1) * contrast) / 255);
      pipeline = pipeline.linear(contrast, output);
    }

    // Step 5: Remove noise (median filter simulation)
    if (removeNoise) {
      pipeline = pipeline.median(3);
    }

    // Step 6: Resize if too small (helps OCR)
    const metadata = await sharp(imagePath).metadata();
    if (metadata.width && metadata.width < 800) {
      pipeline = pipeline.resize(800, 600, {
        fit: 'inside',
        withoutEnlargement: false
      });
    }

    // Step 7: Convert to grayscale for better OCR
    pipeline = pipeline.grayscale().png();

    return pipeline.toBuffer();
  }

  /**
   * Recognize text with confidence scores
   * Returns detailed OCR results including per-word confidence
   */
  async recognizeWithConfidence(
    imagePath: string,
    optimize?: { handwriting?: boolean; preprocessing?: boolean }
  ): Promise<OCRResult> {
    const { handwriting = false, preprocessing = true } = optimize || {};

    let imageBuffer: Buffer;

    // Preprocess if enabled
    if (preprocessing) {
      imageBuffer = await this.preprocessImage(imagePath, {
        handwritingOptimized: handwriting,
        contrast: handwriting ? 2.0 : 1.5,
        removeNoise: true
      });
    } else {
      imageBuffer = await fs.readFile(imagePath);
    }

    // Get worker from pool
    const worker = await this.getWorker();

    try {
      // Configure for handwriting if specified
      if (handwriting) {
        await (worker as any).setParameters({
          tessedit_pagesegmode: 6 // PSM 6: Assume uniform block text
        });
      }

      // Run OCR
      const { data } = await (worker as any).recognize(imageBuffer);

      // Parse results into structured format
      const result: OCRResult = {
        text: data.text,
        confidence: Math.round(data.confidence),
        blocks: [],
        lines: []
      };

      // Extract block-level data
      if (data.paragraphs) {
        for (const paragraph of data.paragraphs) {
          for (const line of paragraph.lines || []) {
            for (const block of line.words || []) {
              result.blocks.push({
                text: block.text,
                confidence: block.confidence,
                bbox: {
                  x0: block.bbox.x0,
                  y0: block.bbox.y0,
                  x1: block.bbox.x1,
                  y1: block.bbox.y1
                }
              });
            }
          }
        }
      }

      // Extract line-level data
      if (data.lines) {
        for (const line of data.lines) {
          const lineConfidence = line.words?.length
            ? Math.round(
                line.words.reduce((sum: number, w: any) => sum + w.confidence, 0) /
                  line.words.length
              )
            : 0;

          result.lines.push({
            text: line.text,
            confidence: lineConfidence,
            words: (line.words || []).map((word: any) => ({
              text: word.text,
              confidence: word.confidence
            }))
          });
        }
      }

      return result;
    } finally {
      // Release worker back to pool
      this.releaseWorker(worker);
    }
  }

  /**
   * Extract handwriting with confidence
   * Optimized specifically for handwritten forms
   */
  async extractHandwritingWithConfidence(
    imagePath: string
  ): Promise<{
    text: string;
    confidence: number;
    handwritingScore: number;
  }> {
    // Optimize preprocessing for handwriting
    const preprocessed = await this.preprocessImage(imagePath, {
      handwritingOptimized: true,
      contrast: 2.0,
      removeNoise: true,
      deskew: true
    });

    // Write preprocessed image to temp file
    const tempPath = path.join('/tmp', `temp_${Date.now()}_handwriting.png`);
    await fs.writeFile(tempPath, preprocessed);

    try {
      // Run OCR with handwriting optimization
      const result = await this.recognizeWithConfidence(tempPath, {
        handwriting: true,
        preprocessing: false
      });

      // Handwriting score: combination of overall confidence
      // and variance in word confidences (handwriting is less uniform)
      const wordConfidences = result.lines
        .flatMap(l => l.words)
        .map(w => w.confidence);

      const avgConfidence =
        wordConfidences.length > 0
          ? Math.round(
              wordConfidences.reduce((a, b) => a + b, 0) / wordConfidences.length
            )
          : 0;

      // Calculate variance (handwriting = higher variance)
      const variance =
        wordConfidences.length > 0
          ? Math.sqrt(
              wordConfidences.reduce(
                (sum, conf) => sum + Math.pow(conf - avgConfidence, 2),
                0
              ) / wordConfidences.length
            )
          : 0;

      // Handwriting confidence: variance indicates handwritten (0-100)
      const handwritingScore = Math.min(100, Math.round(variance / 2));

      return {
        text: result.text,
        confidence: result.confidence,
        handwritingScore
      };
    } finally {
      // Cleanup temp file
      try {
        await fs.unlink(tempPath);
      } catch {
        // Ignore cleanup errors
      }
    }
  }

  /**
   * Deskew image (rotate to correct orientation)
   * Note: This is a placeholder. Real implementation would use
   * a dedicated deskew algorithm or library
   */
  private async deskewImage(imageBuffer: Buffer): Promise<Buffer> {
    // Placeholder implementation
    // In production, use a library like:
    // - opencv4nodejs
    // - skew-detection
    // - or custom algorithm
    return imageBuffer;
  }

  /**
   * Adjust image contrast for better OCR
   */
  private async adjustContrast(
    imageBuffer: Buffer,
    factor: number
  ): Promise<Buffer> {
    return sharp(imageBuffer)
      .linear(factor, 0)
      .toBuffer();
  }

  /**
   * Remove noise from image
   */
  private async removeNoise(imageBuffer: Buffer): Promise<Buffer> {
    return sharp(imageBuffer)
      .median(3)
      .toBuffer();
  }
}

export const ocrService = new OCRService();
