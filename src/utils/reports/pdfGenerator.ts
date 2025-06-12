
/**
 * PDF Generator Utility
 * Enhanced version with comprehensive content inclusion and proper formatting
 */

import html2pdf from 'html2pdf.js';

interface PDFOptions {
  fileName?: string;
  learnerName?: string;
  sessionId?: string;
  dateOfTest?: string;
  waveformImage?: string;
  radarChartImage?: string;
}

/**
 * Generate PDF report from HTML element with enhanced formatting and complete content
 */
export const generateReportPdf = async (
  element: HTMLElement, 
  options: PDFOptions = {}
): Promise<void> => {
  // Apply print-specific styles and embed images
  await applyPrintStylesAndImages(element, options);
  
  const fileName = options.fileName || `assessment-report-${Date.now()}.pdf`;
  
  // Configure PDF options with enhanced settings for better content handling
  const pdfOptions = {
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
  
  try {
    // Generate PDF with page numbers and section headers
    const pdf = html2pdf()
      .set(pdfOptions)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        // Add page numbers and headers
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
      })
      .save();
    
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
 * Apply enhanced print-specific styles and embed captured images
 */
const applyPrintStylesAndImages = async (element: HTMLElement, options: PDFOptions): Promise<void> => {
  // Add a class for print styling
  element.classList.add('generating-pdf');
  
  // Embed waveform image if provided
  if (options.waveformImage) {
    const waveformPlaceholder = element.querySelector('.waveform-placeholder');
    if (waveformPlaceholder) {
      const img = document.createElement('img');
      img.src = options.waveformImage;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.maxHeight = '150px';
      img.alt = 'Audio Waveform Analysis';
      waveformPlaceholder.innerHTML = '';
      waveformPlaceholder.appendChild(img);
    }
  }

  // Embed radar chart image if provided
  if (options.radarChartImage) {
    const radarPlaceholder = element.querySelector('.radar-chart-placeholder');
    if (radarPlaceholder) {
      const img = document.createElement('img');
      img.src = options.radarChartImage;
      img.style.width = '100%';
      img.style.height = 'auto';
      img.style.maxHeight = '350px';
      img.alt = 'Pronunciation Radar Chart';
      radarPlaceholder.innerHTML = '';
      radarPlaceholder.appendChild(img);
    }
  }
  
  // Create a style element for enhanced print-specific styles
  const styleEl = document.createElement('style');
  styleEl.id = 'print-styles';
  
  // Add enhanced print-specific styles with better content handling
  styleEl.textContent = `
    .generating-pdf {
      background-color: white !important;
      color: black !important;
      font-size: 11pt !important;
      line-height: 1.4 !important;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
      max-width: none !important;
      width: 100% !important;
    }
    
    .generating-pdf * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      box-sizing: border-box !important;
    }
    
    .generating-pdf h1 {
      font-size: 18pt !important;
      page-break-after: avoid !important;
      margin-bottom: 8pt !important;
      color: #0A2463 !important;
    }
    
    .generating-pdf h2 {
      font-size: 14pt !important;
      page-break-after: avoid !important;
      margin-bottom: 6pt !important;
      border-bottom: 1px solid #ddd !important;
      padding-bottom: 4pt !important;
      color: #0A2463 !important;
    }
    
    .generating-pdf h3 {
      font-size: 12pt !important;
      page-break-after: avoid !important;
      margin-bottom: 4pt !important;
      color: #0A2463 !important;
    }

    .generating-pdf h4 {
      font-size: 11pt !important;
      margin-bottom: 3pt !important;
      color: #247BA0 !important;
    }

    .generating-pdf .pdf-page-break {
      page-break-before: always !important;
    }

    .generating-pdf .prompt-history-section {
      page-break-before: always !important;
      margin-top: 20pt !important;
    }

    .generating-pdf .waveform-placeholder img,
    .generating-pdf .radar-chart-placeholder img {
      border: 1px solid #e5e7eb !important;
      border-radius: 8px !important;
      margin: 10px 0 !important;
      max-width: 100% !important;
      height: auto !important;
    }

    .generating-pdf .pronunciation-section,
    .generating-pdf .card {
      page-break-inside: avoid !important;
      margin-bottom: 15pt !important;
      border: 1px solid #e5e7eb !important;
      padding: 10pt !important;
      border-radius: 6px !important;
    }

    .generating-pdf table {
      border-collapse: collapse !important;
      width: 100% !important;
      margin-bottom: 10pt !important;
    }

    .generating-pdf td, .generating-pdf th {
      border: 1px solid #ddd !important;
      padding: 6pt !important;
      text-align: left !important;
      font-size: 10pt !important;
    }

    .generating-pdf .chart-container {
      page-break-inside: avoid !important;
    }

    .generating-pdf .skills-grid {
      display: block !important;
    }

    .generating-pdf .grid {
      display: block !important;
    }

    .generating-pdf .flex {
      display: block !important;
    }

    .generating-pdf .tab-content {
      display: block !important;
    }

    .generating-pdf .tabs-list {
      display: none !important;
    }

    .generating-pdf .badge {
      background-color: #f0f0f0 !important;
      color: #333 !important;
      padding: 2pt 4pt !important;
      border-radius: 3px !important;
      font-size: 9pt !important;
    }
  `;
  
  document.head.appendChild(styleEl);
  
  // Add page break markers
  addPageBreaks(element);
  
  // Ensure all tab content is visible for PDF
  makeAllTabsVisible(element);
};

/**
 * Make all tab content visible for PDF generation
 */
const makeAllTabsVisible = (element: HTMLElement): void => {
  const tabContents = element.querySelectorAll('[data-state="inactive"]');
  tabContents.forEach(content => {
    (content as HTMLElement).style.display = 'block';
    content.setAttribute('data-state', 'active');
  });
};

/**
 * Add strategic page breaks to improve PDF layout
 */
const addPageBreaks = (element: HTMLElement): void => {
  const sections = element.querySelectorAll('.card, .pronunciation-analysis-section, .prompt-history-section');
  sections.forEach((section, index) => {
    if (index > 0 && index % 3 === 0) { // Add page break every 3 sections
      section.classList.add('pdf-page-break');
    }
  });
};

/**
 * Remove print-specific styles and embedded images
 */
const removePrintStyles = (element: HTMLElement): void => {
  element.classList.remove('generating-pdf');
  
  // Remove embedded images and restore placeholders
  const waveformPlaceholder = element.querySelector('.waveform-placeholder');
  if (waveformPlaceholder) {
    waveformPlaceholder.innerHTML = '<div class="w-full h-30 bg-gray-100 rounded flex items-center justify-center">Waveform visualization</div>';
  }

  const radarPlaceholder = element.querySelector('.radar-chart-placeholder');
  if (radarPlaceholder) {
    radarPlaceholder.innerHTML = '<div class="w-full h-64 bg-gray-100 rounded flex items-center justify-center">Pronunciation radar chart</div>';
  }
  
  // Remove page break classes
  const pageBreaks = element.querySelectorAll('.pdf-page-break');
  pageBreaks.forEach(el => el.classList.remove('pdf-page-break'));
  
  // Restore tab states
  const tabContents = element.querySelectorAll('[data-state="active"]');
  tabContents.forEach((content, index) => {
    if (index > 0) { // Keep first tab active, hide others
      (content as HTMLElement).style.display = '';
      content.setAttribute('data-state', 'inactive');
    }
  });
  
  const styleEl = document.getElementById('print-styles');
  if (styleEl) {
    document.head.removeChild(styleEl);
  }
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
