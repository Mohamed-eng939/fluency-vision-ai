
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
  waveformImage?: string;
  radarChartImage?: string;
}

/**
 * Generate PDF report from HTML element with embedded images
 */
export const generateReportPdf = async (
  element: HTMLElement, 
  options: PDFOptions = {}
): Promise<void> => {
  // Apply print-specific styles and embed images
  await applyPrintStylesAndImages(element, options);
  
  const fileName = options.fileName || `assessment-report-${Date.now()}.pdf`;
  
  // Configure PDF options
  const pdfOptions = {
    margin: [10, 10, 10, 10],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      letterRendering: true,
      allowTaint: true,
      foreignObjectRendering: true 
    },
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
 * Apply print-specific styles and embed captured images
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
      img.style.maxHeight = '120px';
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
      img.style.maxHeight = '300px';
      img.alt = 'Pronunciation Radar Chart';
      radarPlaceholder.innerHTML = '';
      radarPlaceholder.appendChild(img);
    }
  }
  
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

    .generating-pdf .waveform-placeholder img,
    .generating-pdf .radar-chart-placeholder img {
      border: 1px solid #e5e7eb !important;
      border-radius: 8px !important;
      margin: 10px 0 !important;
    }

    .generating-pdf .pronunciation-section {
      page-break-inside: avoid !important;
      margin-bottom: 20px !important;
    }
  `;
  
  document.head.appendChild(styleEl);
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
  
  const styleEl = document.getElementById('print-styles');
  if (styleEl) {
    document.head.removeChild(styleEl);
  }
};

/**
 * Capture images from visualization components
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
