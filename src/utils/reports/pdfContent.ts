
/**
 * PDF Content Preparation and Manipulation
 */

import { PDFOptions } from './pdfOptions';

/**
 * Embed images into placeholders for PDF generation
 */
export const embedImages = (element: HTMLElement, options: PDFOptions): void => {
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
};

/**
 * Add prompt history section to report content
 */
export const addPromptHistorySection = (
  element: HTMLElement, 
  promptHistory: { prompt: any; result?: any }[]
): void => {
  if (promptHistory.length === 0) return;

  const historySection = document.createElement('div');
  historySection.className = 'prompt-history-section pdf-page-break';
  historySection.innerHTML = `
    <h2 class="text-xl font-bold mb-4 text-assessment-blue border-b pb-2">Question & Answer History</h2>
    ${promptHistory.map((item, index) => `
      <div class="mb-6 p-4 border rounded-lg">
        <h3 class="font-semibold mb-2">Question ${index + 1}: ${item.prompt.cefrLevel} Level</h3>
        <p class="text-sm text-gray-600 mb-2">${item.prompt.text}</p>
        ${item.result?.transcript ? `
          <div class="mt-2">
            <h4 class="font-medium text-sm">Your Response:</h4>
            <p class="text-sm bg-gray-50 p-2 rounded">${item.result.transcript}</p>
          </div>
        ` : ''}
        ${item.result ? `
          <div class="mt-2 text-xs text-gray-500">
            Score: ${Math.round(item.result.totalScore)}% | CEFR: ${item.result.cefrLevel}
          </div>
        ` : ''}
      </div>
    `).join('')}
  `;
  element.appendChild(historySection);
};

/**
 * Add strategic page breaks to improve PDF layout
 */
export const addPageBreaks = (element: HTMLElement): void => {
  const sections = element.querySelectorAll('.card, .pronunciation-analysis-section, .prompt-history-section');
  sections.forEach((section, index) => {
    if (index > 0 && index % 3 === 0) { // Add page break every 3 sections
      section.classList.add('pdf-page-break');
    }
  });
};

/**
 * Make all tab content visible for PDF generation
 */
export const makeAllTabsVisible = (element: HTMLElement): void => {
  const tabContents = element.querySelectorAll('[data-state="inactive"]');
  tabContents.forEach(content => {
    (content as HTMLElement).style.display = 'block';
    content.setAttribute('data-state', 'active');
  });
};

/**
 * Restore tab states after PDF generation
 */
export const restoreTabStates = (element: HTMLElement): void => {
  const tabContents = element.querySelectorAll('[data-state="active"]');
  tabContents.forEach((content, index) => {
    if (index > 0) { // Keep first tab active, hide others
      (content as HTMLElement).style.display = '';
      content.setAttribute('data-state', 'inactive');
    }
  });
};

/**
 * Clean up added content after PDF generation
 */
export const cleanupAddedContent = (element: HTMLElement): void => {
  // Remove prompt history section
  const addedSection = element.querySelector('.prompt-history-section');
  if (addedSection) {
    addedSection.remove();
  }

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

  // Remove PDF generation class
  element.classList.remove('generating-pdf');
};
