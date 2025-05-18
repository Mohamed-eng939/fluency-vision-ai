
import React from 'react';
import { Progress } from '@/components/ui/progress';

interface SkillScoreProgressProps {
  value: number;
  height?: string;
  color?: string;
}

const SkillScoreProgress: React.FC<SkillScoreProgressProps> = ({ 
  value,
  height = "h-2",
  color
}) => {
  // Determine color class based on score
  let colorClass;
  
  if (color) {
    colorClass = color;
  } else if (value >= 80) {
    colorClass = "#10b981"; // Green for high scores
  } else if (value >= 60) {
    colorClass = "#0ea5e9"; // Blue for good scores
  } else if (value >= 40) {
    colorClass = "#f59e0b"; // Yellow/amber for average scores
  } else {
    colorClass = "#ef4444"; // Red for low scores
  }
  
  return (
    <Progress 
      value={value} 
      className={height}
      style={{ 
        '--progress-indicator-color': colorClass 
      } as React.CSSProperties}
    />
  );
};

export default SkillScoreProgress;
