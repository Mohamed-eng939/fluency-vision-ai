
import React from 'react';

interface SummaryStatsProps {
  summaryStats: {
    wordAccuracy?: number;
    phonemeAccuracy?: number;
    speechRate?: number;
    targetSpeechRate?: string;
    overallScore?: number;
    cefrLevel?: string;
  };
}

const SummaryStats: React.FC<SummaryStatsProps> = ({ summaryStats }) => {
  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-4 mb-4">
      <h4 className="font-medium text-blue-800 mb-3">Pronunciation Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        {summaryStats.overallScore && (
          <div>
            <span className="text-gray-600">Overall Score:</span>
            <div className="font-semibold text-blue-700">
              {summaryStats.overallScore.toFixed(1)}/9 ({summaryStats.cefrLevel})
            </div>
          </div>
        )}
        {summaryStats.wordAccuracy && (
          <div>
            <span className="text-gray-600">Word Accuracy:</span>
            <div className="font-semibold text-blue-700">
              {(summaryStats.wordAccuracy * 100).toFixed(0)}%
            </div>
          </div>
        )}
        {summaryStats.phonemeAccuracy && (
          <div>
            <span className="text-gray-600">Sound Accuracy:</span>
            <div className="font-semibold text-blue-700">
              {(summaryStats.phonemeAccuracy * 100).toFixed(0)}%
            </div>
          </div>
        )}
        {summaryStats.speechRate && (
          <div>
            <span className="text-gray-600">Speech Rate:</span>
            <div className="font-semibold text-blue-700">
              {summaryStats.speechRate.toFixed(0)} wpm
              {summaryStats.targetSpeechRate && (
                <div className="text-xs text-gray-500">
                  Target: {summaryStats.targetSpeechRate}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryStats;
