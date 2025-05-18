from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import uuid
import os
import shutil
from typing import Optional
import textgrid
import json
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("whisperx")

# Initialize FastAPI app
app = FastAPI()

# Configure CORS to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Directories for audio processing
UPLOAD_DIR = "./uploads"
ALIGN_DIR = "./alignments"
DICT_PATH = "./models/english_us_dict.dict"  # Path to MFA dictionary
ACOUSTIC_MODEL = "./models/english_us_mfa"   # Path to MFA acoustic model

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(ALIGN_DIR, exist_ok=True)

# IELTS to CEFR mapping based on pronunciation score
def map_score_to_cefr(score: float) -> str:
    if score >= 8.5:
        return "C2"
    elif score >= 7.5:
        return "C1"
    elif score >= 6.5:
        return "B2"
    elif score >= 5.5:
        return "B1"
    elif score >= 4.5:
        return "A2"
    else:
        return "A1"

@app.get("/")
async def root():
    return {"message": "Pronunciation Assessment API"}

@app.post("/whisperx/transcribe/")
async def transcribe_audio(
    audio: UploadFile = File(...),
    speaker_id: Optional[str] = Form(None),
    compute_type: Optional[str] = Form("float16"),  # float16 is faster but less precise than float32
    model_size: Optional[str] = Form("large-v2")   # Default to large-v2 for best accuracy
):
    """
    Transcribe audio using WhisperX to get word-level timestamps
    """
    # Generate a unique session ID for this analysis
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Save uploaded audio file
    audio_path = os.path.join(session_dir, "audio.wav")
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    try:
        # Import WhisperX here to avoid loading GPU on import
        import whisperx
        import torch
        
        # Check if CUDA is available
        device = "cuda" if torch.cuda.is_available() else "cpu"
        logger.info(f"Using device: {device}, model: {model_size}, compute_type: {compute_type}")
        
        # Load WhisperX model
        model = whisperx.load_model(model_size, device, compute_type=compute_type)
        
        # Transcribe audio
        result = model.transcribe(audio_path, language="en")
        
        # Get word-level alignments
        model_a, metadata = whisperx.load_align_model(language_code="en", device=device)
        result = whisperx.align(result["segments"], model_a, metadata, audio_path, device)
        
        # Extract word segments and create a list of word timings
        word_segments = []
        for segment in result["segments"]:
            for word in segment.get("words", []):
                word_segments.append({
                    "word": word["word"].strip(),
                    "start": round(word["start"], 3),
                    "end": round(word["end"], 3),
                    "score": word.get("score", 1.0)
                })
        
        # Calculate pause durations between words
        pause_durations = []
        for i in range(1, len(word_segments)):
            pause_duration = round(word_segments[i]["start"] - word_segments[i-1]["end"], 3)
            # Only record pauses longer than 200ms
            if pause_duration > 0.2:
                pause_durations.append({
                    "duration": pause_duration,
                    "position": i-1,
                    "before_word": word_segments[i]["word"],
                    "after_word": word_segments[i-1]["word"]
                })
        
        # Calculate speaking time (total duration of words)
        speaking_time = sum(word["end"] - word["start"] for word in word_segments)
        
        # Get total audio duration
        total_duration = word_segments[-1]["end"] if word_segments else 0
        
        # Calculate silence time
        silence_time = total_duration - speaking_time if total_duration > speaking_time else 0
        
        # Get transcript as plain text
        transcript = " ".join(segment["text"] for segment in result["segments"])
        
        return {
            "session_id": session_id,
            "transcript": transcript,
            "segments": result["segments"],
            "word_segments": word_segments,
            "pause_durations": pause_durations,
            "speaking_time": round(speaking_time, 2),
            "silence_time": round(silence_time, 2),
            "total_duration": round(total_duration, 2),
            "transcription_failed": False
        }
    
    except Exception as e:
        logger.error(f"WhisperX transcription failed: {str(e)}")
        return {
            "session_id": session_id,
            "transcript": "",
            "transcription_failed": True,
            "error": str(e)
        }

