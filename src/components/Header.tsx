
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-assessment-blue text-white py-4">
      <div className="assessment-container">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold">
            FluencyVision AI
          </h1>
          <div className="text-sm sm:text-base">
            <span className="hidden sm:inline">AI-Powered</span>{" "}
            <span className="bg-assessment-teal text-assessment-blue px-2 py-1 rounded font-bold">
              Language Assessment
            </span>
          </div>
        </div>
        <p className="mt-2 text-sm sm:text-base opacity-90">
          Advanced language proficiency evaluation with detailed feedback
        </p>
      </div>
    </header>
  );
};

export default Header;
