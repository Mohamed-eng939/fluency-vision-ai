
import React from 'react';
import { Mic } from 'lucide-react';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full' }) => {
  const brand = useBrandingContext();
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  const iconSize = {
    sm: 14,
    md: 18,
    lg: 24
  };

  return (
    <div className={`flex items-center ${variant === 'full' ? 'space-x-2' : ''}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Hexagon container with circuit lines */}
        <div className={`${sizeClasses[size]} aspect-square relative`}>
          {/* Main hexagon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Circuit lines */}
              <path 
                d="M0,50 H20 M80,50 H100 M30,20 Q40,10 50,20 Q60,30 70,20 M30,80 Q40,90 50,80 Q60,70 70,80" 
                stroke="#3BCEAC" 
                strokeWidth="2" 
                fill="none" 
                className="animate-pulse"
              />
              
              {/* Hexagon shape */}
              <polygon 
                points="50,15 85,33 85,67 50,85 15,67 15,33" 
                fill="#0A2463" 
                stroke="#3BCEAC" 
                strokeWidth="2" 
              />
              
              {/* Sound wave line */}
              <path 
                d="M30,50 Q40,30 50,50 Q60,70 70,50" 
                stroke="white" 
                strokeWidth="2" 
                fill="none" 
              />
            </svg>
          </div>
          
          {/* Microphone icon in center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Mic 
              size={iconSize[size]} 
              className="text-white" 
              strokeWidth={2.5} 
            />
          </div>
          
          {/* Small circuit node accents */}
          <div className="absolute top-1/4 right-0 h-1.5 w-1.5 rounded-full bg-assessment-highlight animate-pulse"></div>
          <div className="absolute bottom-1/4 left-0 h-1.5 w-1.5 rounded-full bg-assessment-highlight animate-pulse"></div>
        </div>
      </div>
      
      {variant === 'full' && (
        <div className="flex flex-col">
          <div className={`font-bold text-assessment-blue ${size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}`}>
            {brand.displayName}
          </div>
          {brand.tagline && (
            <div className="text-xs text-gray-600 -mt-1">{brand.tagline}</div>
          )}
        </div>
      )}
    </div>
  );
};

export default Logo;
