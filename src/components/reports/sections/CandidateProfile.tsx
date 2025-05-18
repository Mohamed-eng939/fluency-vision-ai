
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

interface CandidateProfileProps {
  name: string;
  sessionId: string;
  dateOfTest: string;
  overallScore: number;
  cefrLevel: string;
  photoUrl?: string;
}

const CandidateProfile: React.FC<CandidateProfileProps> = ({
  name,
  sessionId,
  dateOfTest,
  overallScore,
  cefrLevel,
  photoUrl
}) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h2 className="text-lg font-semibold mb-3 text-assessment-blue">Candidate Profile</h2>
        
        <div className="flex items-center">
          <div className="mr-4">
            {photoUrl ? (
              <img 
                src={photoUrl} 
                alt={name} 
                className="w-16 h-16 rounded-full object-cover" 
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <User className="h-8 w-8 text-gray-500" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>
                <p className="text-sm text-gray-500">Name</p>
                <p className="font-medium">{name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Session ID</p>
                <p className="font-medium">{sessionId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of Test</p>
                <p className="font-medium">{dateOfTest}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Overall Score</p>
                <p className="font-medium">{overallScore}% ({cefrLevel})</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CandidateProfile;
