
import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';
import { ChartContainer } from '@/components/ui/chart';

interface PronunciationRadarChartProps {
  pronunciationData: {
    wordAccuracy: number;
    phonemeAccuracy: number;
    speechRate: number;
    targetSpeechRate: string;
    overallScore: number;
    cefrLevel: string;
  };
  onImageReady?: (imageData: string) => void;
  forPDF?: boolean;
}

const PronunciationRadarChart: React.FC<PronunciationRadarChartProps> = ({
  pronunciationData,
  onImageReady,
  forPDF = false
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  // Normalize speech rate (assuming target ranges: A1-A2: 80-120, B1: 120-150, B2: 140-170, C1-C2: 160-200)
  const normalizedSpeechRate = Math.min(100, Math.max(0, (pronunciationData.speechRate / 200) * 100));
  
  // Calculate problematic ratio (inverted score - higher is better)
  const problematicRatio = Math.max(0, 100 - (pronunciationData.overallScore * 10));

  const radarData = [
    {
      metric: 'Word Accuracy',
      score: pronunciationData.wordAccuracy || 0,
      fullMark: 100
    },
    {
      metric: 'Phoneme Accuracy', 
      score: pronunciationData.phonemeAccuracy || 0,
      fullMark: 100
    },
    {
      metric: 'Speech Rate',
      score: normalizedSpeechRate,
      fullMark: 100
    },
    {
      metric: 'Clarity Score',
      score: 100 - problematicRatio,
      fullMark: 100
    }
  ];

  const chartConfig = {
    score: {
      label: "Score",
    },
  };

  useEffect(() => {
    if (forPDF && onImageReady) {
      // Delay to ensure chart is rendered
      const timer = setTimeout(() => {
        captureChartImage();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [forPDF, onImageReady]);

  const captureChartImage = async () => {
    if (!chartRef.current) return;

    try {
      // Find the SVG element within the chart
      const svgElement = chartRef.current.querySelector('svg');
      if (!svgElement) return;

      // Create a canvas to convert SVG to image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.onload = () => {
        canvas.width = 400;
        canvas.height = 300;
        
        // Fill white background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the SVG image
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        const imageData = canvas.toDataURL('image/png');
        onImageReady?.(imageData);
        
        URL.revokeObjectURL(svgUrl);
      };
      img.src = svgUrl;
    } catch (error) {
      console.error('Error capturing chart image:', error);
    }
  };

  const containerClass = forPDF 
    ? "pronunciation-radar-chart w-full h-80" 
    : "";

  return (
    <Card className={containerClass}>
      <CardHeader>
        <CardTitle className="text-assessment-blue">Pronunciation Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} className="w-full h-64">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e0e7ff" />
                <PolarAngleAxis dataKey="metric" fontSize={12} />
                <PolarRadiusAxis 
                  domain={[0, 100]} 
                  fontSize={10}
                  angle={90}
                  tickCount={6}
                />
                <Radar
                  name="Pronunciation Score"
                  dataKey="score"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                  dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">CEFR Level:</span> {pronunciationData.cefrLevel}
          </div>
          <div>
            <span className="font-medium">Overall Score:</span> {pronunciationData.overallScore.toFixed(1)}/10
          </div>
          <div>
            <span className="font-medium">Speech Rate:</span> {pronunciationData.speechRate.toFixed(0)} wpm
          </div>
          <div>
            <span className="font-medium">Target Rate:</span> {pronunciationData.targetSpeechRate}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PronunciationRadarChart;
