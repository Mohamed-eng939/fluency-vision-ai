
import { useState, useEffect } from 'react';
import { checkApiAvailability } from '@/utils/pronunciationScoreApi';
import { toast } from '@/hooks/use-toast';

export const usePronunciationApi = () => {
  const [isPronunciationApiAvailable, setIsPronunciationApiAvailable] = useState<boolean>(false);
  
  useEffect(() => {
    const checkBackendAvailability = async () => {
      const isApiAvailable = await checkApiAvailability();
      setIsPronunciationApiAvailable(isApiAvailable);
      
      if (isApiAvailable) {
        toast({
          title: "Pronunciation API detected",
          description: "Enhanced pronunciation scoring is available.",
        });
      }
    };
    
    checkBackendAvailability().catch(console.error);
  }, []);
  
  return { isPronunciationApiAvailable };
};