@app.post("/analyze/")
async def analyze_pronunciation(
    audio: UploadFile = File(...),
    transcript: str = Form(...),
    speaker_id: Optional[str] = Form(None)
):
    # Generate a unique session ID for this analysis
    session_id = str(uuid.uuid4())
    session_dir = os.path.join(UPLOAD_DIR, session_id)
    os.makedirs(session_dir, exist_ok=True)
    
    # Save uploaded audio file
    audio_path = os.path.join(session_dir, "audio.wav")
    with open(audio_path, "wb") as buffer:
        shutil.copyfileobj(audio.file, buffer)
    
    # Create transcript file
    transcript_path = os.path.join(session_dir, "transcript.txt")
    with open(transcript_path, "w", encoding="utf-8") as f:
        f.write(transcript.strip())
    
    # Output directory for this specific alignment
    output_dir = os.path.join(ALIGN_DIR, session_id)
    
    # Run MFA alignment
    try:
        # Check if MFA is installed
        subprocess.run(["mfa", "--version"], check=True, capture_output=True)
        
        # Prepare audio for alignment
        subprocess.run([
            "mfa", "validate", 
            session_dir, DICT_PATH, 
            "--output_directory", os.path.join(session_dir, "validated")
        ], check=True)
        
        # Run alignment
        subprocess.run([
            "mfa", "align",
            session_dir, DICT_PATH, ACOUSTIC_MODEL,
            output_dir,
            "--clean",
            "--overwrite"
        ], check=True)
    except subprocess.CalledProcessError as e:
        return JSONResponse(
            status_code=500, 
            content={
                "error": "Alignment failed",
                "details": str(e),
                "stdout": e.stdout.decode() if hasattr(e, 'stdout') and e.stdout else "",
                "stderr": e.stderr.decode() if hasattr(e, 'stderr') and e.stderr else ""
            }
        )
    except FileNotFoundError:
        return JSONResponse(
            status_code=500, 
            content={"error": "MFA not installed. Install with 'pip install montreal-forced-aligner'"}
        )
    
    # Parse TextGrid results
    tg_path = os.path.join(output_dir, f"{os.path.basename(audio_path).split('.')[0]}.TextGrid")
    if not os.path.exists(tg_path):
        return JSONResponse(status_code=404, content={"error": "Alignment output not found"})
    
    try:
        # Parse the TextGrid to extract pronunciation metrics
        analysis_result = analyze_textgrid(tg_path, transcript)
        
        # Calculate final score and CEFR level
        final_score = calculate_pronunciation_score(analysis_result)
        cefr_level = map_score_to_cefr(final_score)
        
        # Return detailed analysis
        return {
            "session_id": session_id,
            "pronunciation_score": round(final_score, 1),
            "cefr_level": cefr_level,
            **analysis_result
        }
    
    except Exception as e:
        return JSONResponse(
            status_code=500, 
            content={"error": "Failed to analyze pronunciation", "details": str(e)}
        )

