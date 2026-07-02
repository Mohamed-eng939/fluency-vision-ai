
import React from 'react';
import { useBrandingContext } from '@/contexts/branding/BrandingContext';

interface ReportHeaderProps {
  title: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ title }) => {
  const brand = useBrandingContext();
  return (
    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6 print:pb-2">
      <div className="flex items-center">
        <div
          className="w-12 h-12 mr-4 rounded-full flex items-center justify-center text-white font-bold text-lg"
          style={{ backgroundColor: 'var(--brand-primary, #1a56db)' }}
        >
          {brand.initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-assessment-blue">{title}</h1>
          <p className="text-sm text-gray-600">{brand.displayName}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">Generated: {new Date().toLocaleDateString()}</p>
        <p className="text-xs text-gray-600">©{new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default ReportHeader;
