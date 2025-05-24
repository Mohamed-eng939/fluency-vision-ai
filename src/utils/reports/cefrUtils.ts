
export const getCEFRColor = (level: string) => {
  const colors: Record<string, string> = {
    'A1': '#ef4444',
    'A2': '#f97316', 
    'B1': '#eab308',
    'B2': '#22c55e',
    'C1': '#3b82f6',
    'C2': '#8b5cf6'
  };
  return colors[level] || '#9ca3af';
};
