import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Mic, CheckCircle2, AlertCircle } from 'lucide-react';
import AudioWaveform from './AudioWaveform';

interface MicCheckProps {
  /** Fired once the microphone is confirmed to be picking up sound. */
  onReady: () => void;
}

/**
 * Pre-assessment microphone check. Shows a live waveform so the test-taker can
 * confirm the mic works before the test starts — no recording, no transcription,
 * no backend needed (works even if the scoring services are offline).
 */
const MicCheck: React.FC<MicCheckProps> = ({ onReady }) => {
  const [testing, setTesting] = useState(false);
  const [passed, setPassed] = useState(false);
  const [denied, setDenied] = useState(false);

  const startTest = async () => {
    try {
      // Probe permission up front so we can show a clear denial message.
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true });
      probe.getTracks().forEach((t) => t.stop());
      setDenied(false);
      setPassed(false);
      setTesting(true);
    } catch {
      setDenied(true);
      setTesting(false);
    }
  };

  const handleSoundDetected = () => {
    if (!passed) {
      setPassed(true);
      onReady();
    }
  };

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-muted/30">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
        <Mic className="h-4 w-4" /> Microphone check
      </div>

      {!testing ? (
        <>
          <p className="text-sm text-muted-foreground">
            Let's make sure we can hear you before the test begins.
          </p>
          <Button onClick={startTest} variant="outline" className="w-full">
            <Mic className="mr-2 h-4 w-4" /> Test my microphone
          </Button>
          {denied && (
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 flex-none" />
              Microphone is blocked. Allow mic access in your browser, then try again.
            </p>
          )}
        </>
      ) : (
        <>
          <AudioWaveform active onSoundDetected={handleSoundDetected} />
          {passed ? (
            <p className="text-sm text-green-600 flex items-center justify-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" /> Your microphone is working — you're all set.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground text-center">Say a few words to test the level…</p>
          )}
        </>
      )}
    </div>
  );
};

export default MicCheck;
