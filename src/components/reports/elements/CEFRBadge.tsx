
import React from 'react';
import { CEFRLevel } from '@/types/assessment';

interface CEFRBadgeProps {
  level: CEFRLevel;
  size?: 'small' | 'medium' | 'large';
}

const CEFRBadge: React.FC<CEFRBadgeProps> = ({ 
  level,
  size = 'medium'
}) => {
  // Define color schemes for different CEFR levels
  const colorScheme = {
    'C2': { background: '#10b981', text: '#ffffff' },     // Green
    'C1+': { background: '#14b8a6', text: '#ffffff' },   // Teal-green
    'C1': { background: '#0ea5e9', text: '#ffffff' },     // Blue
    'B2+': { background: '#3b82f6', text: '#ffffff' },   // Medium blue
    'B2': { background: '#6366f1', text: '#ffffff' },     // Indigo
    'B1+': { background: '#8b5cf6', text: '#ffffff' },   // Purple
    'B1': { background: '#a855f7', text: '#ffffff' },     // Purple-pink
    'A2+': { background: '#d946ef', text: '#ffffff' },   // Pink
    'A2': { background: '#ec4899', text: '#ffffff' },     // Hot pink
    'A1+': { background: '#f43f5e', text: '#ffffff' },   // Red-pink
    'A1': { background: '#ef4444', text: '#ffffff' },     // Red
    'Pre-A1': { background: '#f97316', text: '#ffffff' }, // Orange
  };
  
  // Get color for the current level
  const colors = colorScheme[level] || { background: '#9ca3af', text: '#ffffff' }; // Gray default

  // Define size classes
  const sizeClasses = {
    small: 'w-12 h-12 text-lg',
    medium: 'w-20 h-20 text-2xl',
    large: 'w-28 h-28 text-3xl'
  };

  return (
    <div 
      className={`flex items-center justify-center rounded-full ${sizeClasses[size]}`}
      style={{ backgroundColor: colors.background }}
    >
      <span 
        className="font-bold"
        style={{ color: colors.text }}
      >
        {level}
      </span>
    </div>
  );
};

export default CEFRBadge;
