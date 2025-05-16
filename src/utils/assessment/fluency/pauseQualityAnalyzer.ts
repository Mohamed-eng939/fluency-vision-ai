
/**
 * Analyze transcript for pause quality
 * Identifies fluent vs. disfluent pauses based on context
 */
export const analyzePauseQuality = (transcript: string, audioMetrics: any): any => {
  // Initialize pause analysis
  const pauseAnalysis = {
    fluentPauses: 0,
    disfluent_pauses: 0,
    pauseLocations: [] as any[],
    fluent_ratio: 0,
    disfluent_ratio: 0
  };
  
  // We may have pause segments from the audio processing
  // Here we'll simulate pause detection based on punctuation and irregular word spacing in the transcript
  // In a real implementation, this would use audio processing to get actual pause timings
  
  if (!transcript) return pauseAnalysis;
  
  // Normalize transcript
  const normalizedText = transcript.trim();
  
  // Basic pause detection at punctuation marks (natural/fluent pauses)
  const sentenceBoundaries = normalizedText.match(/[.!?;:,]/g) || [];
  pauseAnalysis.fluentPauses = sentenceBoundaries.length;
  
  // Look for discourse markers and natural pause points
  const discourseMarkers = [
    'however', 'therefore', 'in addition', 'moreover', 'furthermore',
    'consequently', 'on the other hand', 'in conclusion', 'to sum up',
    'in other words', 'for example', 'that is'
  ];
  
  let additionalFluentPauses = 0;
  discourseMarkers.forEach(marker => {
    const regex = new RegExp(`\\b${marker}\\b`, 'gi');
    const matches = normalizedText.match(regex) || [];
    additionalFluentPauses += matches.length;
  });
  
  pauseAnalysis.fluentPauses += additionalFluentPauses;
  
  // Now detect potential disfluent pauses
  // 1. Hesitation words often indicate disfluent pauses
  const hesitationWords = ['um', 'uh', 'er', 'like', 'you know', 'I mean'];
  let disfluent_from_hesitation = 0;
  
  hesitationWords.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    const matches = normalizedText.match(regex) || [];
    disfluent_from_hesitation += matches.length;
  });
  
  // 2. Look for incomplete phrases or unnatural breaks (approximated by multiple spaces in transcript)
  // This is a simplification - in a real implementation we'd have actual audio pause timing
  const unnaturalBreaks = normalizedText.match(/\s{2,}|\.\.\./g) || [];
  const possibleDisfluent = unnaturalBreaks.length;
  
  // 3. Look for broken grammatical units (simplified detection)
  // Breaking between subject and verb, within prepositional phrases, etc.
  // This is a complex linguistic analysis that would need a more sophisticated implementation
  // For simplicity, we'll estimate based on average and known audio metrics
  
  const averagePauseCount = Math.round((audioMetrics.pauseCount || 0) * 0.3);
  const estimatedDisfluent = disfluent_from_hesitation + possibleDisfluent + averagePauseCount;
  
  pauseAnalysis.disfluent_pauses = estimatedDisfluent;
  
  // Calculate total pauses and ratios
  const totalPauses = pauseAnalysis.fluentPauses + pauseAnalysis.disfluent_pauses;
  pauseAnalysis.fluent_ratio = totalPauses > 0 ? pauseAnalysis.fluentPauses / totalPauses : 0;
  pauseAnalysis.disfluent_ratio = totalPauses > 0 ? pauseAnalysis.disfluent_pauses / totalPauses : 0;
  
  return pauseAnalysis;
};
