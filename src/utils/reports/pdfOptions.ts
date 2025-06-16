
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
    margin: [15, 15, 20, 15], // Top, Right, Bottom, Left margins
    filename: fileName,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
      scale: 1.5, // Reduced scale for better performance
      useCORS: true, 
      letterRendering: true,
      allowTaint: true,
      foreignObjectRendering: true,
      scrollX: 0,
      scrollY: 0,
      height: window.innerHeight,
      width: window.innerWidth
    },
    jsPDF: { 
      unit: 'mm', 
      format: 'a4', 
      orientation: 'portrait',
      compress: true
    },
    pagebreak: { 
      mode: ['avoid-all', 'css', 'legacy'],
      before: '.pdf-page-break',
      after: '.pdf-page-break'
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
    pdf.text(pageText, (pageWidth - textWidth) / 2, pdf.internal.pageSize.getHeight() - 10);
    
    // Add header with session info
    if (options.sessionId && options.dateOfTest) {
      pdf.setFontSize(8);
      pdf.text(`Session: ${options.sessionId}`, 15, 10);
      pdf.text(`Date: ${options.dateOfTest}`, pageWidth - 40, 10);
    }
    
    // Add section headers based on page content
    if (i === 1) {
      pdf.setFontSize(8);
      pdf.setTextColor(70, 130, 180);
      pdf.text('Assessment Overview', 15, 20);
    } else if (i === 2) {
      pdf.setFontSize(8);
      pdf.setTextColor(70, 130, 180);
      pdf.text('Skills Analysis', 15, 20);
    } else if (i >= 3) {
      pdf.setFontSize(8);
      pdf.setTextColor(70, 130, 180);
      pdf.text('Detailed Results & History', 15, 20);
    }
  }
  
  return pdf;
};
