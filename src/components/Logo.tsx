
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
}

const Logo: React.FC<LogoProps> = ({ size = 'md', variant = 'full' }) => {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-12'
  };

  return (
    <div className={`flex items-center ${variant === 'full' ? 'space-x-2' : ''}`}>
      <div className={`relative ${sizeClasses[size]}`}>
        <div className={`${sizeClasses[size]} aspect-square rounded-full bg-gradient-to-br from-assessment-blue to-assessment-teal flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-3/4 h-3/4 text-white">
              <g transform="translate(50 50)">
                {/* Sound wave design */}
                <path 
                  d="M-30,0 Q-20,-30 0,-30 Q20,-30 30,0 Q20,30 0,30 Q-20,30 -30,0 Z" 
                  fill="rgba(255,255,255,0.8)" 
                />
                <path 
                  d="M-15,0 Q-10,-15 0,-15 Q10,-15 15,0 Q10,15 0,15 Q-10,15 -15,0 Z" 
                  fill="rgba(255,255,255,0.6)" 
                  className="animate-pulse"
                />
                {/* Speech lines */}
                <line x1="-25" y1="0" x2="-40" y2="0" stroke="white" strokeWidth="3" />
                <line x1="25" y1="0" x2="40" y2="0" stroke="white" strokeWidth="3" />
              </g>
            </svg>
          </div>
        </div>

        {/* Accent element */}
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
          <div className={`${size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : 'h-6'} aspect-square rounded-full bg-assessment-highlight flex items-center justify-center relative animate-pulse`}>
            <div className="w-1/2 h-1/2 bg-white transform rotate-45"></div>
          </div>
        </div>
      </div>
      
      {variant === 'full' && (
        <div className="text-assessment-blue font-bold">
          <div className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}>
            <span className="text-assessment-teal">Lingua</span>
            <span className="text-assessment-blue">Speak</span>
            <span className="ml-1 bg-assessment-blue text-white px-1 rounded text-sm align-top">AI</span>
          </div>
          <div className="text-xs text-gray-500 -mt-1">Master Your Language Journey</div>
        </div>
      )}
    </div>
  );
};

export default Logo;
