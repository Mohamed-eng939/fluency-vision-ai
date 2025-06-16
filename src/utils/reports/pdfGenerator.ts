
/**
 * PDF Generator Utility - Refactored Main Module
 */

import html2pdf from 'html2pdf.js';
import { PDFOptions, getPdfOptions, addPageElements } from './pdfOptions';
import { applyPrintStyles, removePrintStyles } from './pdfStyles';
import { 
  embedImages, 
  addPromptHistorySection, 
  addPageBreaks, 
  makeAllTabsVisible, 
  restoreTabStates, 
  cleanupAddedContent 
} from './pdfContent';

/**
 * Generate PDF report from HTML element with enhanced formatting and complete content
 */
export const generateReportPdf = async (
  element: HTMLElement, 
  options: PDFOptions = {}
): Promise<void> => {
  // Apply print-specific styles and prepare content
  await prepareContentForPdf(element, options);
  
  const pdfOptions = getPdfOptions(options);
  
  try {
    // Generate PDF with page numbers and section headers
    const pdf = html2pdf()
      .set(pdfOptions)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        // Add page numbers and headers
        return addPageElements(pdf, options);
      })
      .save();
    
    // Clean up after generating PDF
    cleanupAfterPdf(element);
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    cleanupAfterPdf(element);
    throw error;
  }
};

/**
 * Prepare content for PDF generation
 */
const prepareContentForPdf = async (element: HTMLElement, options: PDFOptions): Promise<void> => {
  // Add PDF generation class
  element.classList.add('generating-pdf');
  
  // Apply print styles
  applyPrintStyles();
  
  // Embed images
  embedImages(element, options);
  
  // Add prompt history if available
  if ((options as any).promptHistory) {
    addPromptHistorySection(element, (options as any).promptHistory);
  }
  
  // Add strategic page breaks
  addPageBreaks(element);
  
  // Make all tabs visible
  makeAllTabsVisible(element);
};

/**
 * Clean up after PDF generation
 */
const cleanupAfterPdf = (element: HTMLElement): void => {
  // Remove print styles
  removePrintStyles();
  
  // Restore tab states
  restoreTabStates(element);
  
  // Clean up added content
  cleanupAddedContent(element);
};

/**
 * Capture images from visualization components with compression
 */
export const captureVisualizationImages = async (
  waveformRef?: React.RefObject<{ captureImage: () => string }>,
  errors?: Array<{ start: number; end: number; type: string }>,
  duration?: number
): Promise<{ waveformImage?: string; radarChartImage?: string }> => {
  const images: { waveformImage?: string; radarChartImage?: string } = {};

  // Capture waveform image
  if (waveformRef?.current) {
    try {
      images.waveformImage = waveformRef.current.captureImage();
    } catch (error) {
      console.error('Error capturing waveform image:', error);
    }
  }

  return images;
};
