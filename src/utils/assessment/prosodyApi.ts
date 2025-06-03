
import axios from 'axios';
import { ProsodyAnalysisResult } from '@/types/assessment/audio';

export async function analyzeProsody(file: File): Promise<ProsodyAnalysisResult> {
  try {
    const formData = new FormData();
    formData.append("audio", file);
    
    const response = await axios.post(
      "https://Mohamed-eng939-lingua-prosody-api.hf.space/analyze-prosody/",
      formData,
      { 
        headers: { "Content-Type": "multipart/form-data" }, 
        timeout: 15000 
      }
    );
    
    // Map CEFR level based on prosody features
    const cefrLevel = mapProsodyToCEFR(response.data);
    
    return {
      ...response.data,
      cefr_level: cefrLevel
    };
  } catch (error) {
    console.error("Prosody analysis failed:", error);
    throw new Error("Failed to analyze prosody");
  }
}

/**
 * Map prosody features to CEFR levels
 * This is a basic heuristic that can be refined
 */
function mapProsodyToCEFR(prosodyData: any): string {
  const { pitch_std_dev, tempo_bpm } = prosodyData;
  
  // Basic heuristics for CEFR mapping
  if (pitch_std_dev < 10 && tempo_bpm < 120) {
    return "A2"; // Flat pitch, slow tempo
  } else if (pitch_std_dev < 20 && tempo_bpm < 150) {
    return "B1"; // Moderate variation
  } else if (pitch_std_dev < 30 && tempo_bpm < 180) {
    return "B2"; // Good variation
  } else {
    return "C1"; // Rich prosody
  }
}
