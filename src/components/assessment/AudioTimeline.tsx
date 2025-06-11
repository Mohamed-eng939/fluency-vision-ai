
import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioTimelineProps {
  audioUrl?: string;
  errors?: Array<{
    start: number;
    end: number;
    type: 'phoneme' | 'pause' | 'disfluency';
    message: string;
  }>;
  duration?: number;
  className?: string;
}

const AudioTimeline: React.FC<AudioTimelineProps> = ({
  audioUrl,
  errors = [],
  duration,
  className = ""
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [actualDuration, setActualDuration] = useState(duration || 0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      const audio = audioRef.current;
      
      const handleLoadedMetadata = () => {
        const audioDuration = audio.duration;
        if (isFinite(audioDuration) && audioDuration > 0) {
          setActualDuration(audioDuration);
          setIsLoading(false);
          setHasError(false);
          console.log("Audio duration loaded:", audioDuration);
        } else {
          console.warn("Invalid audio duration:", audioDuration);
        }
      };

      const handleTimeUpdate = () => {
        setCurrentTime(audio.currentTime);
      };

      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      const handleError = (e: any) => {
        console.error("Audio loading error:", e);
        setHasError(true);
        setIsLoading(false);
      };

      // Wait for metadata to load
      audio.addEventListener('loadedmetadata', handleLoadedMetadata);
      audio.addEventListener('timeupdate', handleTimeUpdate);
      audio.addEventListener('ended', handleEnded);
      audio.addEventListener('error', handleError);
      
      // If metadata is already loaded
      if (audio.readyState >= 1) {
        handleLoadedMetadata();
      }

      return () => {
        audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
        audio.removeEventListener('timeupdate', handleTimeUpdate);
        audio.removeEventListener('ended', handleEnded);
        audio.removeEventListener('error', handleError);
      };
    }
  }, [audioUrl]);

  const togglePlayPause = () => {
    if (!audioRef.current || isLoading) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || isLoading || actualDuration === 0) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const newTime = (clickX / rect.width) * actualDuration;
    
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number): string => {
    if (!isFinite(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Don't render if no audio URL or still loading without valid duration
  if (!audioUrl) {
    return (
      <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
        <p className="text-gray-500 text-center">No audio available for timeline analysis</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
        <div className="flex items-center justify-center space-x-2">
          <div className="animate-spin h-4 w-4 border-b-2 border-assessment-blue"></div>
          <p className="text-gray-600">Loading waveform...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className={`border rounded-lg p-4 bg-gray-50 ${className}`}>
        <p className="text-red-500 text-center">Error loading audio file</p>
      </div>
    );
  }

  return (
    <div className={`border rounded-lg p-4 bg-white ${className}`}>
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center space-x-4 mb-3">
        <Button
          onClick={togglePlayPause}
          size="sm"
          variant="outline"
          disabled={actualDuration === 0}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="text-sm text-gray-600">
          {formatTime(currentTime)} / {formatTime(actualDuration)}
        </div>
      </div>

      <div 
        className="relative h-12 bg-gray-200 rounded cursor-pointer"
        onClick={handleSeek}
      >
        {/* Progress bar */}
        <div 
          className="absolute top-0 left-0 h-full bg-assessment-blue rounded transition-all duration-100"
          style={{ width: actualDuration > 0 ? `${(currentTime / actualDuration) * 100}%` : '0%' }}
        />
        
        {/* Error markers */}
        {errors.map((error, index) => (
          <div
            key={index}
            className="absolute top-0 h-full bg-red-500 opacity-60 rounded"
            style={{
              left: actualDuration > 0 ? `${(error.start / actualDuration) * 100}%` : '0%',
              width: actualDuration > 0 ? `${Math.max(1, ((error.end - error.start) / actualDuration) * 100)}%` : '1%'
            }}
            title={error.message}
          />
        ))}
        
        {/* Current time indicator */}
        <div 
          className="absolute top-0 w-0.5 h-full bg-white shadow-lg"
          style={{ left: actualDuration > 0 ? `${(currentTime / actualDuration) * 100}%` : '0%' }}
        />
      </div>
      
      {errors.length > 0 && (
        <div className="mt-2 text-xs text-gray-500">
          {errors.length} pronunciation issue{errors.length !== 1 ? 's' : ''} detected
        </div>
      )}
    </div>
  );
};

export default AudioTimeline;
