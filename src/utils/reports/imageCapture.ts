
/**
 * Utility functions for capturing component images for PDF reports
 */

/**
 * Capture waveform image from canvas element
 */
export const captureWaveformImage = async (canvasElement: HTMLCanvasElement): Promise<string> => {
  try {
    return canvasElement.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing waveform image:', error);
    return '';
  }
};

/**
 * Capture any DOM element as image using html2canvas
 */
export const captureElementAsImage = async (element: HTMLElement): Promise<string> => {
  try {
    // Create a temporary canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Set canvas size to match element
    const rect = element.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // For now, return a placeholder - in a real implementation,
    // you might use html2canvas library for complex DOM elements
    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing element as image:', error);
    return '';
  }
};

/**
 * Generate a simple waveform visualization as base64 image
 */
export const generateWaveformImage = (
  errors: Array<{ start: number; end: number; type: string }>,
  duration: number,
  width: number = 800,
  height: number = 120
): string => {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  canvas.width = width;
  canvas.height = height;

  // Fill white background
  ctx.fillStyle = 'white';
  ctx.fillRect(0, 0, width, height);

  // Draw base waveform
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  ctx.beginPath();
  
  for (let x = 0; x < width; x += 4) {
    const amplitude = Math.sin(x * 0.02) * 20 + Math.random() * 10;
    const y = height / 2 + amplitude;
    if (x === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Highlight error regions
  errors.forEach(error => {
    const startX = (error.start / duration) * width;
    const endX = (error.end / duration) * width;
    
    ctx.fillStyle = error.type === 'phoneme' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
    ctx.fillRect(startX, 0, endX - startX, height);
    
    // Draw error marker line
    ctx.strokeStyle = error.type === 'phoneme' ? '#ef4444' : '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, 0);
    ctx.lineTo(startX, height);
    ctx.stroke();
  });

  return canvas.toDataURL('image/png');
};

/**
 * Capture radar chart as image (placeholder for actual implementation)
 */
export const captureRadarChartImage = async (element: HTMLElement): Promise<string> => {
  try {
    // This would use html2canvas in a real implementation
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    canvas.width = 400;
    canvas.height = 400;

    // Fill white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 400, 400);

    // Draw placeholder radar chart
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    
    // Draw circles
    for (let i = 1; i <= 5; i++) {
      ctx.beginPath();
      ctx.arc(200, 200, i * 30, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw axes
    const axes = 6;
    for (let i = 0; i < axes; i++) {
      const angle = (i * 2 * Math.PI) / axes;
      ctx.beginPath();
      ctx.moveTo(200, 200);
      ctx.lineTo(200 + Math.cos(angle) * 150, 200 + Math.sin(angle) * 150);
      ctx.stroke();
    }

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Error capturing radar chart image:', error);
    return '';
  }
};
