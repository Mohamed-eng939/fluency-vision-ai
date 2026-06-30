
import React from 'react';
import logoPath from '@/assets/logo.png'; // Replace with actual logo path

interface ReportHeaderProps {
  title: string;
}

const ReportHeader: React.FC<ReportHeaderProps> = ({ title }) => {
  return (
    <div className="flex justify-between items-center border-b border-gray-300 pb-4 mb-6 print:pb-2">
      <div className="flex items-center">
        <div className="w-12 h-12 mr-4 bg-assessment-teal rounded-full flex items-center justify-center text-white font-bold text-2xl">
          L
        </div>
        <div>
          <h1 className="text-2xl font-bold text-assessment-blue">{title}</h1>
          <p className="text-sm text-gray-600">English Placement Assessment</p>
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
