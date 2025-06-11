
/**
 * PDF Generator Utility
 * Enhanced version with page numbers, watermarks, and better formatting
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
 * Generate PDF report from HTML element with enhanced formatting
 */
export const generateReportPdf = async (
  element: HTMLElement, 
  options: PDFOptions = {}
): Promise<void> => {
  // Apply print-specific styles and embed images
  await applyPrintStylesAndImages(element, options);
  
  const fileName = options.fileName || `assessment-report-${Date.now()}.pdf`;
  
  // Configure PDF options with enhanced settings
  const pdfOptions = {
    margin: [15, 15, 20, 15], // Top, Right, Bottom, Left margins
    filename: fileName,
    image: { type: 'jpeg', quality: 0.95 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      allowTaint: true,
      foreignObjectRendering: true,
      scrollX: 0,
      scrollY: 0
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
    // Generate PDF with page numbers
    const pdf = html2pdf()
      .set(pdfOptions)
      .from(element)
      .toPdf()
      .get('pdf')
      .then((pdf: any) => {
        // Add page numbers and header/footer
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
          
          // Add CEFR watermark (light gray)
          if (i === 1) {
            pdf.setFontSize(60);
            pdf.setTextColor(240, 240, 240);
            pdf.text('CEFR', pageWidth / 2 - 30, pdf.internal.pageSize.getHeight() / 2, {
              angle: 45
            });
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
  
  // Add enhanced print-specific styles
  styleEl.textContent = `
    .generating-pdf {
      background-color: white !important;
      color: black !important;
      font-size: 11pt !important;
      line-height: 1.4 !important;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important;
    }
    
    .generating-pdf * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    .generating-pdf h1 {
      font-size: 20pt !important;
      page-break-after: avoid !important;
      margin-bottom: 8pt !important;
    }
    
    .generating-pdf h2 {
      font-size: 16pt !important;
      page-break-after: avoid !important;
      margin-bottom: 6pt !important;
      border-bottom: 1px solid #ddd !important;
      padding-bottom: 4pt !important;
    }
    
    .generating-pdf h3 {
      font-size: 14pt !important;
      page-break-after: avoid !important;
      margin-bottom: 4pt !important;
    }

    .generating-pdf .pdf-page-break {
      page-break-before: always !important;
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
    }

    .generating-pdf table {
      border-collapse: collapse !important;
      width: 100% !important;
    }

    .generating-pdf td, .generating-pdf th {
      border: 1px solid #ddd !important;
      padding: 8pt !important;
      text-align: left !important;
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
  `;
  
  document.head.appendChild(styleEl);
  
  // Add page break markers
  addPageBreaks(element);
};

/**
 * Add strategic page breaks to improve PDF layout
 */
const addPageBreaks = (element: HTMLElement): void => {
  const sections = element.querySelectorAll('.card, .pronunciation-analysis-section');
  sections.forEach((section, index) => {
    if (index > 0 && index % 2 === 0) { // Add page break every 2 sections
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
