
/**
 * PDF Content Preparation and Manipulation
 */

import { PDFOptions } from './pdfOptions';

/**
 * Embed images into placeholders for PDF generation
 */
export const embedImages = (element: HTMLElement, options: PDFOptions): void => {
  console.log('Embedding images for PDF');
  
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

  console.log('Adding prompt history section');
  
  const historySection = document.createElement('div');
  historySection.className = 'prompt-history-section pdf-page-break p-6';
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
  console.log('Adding page breaks');
  
  const sections = element.querySelectorAll('.card');
  sections.forEach((section, index) => {
    if (index > 0 && index % 2 === 0) { // Add page break every 2 sections
      section.classList.add('pdf-page-break');
    }
  });
};

/**
 * Make all tab content visible for PDF generation
 */
export const makeAllTabsVisible = (element: HTMLElement): void => {
  console.log('Making all tabs visible');
  
  // Show all tab content
  const tabContents = element.querySelectorAll('[data-state="inactive"]');
  tabContents.forEach(content => {
    (content as HTMLElement).style.display = 'block';
    (content as HTMLElement).style.visibility = 'visible';
    content.setAttribute('data-state', 'active');
  });
  
  // Show hidden elements
  const hiddenElements = element.querySelectorAll('.hidden, [style*="display: none"]');
  hiddenElements.forEach(el => {
    (el as HTMLElement).style.display = 'block';
    (el as HTMLElement).style.visibility = 'visible';
    el.classList.remove('hidden');
  });
};

/**
 * Restore tab states after PDF generation
 */
export const restoreTabStates = (element: HTMLElement): void => {
  // Note: This function doesn't need to do much since we're working with a clone
  console.log('Restoring tab states');
};

/**
 * Clean up added content after PDF generation
 */
export const cleanupAddedContent = (element: HTMLElement): void => {
  console.log('Cleaning up added content');
  
  // Remove prompt history section
  const addedSection = element.querySelector('.prompt-history-section');
  if (addedSection) {
    addedSection.remove();
  }

  // Remove page break classes
  const pageBreaks = element.querySelectorAll('.pdf-page-break');
  pageBreaks.forEach(el => el.classList.remove('pdf-page-break'));

  // Remove PDF generation class
  element.classList.remove('generating-pdf');
};
