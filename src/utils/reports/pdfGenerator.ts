
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
  console.log('Starting PDF generation with element:', element);
  
  if (!element) {
    throw new Error('No element provided for PDF generation');
  }

  // Clone the element to avoid modifying the original
  const clonedElement = element.cloneNode(true) as HTMLElement;
  document.body.appendChild(clonedElement);
  
  try {
    // Apply print-specific styles and prepare content
    await prepareContentForPdf(clonedElement, options);
    
    const pdfOptions = getPdfOptions(options);
    console.log('PDF options:', pdfOptions);
    
    // Generate PDF with enhanced options
    const pdf = html2pdf()
      .set(pdfOptions)
      .from(clonedElement)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        console.log('PDF generated, adding page elements');
        return addPageElements(pdf, options);
      })
      .save();
    
    // Clean up after generating PDF
    cleanupAfterPdf(clonedElement);
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    cleanupAfterPdf(clonedElement);
    throw error;
  } finally {
    // Remove cloned element
    if (document.body.contains(clonedElement)) {
      document.body.removeChild(clonedElement);
    }
  }
};

/**
 * Prepare content for PDF generation
 */
const prepareContentForPdf = async (element: HTMLElement, options: PDFOptions): Promise<void> => {
  console.log('Preparing content for PDF');
  
  // Add PDF generation class
  element.classList.add('generating-pdf');
  
  // Apply print styles
  applyPrintStyles();
  
  // Make all tabs visible first
  makeAllTabsVisible(element);
  
  // Force display of all hidden content
  const hiddenElements = element.querySelectorAll('[style*="display: none"], [data-state="inactive"]');
  hiddenElements.forEach(el => {
    (el as HTMLElement).style.display = 'block';
    (el as HTMLElement).style.visibility = 'visible';
  });
  
  // Embed images
  embedImages(element, options);
  
  // Add prompt history if available
  if ((options as any).promptHistory) {
    addPromptHistorySection(element, (options as any).promptHistory);
  }
  
  // Add strategic page breaks
  addPageBreaks(element);
  
  // Wait for any dynamic content to render
  await new Promise(resolve => setTimeout(resolve, 500));
};

/**
 * Clean up after PDF generation
 */
const cleanupAfterPdf = (element: HTMLElement): void => {
  console.log('Cleaning up after PDF generation');
  
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
