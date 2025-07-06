
/**
 * PDF-specific styles for better print rendering
 */

let printStyleSheet: HTMLStyleElement | null = null;

export const applyPrintStyles = (): void => {
  if (printStyleSheet) return; // Already applied

  printStyleSheet = document.createElement('style');
  printStyleSheet.textContent = `
    @media print, screen {
      .generating-pdf {
        background: white !important;
        color: black !important;
      }
      
      .generating-pdf * {
        -webkit-print-color-adjust: exact !important;
        color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      
      .generating-pdf .card {
        border: 1px solid #e5e7eb !important;
        box-shadow: none !important;
        page-break-inside: avoid;
        margin-bottom: 1rem !important;
      }
      
      .generating-pdf .tabs-content {
        display: block !important;
      }
      
      .generating-pdf [data-state="inactive"] {
        display: block !important;
        visibility: visible !important;
      }
      
      .generating-pdf .hidden {
        display: block !important;
      }
      
      .pdf-page-break {
        page-break-before: always !important;
      }
      
      .generating-pdf .text-assessment-blue {
        color: #0A2463 !important;
      }
      
      .generating-pdf .text-assessment-teal {
        color: #3BCEAC !important;
      }
      
      .generating-pdf .bg-assessment-teal {
        background-color: #3BCEAC !important;
      }
      
      .generating-pdf .border-assessment-teal {
        border-color: #3BCEAC !important;
      }
      
      .generating-pdf .progress-bar {
        background-color: #e5e7eb !important;
      }
      
      .generating-pdf .progress-bar > div {
        background-color: #3BCEAC !important;
      }
      
      .generating-pdf .recharts-wrapper {
        background: white !important;
      }
      
      .generating-pdf .print\\:hidden {
        display: none !important;
      }
      
      .generating-pdf .print\\:block {
        display: block !important;
      }
    }
  `;
  
  document.head.appendChild(printStyleSheet);
};

export const removePrintStyles = (): void => {
  if (printStyleSheet) {
    document.head.removeChild(printStyleSheet);
    printStyleSheet = null;
  }
};
