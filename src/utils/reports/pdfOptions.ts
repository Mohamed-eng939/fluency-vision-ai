
/**
 * PDF Configuration and Options
 */

export interface PDFOptions {
  fileName?: string;
  learnerName?: string;
  sessionId?: string;
  dateOfTest?: string;
  waveformImage?: string;
  radarChartImage?: string;
}

/**
 * Get PDF generation configuration options
 */
export const getPdfOptions = (options: PDFOptions = {}) => {
  const fileName = options.fileName || `assessment-report-${Date.now()}.pdf`;
  
  return {
    margin: [10, 10, 15, 10], // Top, Right, Bottom, Left margins
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, // Higher scale for better quality
      useCORS: true, 
      letterRendering: true,
      allowTaint: false,
      foreignObjectRendering: true,
      scrollX: 0,
      scrollY: 0,
      backgroundColor: '#ffffff',
      removeContainer: true
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css'],
      before: '.pdf-page-break'
    }
  };
};

/**
 * Add page numbers and headers to PDF
 */
export const addPageElements = (pdf: any, options: PDFOptions) => {
  const totalPages = pdf.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i);
    
    // Add page number in footer
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    const pageText = `Page ${i} of ${totalPages}`;
    const pageWidth = pdf.internal.pageSize.getWidth();
    const textWidth = pdf.getTextWidth(pageText);
    pdf.text(pageText, (pageWidth - textWidth) / 2, pdf.internal.pageSize.getHeight() - 5);
    
    // Add header with session info
    if (options.sessionId && options.dateOfTest) {
      pdf.setFontSize(8);
      pdf.setTextColor(100, 100, 100);
      pdf.text(`Session: ${options.sessionId}`, 10, 8);
      pdf.text(`Date: ${options.dateOfTest}`, pageWidth - 50, 8);
    }
  }
  
  return pdf;
};
