

## Timed Assessment Flow with Auto-Recording and Silence Detection

### Overview
Replace the current manual "Start Recording / Stop Recording / Submit" flow with a fully timed, automated question-by-question experience:
1. **10-second reading phase** -- question is displayed with a countdown; recording has not started yet
2. **60-second recording phase** -- recording starts automatically; a visible countdown shows remaining time; the test taker can submit early
3. **Auto-advance** -- when 60 seconds expire OR the user submits, the response is saved and the next question loads (back to step 1)

For detecting when a test taker finishes speaking without clicking submit, the existing **Voice Activity Detector (VAD)** will be enhanced: after speech is first detected and then silence persists for **4 seconds**, the recording will auto-submit (same as clicking "Submit"). This is already partially implemented (VAD triggers `stopRecording`), but it currently only stops recording without submitting. The change will wire it through to auto-submit.

### Regarding Fluency Calculation
Fluency is already calculated via the external API using transcript + duration to derive SPM. With this change, the **actual recording duration** (from recording start to stop/auto-stop) will be passed as the duration, ensuring accurate SPM even when auto-submitted via silence detection.

---

### Technical Plan

#### 1. New Component: `TimedRecordingStep.tsx`
Replaces `RecordingFlowController` inside `RecordingStep` for the assessment flow. This component manages the two-phase timer:

- **Reading phase (10s)**: Shows the question text, a "Get Ready" countdown, microphone icon greyed out. No recording.
- **Recording phase (60s)**: Auto-starts recording + speech recognition. Shows countdown timer (60s to 0). Provides a "Submit Response" button for early submission. When timer hits 0, auto-stops and submits.
- **VAD auto-submit**: If the user speaks and then goes silent for 4 seconds, auto-submit the response (don't just stop recording -- actually call the submit handler).

#### 2. Modify `RecordingStep.tsx`
- Replace `RecordingFlowController` with the new `TimedRecordingStep` component
- Pass `onRecordingComplete` to handle auto-submission
- Remove the manual "Start Recording" button flow

#### 3. Modify `useRecordingFlow.ts` (or create a new `useTimedRecordingFlow` hook)
- Add `autoStart` capability so recording begins programmatically (no user click)
- Add `maxDurationMs` parameter (60000) that auto-stops and submits when reached
- Enhance VAD integration: on silence-detected stop, also trigger `handleSubmit` (not just `stopRecording`)
- Track actual speech duration for accurate fluency calculation

#### 4. Modify `useAudioRecorder.ts`
- Add optional `maxDurationSeconds` parameter
- When `maxDurationSeconds` is reached, automatically call `stopRecording`
- Expose actual recording duration (not just the timer display) for fluency

#### 5. Update `RecordingControls.tsx`
- Accept new props for the timed mode: `timeRemaining`, `isReadingPhase`, `readingTimeRemaining`
- Show countdown instead of elapsed time
- Show "Submit Response" button instead of "Start/Stop Recording" during recording phase

#### 6. Flow Sequence

```text
[Question Appears]
       |
       v
[Reading Phase: 10s countdown]
  - Question text visible
  - "Recording starts in X seconds..."
       |
       v (10s elapsed)
[Recording Phase: 60s countdown]
  - Auto-start microphone + speech recognition
  - Show "Submit Response" button
  - VAD monitors for silence
       |
       +---> User clicks "Submit" --> save & next question
       +---> 60s timer expires --> auto-stop, save & next question
       +---> 4s silence after speech --> auto-stop, save & next question
       |
       v
[Next Question: back to Reading Phase]
```

#### 7. Silence Detection Strategy (answering your question)
The recommended approach uses the **existing VAD (Voice Activity Detector)** already in the codebase:
- It analyzes the microphone's audio stream in real-time using Web Audio API frequency analysis
- It tracks speech-band energy (85-255 Hz) to determine if someone is speaking
- When `speaking = true` transitions to `speaking = false` for 4 consecutive seconds, it fires `onSpeechEnd`
- Currently this only stops the recorder; the change will make it also auto-submit the response
- This works well because it operates on raw audio energy, not transcription -- so there is no delay or API dependency

#### Files to Create
- `src/components/assessment/TimedRecordingStep.tsx` -- new timed recording UI component

#### Files to Modify
- `src/components/assessment/RecordingStep.tsx` -- use `TimedRecordingStep` instead of `RecordingFlowController`
- `src/hooks/useAudioRecorder.ts` -- add `maxDurationSeconds` auto-stop
- `src/hooks/recording/useRecordingFlow.ts` -- add auto-start and auto-submit-on-silence capabilities
- `src/components/assessment/RecordingControls.tsx` -- add timed mode with countdown display

