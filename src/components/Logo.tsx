
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
        <div className={`${sizeClasses[size]} aspect-square rounded-full bg-gradient-to-br from-assessment-teal to-assessment-blue flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute w-2/3 h-2/3 rounded-full border-4 border-white opacity-90"></div>
          <div className="absolute w-1/4 h-1/2 bg-white transform translate-y-1/4 rounded-sm"></div>
        </div>
        <div className="absolute top-0 right-0 transform translate-x-1/3 -translate-y-1/3">
          <div className={`${size === 'sm' ? 'h-3' : size === 'md' ? 'h-4' : 'h-6'} aspect-square rounded-full bg-assessment-blue flex items-center justify-center relative animate-pulse`}>
            <div className="w-1/2 h-1/2 bg-white transform rotate-45"></div>
          </div>
        </div>
      </div>
      {variant === 'full' && (
        <div className="text-assessment-blue font-bold">
          <span className={size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-2xl'}>Lingua<span className="text-assessment-teal">Speak</span> AI</span>
        </div>
      )}
    </div>
  );
};

export default Logo;
