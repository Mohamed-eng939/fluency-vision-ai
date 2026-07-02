
import React from 'react';

interface ApiStatusIndicatorProps {
  isApiAvailable: boolean;
}

const ApiStatusIndicator: React.FC<ApiStatusIndicatorProps> = ({ isApiAvailable }) => {
  if (!isApiAvailable) return null;
  
  return (
    <div className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md inline-block mb-3">
      Advanced speech analysis active
    </div>
  );
};

export default ApiStatusIndicator;