def analyze_textgrid(textgrid_path: str, expected_transcript: str) -> dict:
    """
    Analyze the TextGrid file to extract pronunciation metrics
    """
    try:
        # Parse TextGrid file
        tg = textgrid.TextGrid.fromFile(textgrid_path)
        
        # Get word and phone tiers
        word_tier = next((tier for tier in tg.tiers if tier.name.lower() == "words"), None)
        phone_tier = next((tier for tier in tg.tiers if tier.name.lower() == "phones"), None)
        
        if not word_tier or not phone_tier:
            raise ValueError("Required tiers not found in TextGrid")
        
        # Analyze word-level metrics
        total_words = 0
        aligned_words = 0
        word_durations = []
        
        for interval in word_tier.intervals:
            if interval.mark.strip() and interval.mark.lower() not in ["sp", "sil"]:
                total_words += 1
                word_durations.append(interval.maxTime - interval.minTime)
                aligned_words += 1
        
        # Analyze phone-level metrics
        total_phones = 0
        aligned_phones = 0
        problematic_phones = []
        phone_durations = []
        
        # Detect expected phonemes based on transcript
        expected_phoneme_count = len(expected_transcript.split()) * 4  # Rough estimate: ~4 phonemes per word
        
        for interval in phone_tier.intervals:
            if interval.mark.strip() and interval.mark.lower() not in ["sp", "sil"]:
                total_phones += 1
                duration = interval.maxTime - interval.minTime
                phone_durations.append(duration)
                
                # Check for problematic phones (too short or too long)
                if duration < 0.02:  # Too short
                    problematic_phones.append({
                        "phone": interval.mark,
                        "issue": "too_short",
                        "start": interval.minTime,
                        "end": interval.maxTime
                    })
                elif duration > 0.3:  # Too long
                    problematic_phones.append({
                        "phone": interval.mark,
                        "issue": "too_long",
                        "start": interval.minTime,
                        "end": interval.maxTime
                    })
                
                aligned_phones += 1
        
        # Calculate metrics
        word_accuracy = aligned_words / total_words if total_words > 0 else 0
        phoneme_accuracy = aligned_phones / expected_phoneme_count if expected_phoneme_count > 0 else 0
        problematic_ratio = len(problematic_phones) / total_phones if total_phones > 0 else 0
        
        # Analyze speech rate
        total_duration = word_tier.intervals[-1].maxTime - word_tier.intervals[0].minTime
        speech_rate = aligned_words / (total_duration / 60)  # words per minute
        
        return {
            "word_accuracy": round(word_accuracy, 3),
            "phoneme_accuracy": round(phoneme_accuracy, 3),
            "problematic_phonemes": problematic_phones[:10],  # Limit to first 10
            "problematic_ratio": round(problematic_ratio, 3),
            "speech_rate": round(speech_rate, 1),
            "total_words": total_words,
            "aligned_words": aligned_words,
            "total_phones": total_phones,
            "aligned_phones": aligned_phones,
            "duration_seconds": round(total_duration, 2)
        }
    
    except Exception as e:
        raise Exception(f"TextGrid analysis failed: {str(e)}")

def calculate_pronunciation_score(analysis: dict) -> float:
    """
    Calculate a final pronunciation score (IELTS-like 1-9 scale)
    based on the detailed analysis
    """
    # Base score
    base_score = 5.0
    
    # Adjust for word accuracy (most important factor)
    word_accuracy_score = analysis["word_accuracy"] * 4.0  # 0-4 points
    
    # Adjust for phoneme accuracy
    phoneme_score = analysis["phoneme_accuracy"] * 3.0  # 0-3 points
    
    # Penalize for problematic phonemes
    problematic_penalty = analysis["problematic_ratio"] * -2.0  # 0 to -2 points
    
    # Calculate final score (capped between 1-9)
    final_score = base_score + word_accuracy_score + phoneme_score + problematic_penalty
    final_score = max(1.0, min(9.0, final_score))
    
    return final_score

@app.get("/check-mfa/")
async def check_mfa_installation():
    """Check if MFA is correctly installed"""
    try:
        result = subprocess.run(["mfa", "--version"], capture_output=True, text=True)
        return {"installed": True, "version": result.stdout.strip()}
    except:
        return {"installed": False}

@app.get("/check-whisperx/")
async def check_whisperx_installation():
    """Check if WhisperX is correctly installed"""
    try:
        import whisperx
        import torch
        
        return {
            "installed": True, 
            "version": whisperx.__version__ if hasattr(whisperx, "__version__") else "Unknown",
            "cuda_available": torch.cuda.is_available(),
            "device": "cuda" if torch.cuda.is_available() else "cpu"
        }
    except ImportError:
        return {"installed": False, "error": "WhisperX not installed"}
    except Exception as e:
        return {"installed": False, "error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
