
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

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
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAudioFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAudioFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!audioFile) {
      return;
    }

    setIsLoading(true);
    
    try {
      // If audio file is provided and onAudioSubmit callback exists
      if (audioFile && onAudioSubmit) {
        const audioBlob = await convertFileToBlob(audioFile);
        onAudioSubmit(audioBlob);
      }
      
      // Submit empty transcript since this is audio-only mode
      onTranscriptSubmit('');
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
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-md">
        <p className="text-blue-800 text-sm mb-2">
          <strong>Audio Upload Mode</strong>
        </p>
        <p className="text-blue-700 text-sm">
          Please upload a pre-recorded audio file with your response to the prompt above.
        </p>
      </div>
      
      <div className="mt-4">
        <p className="text-sm text-gray-600 mb-2">Select your audio recording:</p>
        <div className="flex items-center gap-2">
          <label className="flex-1">
            <div className="border-2 border-dashed border-gray-300 rounded-md px-6 py-8 text-center cursor-pointer hover:bg-gray-50 transition-colors">
              <Upload className="h-8 w-8 inline-block mr-2 text-gray-400" />
              <div className="text-lg font-medium text-gray-700">
                {audioFile ? audioFile.name : 'Choose audio file'}
              </div>
              <div className="text-sm text-gray-500 mt-1">
                Supported formats: {supportedAudioFormats.join(', ')}
              </div>
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
          <div className="mt-4">
            <p className="text-sm text-gray-600 mb-2">Preview your audio:</p>
            <audio controls className="w-full" src={URL.createObjectURL(audioFile)}></audio>
          </div>
        )}
      </div>

      <Button
        className="bg-assessment-teal text-white hover:bg-assessment-lightBlue w-full"
        onClick={handleSubmit}
        disabled={isLoading || !audioFile}
      >
        {isLoading ? 'Processing...' : 'Submit Audio Response'}
      </Button>
    </div>
  );
};

export default ManualTranscriptEntry;
