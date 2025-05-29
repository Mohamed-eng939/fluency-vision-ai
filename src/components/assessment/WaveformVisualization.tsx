import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Volume2 } from 'lucide-react';

interface TimestampError {
  start: number;
  end: number;
  type: 'phoneme' | 'pause' | 'disfluency';
  message: string;
  phoneme?: string;
}

interface WaveformVisualizationProps {
  audioUrl?: string;
  errors: TimestampError[];
  duration?: number;
  onTimeUpdate?: (currentTime: number) => void;
  onImageReady?: (imageData: string) => void;
  forPDF?: boolean;
}

export interface WaveformVisualizationRef {
  captureImage: () => string;
}

const WaveformVisualization = forwardRef<WaveformVisualizationRef, WaveformVisualizationProps>(({
  audioUrl,
  errors,
  duration = 10,
  onTimeUpdate,
  onImageReady,
  forPDF = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hoveredError, setHoveredError] = useState<TimestampError | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useImperativeHandle(ref, () => ({
    captureImage: () => {
      if (canvasRef.current) {
        return canvasRef.current.toDataURL('image/png');
      }
      return '';
    }
  }));

  useEffect(() => {
    drawWaveform();
    
    // If this is for PDF generation, capture image after drawing
    if (forPDF && onImageReady) {
      setTimeout(() => {
        const imageData = canvasRef.current?.toDataURL('image/png') || '';
        onImageReady(imageData);
      }, 100);
    }
  }, [errors, currentTime, duration, forPDF]);

  const drawWaveform = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);

    // Fill white background for PDF
    if (forPDF) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, width, height);
    }

    // Draw base waveform (simplified representation)
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < width; x += 4) {
      const amplitude = Math.sin(x * 0.02) * 20 + Math.random() * 10;
      const y = height / 2 + amplitude;
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Highlight error regions
    errors.forEach(error => {
      const startX = (error.start / duration) * width;
      const endX = (error.end / duration) * width;
      
      ctx.fillStyle = error.type === 'phoneme' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
      ctx.fillRect(startX, 0, endX - startX, height);
      
      // Draw error marker line
      ctx.strokeStyle = error.type === 'phoneme' ? '#ef4444' : '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(startX, 0);
      ctx.lineTo(startX, height);
      ctx.stroke();
    });

    // Draw current time indicator (only if not for PDF)
    if (!forPDF) {
      const currentX = (currentTime / duration) * width;
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(currentX, 0);
      ctx.lineTo(currentX, height);
      ctx.stroke();
    }
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !audioRef.current) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const clickTime = (x / canvas.width) * duration;
    
    audioRef.current.currentTime = clickTime;
    setCurrentTime(clickTime);
    onTimeUpdate?.(clickTime);
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const hoverTime = (x / canvas.width) * duration;

    setMousePosition({ x: event.clientX, y: event.clientY });

    // Find error at current position
    const error = errors.find(e => hoverTime >= e.start && hoverTime <= e.end);
    setHoveredError(error || null);
  };

  const togglePlayPause = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const time = audioRef.current.currentTime;
      setCurrentTime(time);
      onTimeUpdate?.(time);
    }
  };

  // For PDF mode, return simplified version
  if (forPDF) {
    return (
      <div className="waveform-for-pdf">
        <canvas
          ref={canvasRef}
          width={800}
          height={120}
          className="w-full h-30 border rounded"
        />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Volume2 className="h-5 w-5" />
          Audio Analysis Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              onTimeUpdate={handleTimeUpdate}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          )}
          
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayPause}
              disabled={!audioUrl}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <span className="text-sm text-gray-600">
              {currentTime.toFixed(1)}s / {duration.toFixed(1)}s
            </span>
          </div>

          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={120}
              className="w-full h-30 border rounded cursor-pointer"
              onClick={handleCanvasClick}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={() => setHoveredError(null)}
            />
            
            {hoveredError && (
              <div
                className="absolute z-10 bg-black text-white text-xs p-2 rounded shadow-lg pointer-events-none"
                style={{
                  left: mousePosition.x - 100,
                  top: mousePosition.y - 60,
                  maxWidth: '200px'
                }}
              >
                <div className="font-semibold">
                  {hoveredError.type === 'phoneme' ? 'Pronunciation Issue' : 'Speech Flow Issue'}
                </div>
                <div>{hoveredError.message}</div>
                {hoveredError.phoneme && (
                  <div className="text-yellow-300">/{hoveredError.phoneme}/</div>
                )}
                <div className="text-gray-300">
                  {hoveredError.start.toFixed(1)}s - {hoveredError.end.toFixed(1)}s
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-400 rounded"></div>
              <span>Pronunciation Issues</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Pauses & Disfluencies</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span>Current Position</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

WaveformVisualization.displayName = 'WaveformVisualization';

export default WaveformVisualization;
