import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight } from 'lucide-react';
import {
  MIN_SUPPORTED_AGE,
  MAX_SUPPORTED_AGE,
  TRACKS,
  trackForAge,
} from '@/data/assessment/tracks';

interface AgeGateStepProps {
  onSubmit: (age: number) => void;
}

/**
 * First step every student sees: they type their age, and the system picks the
 * right test for their track (Kids 6-10, Teens 11-16, Adults 17+). The chosen
 * track is shown back to them before they continue.
 */
const AgeGateStep: React.FC<AgeGateStepProps> = ({ onSubmit }) => {
  const [value, setValue] = useState('');

  const parsed = value.trim() === '' ? NaN : Number(value);
  const isValid =
    Number.isInteger(parsed) && parsed >= MIN_SUPPORTED_AGE && parsed <= MAX_SUPPORTED_AGE;
  const previewTrack = isValid ? TRACKS[trackForAge(parsed)] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isValid) onSubmit(parsed);
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader className="text-center">
        <h2 className="text-2xl font-bold text-assessment-blue">How old are you?</h2>
        <p className="text-gray-600">
          We'll choose the right test for your age.
        </p>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="age-input">Your age</Label>
            <Input
              id="age-input"
              type="number"
              inputMode="numeric"
              min={MIN_SUPPORTED_AGE}
              max={MAX_SUPPORTED_AGE}
              autoFocus
              placeholder="Enter your age"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              aria-describedby="age-help"
            />
            <p id="age-help" className="text-xs text-muted-foreground">
              Please enter an age between {MIN_SUPPORTED_AGE} and {MAX_SUPPORTED_AGE}.
            </p>
          </div>

          {previewTrack && (
            <div
              className="rounded-lg border border-assessment-blue/20 bg-assessment-blue/5 p-3 text-sm"
              aria-live="polite"
            >
              You'll take the <span className="font-semibold">{previewTrack.label}</span> test.
              <span className="block text-muted-foreground">{previewTrack.blurb}</span>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={!isValid}>
            Continue <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default AgeGateStep;
