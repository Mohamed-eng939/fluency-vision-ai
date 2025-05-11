
import React, { useState } from 'react';
import { Textarea } from '../ui/textarea';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '../ui/button';
import { AssessmentQuestion } from '../../types/assessment';

interface QuestionRendererProps {
  question: AssessmentQuestion;
  taskId: string;
  answer: any;
  onAnswer: (questionId: string, value: any) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({
  question,
  taskId,
  answer,
  onAnswer,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => {
        audioChunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
      };
      
      setMediaRecorder(recorder);
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };
  
  switch(question.type) {
    case 'multiple-choice':
      return (
        <div className="space-y-2">
          {question.options?.map((option, index) => (
            <label 
              key={index} 
              className="flex items-center p-3 border rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <input 
                type="radio" 
                name={`question-${question.id}`} 
                value={option}
                onChange={() => onAnswer(question.id, option)}
                checked={answer === option}
                className="mr-2"
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      );
      
    case 'matching':
      return (
        <div className="space-y-4">
          {question.options?.map((option, index) => (
            <div key={index} className="flex items-center gap-3">
              <span className="font-medium">{option}</span>
              <select
                className="border rounded p-2 flex-1"
                onChange={(e) => {
                  const currentAnswers = answer || {};
                  onAnswer(question.id, {
                    ...currentAnswers,
                    [option]: e.target.value
                  });
                }}
                value={(answer || {})[option] || ""}
              >
                <option value="">Select a match</option>
                {question.options?.map((matchOption, i) => (
                  <option key={i} value={matchOption}>{matchOption}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      );
      
    case 'gap-fill':
      return (
        <div className="p-4 border rounded-lg">
          <textarea
            className="w-full p-3 border rounded"
            rows={5}
            placeholder="Fill in the blanks..."
            onChange={(e) => onAnswer(question.id, e.target.value)}
            value={answer || ""}
          />
        </div>
      );
      
    case 'short-answer':
      return (
        <div className="p-4 border rounded-lg">
          <textarea
            className="w-full p-3 border rounded"
            rows={3}
            placeholder="Type your answer..."
            onChange={(e) => onAnswer(question.id, e.target.value)}
            value={answer || ""}
          />
        </div>
      );
      
    case 'paragraph-writing':
    case 'essay-writing':
    case 'long-answer':
      return (
        <div className="p-4 border rounded-lg">
          <Textarea
            className="w-full min-h-[150px]"
            placeholder="Write your response..."
            onChange={(e) => onAnswer(question.id, e.target.value)}
            value={answer || ""}
          />
        </div>
      );
      
    case 'image-selection':
      return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {question.options?.map((option, index) => (
            <div 
              key={index}
              className={`p-2 border rounded-lg cursor-pointer ${
                answer === option 
                  ? 'border-assessment-teal bg-assessment-teal/10' 
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => onAnswer(question.id, option)}
            >
              <img 
                src={`/images/${option}`} 
                alt={`Option ${index + 1}`}
                className="w-full h-32 object-contain mb-2"
              />
              <div className="text-center text-sm">{option}</div>
            </div>
          ))}
        </div>
      );
      
    case 'audio-recording':
      return (
        <div className="p-6 border rounded-lg text-center">
          {!audioBlob ? (
            <div className="space-y-4">
              <div className="text-lg font-medium">Record your response</div>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={isRecording ? "bg-red-500 hover:bg-red-600" : "bg-assessment-teal hover:bg-assessment-lightBlue"}
              >
                {isRecording ? (
                  <>
                    <MicOff className="w-4 h-4 mr-2" /> Stop Recording
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 mr-2" /> Start Recording
                  </>
                )}
              </Button>
              {isRecording && (
                <div className="text-sm text-red-500 animate-pulse">
                  Recording in progress...
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-lg font-medium text-assessment-teal">Recording complete</div>
              <audio controls className="w-full">
                <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                Your browser does not support the audio element.
              </audio>
              <Button
                onClick={() => {
                  setAudioBlob(null);
                  onAnswer(question.id, null);
                }}
                variant="outline"
              >
                Delete & Re-record
              </Button>
            </div>
          )}
        </div>
      );
      
    case 'heading-matching':
    case 'note-completion':
    case 'summary-completion':
      return (
        <div className="p-4 border rounded-lg">
          <textarea
            className="w-full p-3 border rounded"
            rows={5}
            placeholder={`Complete the ${question.type.replace('-', ' ')}...`}
            onChange={(e) => onAnswer(question.id, e.target.value)}
            value={answer || ""}
          />
        </div>
      );
      
    default:
      return (
        <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700">
          Question type '{question.type}' not supported yet
        </div>
      );
  }
};

export default QuestionRenderer;
