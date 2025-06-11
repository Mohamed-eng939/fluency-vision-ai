
import axios from 'axios';
import { ProsodyAnalysisResult } from '@/types/assessment/audio';

export async function analyzeProsody(file: File): Promise<ProsodyAnalysisResult> {
  console.log("Starting prosody analysis for file:", file.name, file.size, "bytes");
  
  try {
    // Validate file before sending
    if (!file || file.size === 0) {
      throw new Error("Invalid audio file - size is 0 or null");
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error("Audio file too large (>10MB)");
    }
    
    // Ensure file is in correct format
    const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/webm'];
    if (!validTypes.includes(file.type)) {
      console.warn("File type not explicitly supported:", file.type, "- attempting anyway");
    }

    const formData = new FormData();
    formData.append("audio", file);
    
    console.log("Sending request to prosody API...");
    
    const response = await axios.post(
      "https://Mohamed-eng939-lingua-prosody-api.hf.space/analyze-prosody/",
      formData,
      { 
        headers: { 
          "Content-Type": "multipart/form-data"
        }, 
        timeout: 15000 // Increased timeout
      }
    );
    
    console.log("Prosody API response received:", response.data);
    
    // Validate response data
    if (!response.data || typeof response.data !== 'object') {
      throw new Error("Invalid response format from prosody API");
    }
    
    // Map CEFR level based on prosody features
    const cefrLevel = mapProsodyToCEFR(response.data);
    
    return {
      ...response.data,
      cefr_level: cefrLevel,
      analysisTimestamp: Date.now()
    };
  } catch (error) {
    console.error("Prosody analysis failed:", error);
    
    let failureReason = "Server unavailable";
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        failureReason = "Request timeout";
      } else if (error.response?.status === 413) {
        failureReason = "File too large";
      } else if (error.response?.status === 415) {
        failureReason = "Unsupported audio format";
      } else if (error.response?.status >= 500) {
        failureReason = "Server error";
      } else if (error.response?.status >= 400) {
        failureReason = "Invalid request";
      }
    } else if (error instanceof Error) {
      if (error.message.includes("size is 0")) {
        failureReason = "Invalid audio file";
      } else if (error.message.includes("too large")) {
        failureReason = "File too large";
      }
    }
    
    console.log("Prosody analysis fallback reason:", failureReason);
    
    // Return fallback data with failure reason
    return {
      pitch_mean: 150, // Default values
      pitch_std_dev: 25,
      tempo_bpm: 120,
      opensmile_features: `fallback - ${failureReason}`,
      cefr_level: "B1", // Default level
      analysisTimestamp: Date.now(),
      failureReason
    };
  }
}

/**
 * Map prosody features to CEFR levels with improved fallback handling
 */
function mapProsodyToCEFR(prosodyData: any): string {
  try {
    const { pitch_std_dev, tempo_bpm, pitch_mean } = prosodyData;
    
    if (!pitch_std_dev || !tempo_bpm) {
      console.log("Missing prosody data for CEFR mapping, using default B1");
      return "B1"; // Default fallback
    }
    
    console.log("Mapping prosody to CEFR:", { pitch_std_dev, tempo_bpm, pitch_mean });
    
    // Enhanced heuristics for CEFR mapping
    if (pitch_std_dev < 8 && tempo_bpm < 100) {
      return "A1"; // Very flat pitch, very slow tempo
    } else if (pitch_std_dev < 12 && tempo_bpm < 120) {
      return "A2"; // Somewhat flat pitch, slow tempo
    } else if (pitch_std_dev < 20 && tempo_bpm < 150) {
      return "B1"; // Moderate variation
    } else if (pitch_std_dev < 30 && tempo_bpm < 180) {
      return "B2"; // Good variation
    } else if (pitch_std_dev < 40 && tempo_bpm < 200) {
      return "C1"; // Rich prosody
    } else {
      return "C2"; // Very rich prosody
    }
  } catch (error) {
    console.error("Error mapping prosody to CEFR:", error);
    return "B1"; // Safe default
  }
}
