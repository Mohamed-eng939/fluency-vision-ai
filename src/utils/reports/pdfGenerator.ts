
/**
 * PDF Generator Utility
 * Uses html2pdf library to convert HTML reports to PDF
 */

import html2pdf from 'html2pdf.js';

interface PDFOptions {
  fileName?: string;
  learnerName?: string;
  sessionId?: string;
  dateOfTest?: string;
}

/**
 * Generate PDF report from HTML element
 */
export const generateReportPdf = async (
  element: HTMLElement, 
  options: PDFOptions = {}
): Promise<void> => {
  // Apply print-specific styles
  applyPrintStyles(element);
  
  const fileName = options.fileName || `assessment-report-${Date.now()}.pdf`;
  
  // Configure PDF options
  const pdfOptions = {
    margin: [10, 10, 10, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, letterRendering: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
  };
  
  try {
    // Generate PDF
    const pdf = await html2pdf().set(pdfOptions).from(element).save();
    
    // Remove print-specific styles after generating PDF
    removePrintStyles(element);
    
    return pdf;
  } catch (error) {
    console.error('Error generating PDF:', error);
    removePrintStyles(element);
    throw error;
  }
};

/**
 * Apply print-specific styles to the element
 */
const applyPrintStyles = (element: HTMLElement): void => {
  // Add a class for print styling
  element.classList.add('generating-pdf');
  
  // Create a style element for print-specific styles
  const styleEl = document.createElement('style');
  styleEl.id = 'print-styles';
  
  // Add print-specific styles
  styleEl.textContent = `
    .generating-pdf {
      background-color: white !important;
      color: black !important;
      font-size: 12pt !important;
    }
    
    .generating-pdf * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .generating-pdf h1 {
      font-size: 18pt !important;
    }
    
    .generating-pdf h2 {
      font-size: 16pt !important;
    }
    
    .generating-pdf h3 {
      font-size: 14pt !important;
    }
  `;
  
  document.head.appendChild(styleEl);
};

/**
 * Remove print-specific styles
 */
const removePrintStyles = (element: HTMLElement): void => {
  element.classList.remove('generating-pdf');
  const styleEl = document.getElementById('print-styles');
  if (styleEl) {
    document.head.removeChild(styleEl);
  }
};

