
/**
 * PDF Styling and CSS Management
 */

/**
 * Generate enhanced print-specific CSS styles
 */
export const getPrintStyles = (): string => {
  return `
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
};

/**
 * Apply print styles to document
 */
export const applyPrintStyles = (): HTMLStyleElement => {
  const styleEl = document.createElement('style');
  styleEl.id = 'print-styles';
  styleEl.textContent = getPrintStyles();
  document.head.appendChild(styleEl);
  return styleEl;
};

/**
 * Remove print styles from document
 */
export const removePrintStyles = (): void => {
  const styleEl = document.getElementById('print-styles');
  if (styleEl) {
    document.head.removeChild(styleEl);
  }
};
