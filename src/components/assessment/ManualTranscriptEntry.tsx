
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload } from 'lucide-react';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

interface ManualTranscriptEntryProps {
  onTranscriptSubmit: (transcript: string) => void;
  onAudioSubmit?: (audioBlob: Blob) => void;
  supportedAudioFormats?: string[];
}

const ManualTranscriptEntry: React.FC<ManualTranscriptEntryProps> = ({
  onTranscriptSubmit,
  onAudioSubmit,
  supportedAudioFormats = ['.mp3', '.wav', '.m4a', '.aac', '.ogg']
}) => {
  const [transcript, setTranscript] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { isSupported } = useSpeechRecognition();
  const [showWarning, setShowWarning] = useState(false);
  
  // Check speech recognition support on mount
  useEffect(() => {
    setShowWarning(!isSupported);
  }, [isSupported]);

  const handleTranscriptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    // Allow submission if either transcript is provided or audio file is uploaded
    if (!transcript.trim() && !audioFile) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Submit transcript
      onTranscriptSubmit(transcript);
      
      // If audio file is provided and onAudioSubmit callback exists
      if (audioFile && onAudioSubmit) {
        const audioBlob = await convertFileToBlob(audioFile);
        onAudioSubmit(audioBlob);
      }
    } catch (error) {
      console.error('Error processing submission:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const convertFileToBlob = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) {
          const blob = new Blob([reader.result], { type: file.type });
          resolve(blob);
        } else {
          reject(new Error('Failed to convert file to blob'));
        }
      };
      reader.onerror = () => {
        reject(reader.error);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const getAcceptString = () => {
    return supportedAudioFormats.join(',');
  };

  return (
    <div className="space-y-4">
      {showWarning && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-md">
          <p className="text-amber-800 text-sm">
            Speech recognition is not available in your browser. Please enter your response manually.
          </p>
        </div>
      )}
      
      <Textarea 
        placeholder="Type your spoken response here..."
        className="min-h-[120px]"
        value={transcript}
        onChange={handleTranscriptChange}
      />

      {onAudioSubmit && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">Optional: Upload a pre-recorded audio file</p>
          <div className="flex items-center gap-2">
            <label className="flex-1">
              <div className="border rounded-md px-4 py-2 text-center cursor-pointer hover:bg-gray-50 transition-colors">
                <Upload className="h-4 w-4 inline-block mr-2" />
                <span className="text-sm">
                  {audioFile ? audioFile.name : `Select audio file ${supportedAudioFormats.join(', ')}`}
                </span>
              </div>
              <input 
                type="file"
                accept={getAcceptString()}
                className="hidden"
                onChange={handleAudioFileChange}
              />
            </label>
          </div>
          {audioFile && (
            <div className="mt-2">
              <audio controls className="w-full" src={URL.createObjectURL(audioFile)}></audio>
            </div>
          )}
        </div>
      )}

      <Button
        className="bg-assessment-teal text-white hover:bg-assessment-lightBlue"
        onClick={handleSubmit}
        disabled={isLoading || (!transcript.trim() && !audioFile)}
      >
        {isLoading ? 'Processing...' : 'Submit Response'}
      </Button>
    </div>
  );
};

export default ManualTranscriptEntry;
