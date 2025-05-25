
import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText } from 'lucide-react';
import { getCEFRColor } from '@/utils/reports/cefrUtils';

interface ReportInfoProps {
  report: any;
}

const ReportInfo: React.FC<ReportInfoProps> = ({ report }) => {
  return (
    <Card className="mb-6 shadow-lg print:shadow-none">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 print:bg-white">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-assessment-blue mb-2">
              <FileText className="h-5 w-5 inline mr-2" />
              {report.name}
            </CardTitle>
            <CardDescription className="text-base">
              <span className="font-medium">Assessment Date:</span> {new Date(report.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </CardDescription>
            <CardDescription className="text-base">
              <span className="font-medium">Assessment Type:</span> {report.testType}
            </CardDescription>
            <CardDescription className="text-base">
              <span className="font-medium">Email:</span> {report.email}
            </CardDescription>
          </div>
          <div className="text-right">
            <Badge 
              className="text-lg px-4 py-2 mb-2"
              style={{ 
                backgroundColor: getCEFRColor(report.cefr),
                color: 'white'
              }}
            >
              CEFR Level: {report.cefr}
            </Badge>
            <div className="text-2xl font-bold text-assessment-blue">
              Level: {report.cefr}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
};

export default ReportInfo;
