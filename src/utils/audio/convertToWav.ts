import { AudioAnalysisResult } from '@/utils/audioAnalysisUtils';

/**
 * Convert an arbitrary audio Blob into a playable 16-bit PCM WAV Blob.
 * This improves cross-browser playback (e.g., Safari often requires WAV/MP4).
 */
export const convertToWav = async (blob: Blob): Promise<Blob> => {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

  // Quick silence/health check using RMS (downsampled for performance)
  let sumSquares = 0;
  const channelsToCheck = Math.min(audioBuffer.numberOfChannels, 2);
  const len = audioBuffer.length;
  const step = 256; // check every 256th sample
  for (let ch = 0; ch < channelsToCheck; ch++) {
    const data = audioBuffer.getChannelData(ch);
    for (let i = 0; i < len; i += step) {
      const v = data[i];
      sumSquares += v * v;
    }
  }
  const samplesCount = Math.max(1, Math.ceil(len / step) * channelsToCheck);
  const rms = Math.sqrt(sumSquares / samplesCount);
  console.log('WAV conversion: decoded buffer', {
    channels: audioBuffer.numberOfChannels,
    sampleRate: audioBuffer.sampleRate,
    length: audioBuffer.length,
    rms
  });

  // If decoded audio appears near-silent, keep original encoding to avoid producing a silent WAV
  if (rms < 0.0005) {
    console.warn('Decoded audio is near-silent (RMS below threshold); returning original blob');
    return blob;
  }

  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const length = audioBuffer.length;

  // Interleave channels into PCM16
  const interleaved = interleave(audioBuffer, numChannels, length);
  const wavBuffer = encodeWAV(interleaved, sampleRate, numChannels);
  return new Blob([wavBuffer], { type: 'audio/wav' });
};

function interleave(audioBuffer: AudioBuffer, numChannels: number, length: number) {
  if (numChannels === 1) {
    const channelData = audioBuffer.getChannelData(0);
    return floatTo16BitPCM(channelData);
  }

  // Mix down to 2 channels if more
  const left = audioBuffer.getChannelData(0);
  const right = audioBuffer.getChannelData(1);
  const mixed = new Float32Array(length * 2);
  let index = 0;
  for (let i = 0; i < length; i++) {
    mixed[index++] = left[i];
    mixed[index++] = right[i];
  }
  return floatTo16BitPCM(mixed);
}

function floatTo16BitPCM(float32Array: Float32Array) {
  const buffer = new ArrayBuffer(float32Array.length * 2);
  const view = new DataView(buffer);
  let offset = 0;
  for (let i = 0; i < float32Array.length; i++, offset += 2) {
    let s = Math.max(-1, Math.min(1, float32Array[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return view;
}

function encodeWAV(samplesView: DataView, sampleRate: number, numChannels: number) {
  const buffer = new ArrayBuffer(44 + samplesView.byteLength);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + samplesView.byteLength, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  const byteRate = sampleRate * numChannels * 2;
  view.setUint32(28, byteRate, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, numChannels * 2, true);
  /* bits per sample */
  view.setUint16(34, 16, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samplesView.byteLength, true);

  // Copy samples after header
  new Uint8Array(buffer).set(new Uint8Array(samplesView.buffer), 44);

  return buffer;
}

function writeString(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) {
    view.setUint8(offset + i, str.charCodeAt(i));
  }
}
