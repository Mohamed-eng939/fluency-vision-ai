import { ReadAloudSentence } from '@/data/readAloud/sentenceBank';
import { generateIPATranscription } from './ipaTranscriptionService';

/**
 * Add IPA transcriptions to sentence bank entries
 */
export const addIPAToSentences = (sentences: ReadAloudSentence[]): ReadAloudSentence[] => {
  return sentences.map(sentence => ({
    ...sentence,
    ipa: sentence.ipa || generateIPATranscription(sentence.sentence).ipa
  }));
};

/**
 * Pre-generated IPA transcriptions for common Read Aloud sentences
 */
export const sentenceIPAMappings: Record<string, string> = {
  // A1 sentences
  'A1-001': 'ðə kæt ɪz ɑn ðə bɛd',
  'A1-002': 'aɪ æm ə studənt',
  'A1-003': 'ʃi hæz ə rɛd bæg',
  'A1-004': 'maɪ neɪm ɪz æhmɛd',
  'A1-005': 'wi lɪv ɪn ə bɪg haʊs',
  'A1-006': 'hi ɪz maɪ brʌðər',
  'A1-007': 'aɪ goʊ tu skul ɛvri deɪ',
  'A1-008': 'ðə sʌn ɪz hɑt tədeɪ',
  'A1-009': 'aɪ hæv tu sɪstərz',
  'A1-010': 'ðɪs ɪz maɪ bʊk',

  // A2 sentences
  'A2-001': 'maɪ mʌðər wɜrks ɪn ə hɑspɪtəl',
  'A2-002': 'ðeɪ wɛnt tu ðə park jɛstərdeɪ æftərnun',
  'A2-003': 'aɪ juʒuəli it lʌnʧ æt wʌn oʊklɑk',
  'A2-004': 'ʃiz wɛrɪŋ ə blu drɛs ænd waɪt ʃuz',
  'A2-005': 'wi steɪd ɪn ə smɔl hoʊtɛl nɪr ðə biʧ',

  // B1 sentences
  'B1-001': 'ɔlðoʊ ɪt wʌz reɪnɪŋ hɛvəli wi dɪsaɪdəd tu kəntɪnju aʊr haɪk',
  'B1-002': 'ðə kɑnfərəns wɪl bi poʊstpoʊnd əntɪl fɜrðər noʊtəs',
  'B1-003': 'ʃi hæz bɪn wɜrkɪŋ æz ə nɜrs fɔr oʊvər tɛn jɪrz',

  // B2 sentences
  'B2-001': 'ði ɪmplɪkeɪʃənz ʌv klaɪmət ʧeɪnʤ ɑn gloʊbəl ægrɪkʌlʧər ɑr far riʧɪŋ ænd kɑmplɛks',
  'B2-002': 'dɪspaɪt numərəs ʧælənʤəz ðə prɑʤɛkt wʌz kəmplitəd wɪðɪn ði æləkeɪtəd taɪm freɪm',
  'B2-003': 'ðə gʌvərnmənts ɪmplɪmənteɪʃən ʌv nu pɑləsiz hæz rɪzʌltəd ɪn sɪgnɪfɪkənt ikənɑmɪk ɪmpruvmənts',

  // C1 sentences
  'C1-001': 'dɪspaɪt ði ɪnɪʃəl rɪzɪstəns frʌm ðə mænəʤmənt tim ðə prəpoʊzəl geɪnd trækʃən æftər ɪt dɛmənstreɪtəd mɛʒərəbəl ɪmpruvmənts ɪn boʊθ ɪfɪʃənsi ænd mərɑl',
  'C1-002': 'waɪl ðə tɛknoʊləʤi prɑməsəz tu rɛvəluʃənaɪz haʊ wi ɪntərækt wɪð ɪnfərmeɪʃən kənsɜrnz əbaʊt praɪvəsi ænd deɪtə mɪsjus rimeɪn ə meɪʤər ɑbstəkəl tu waɪdsprɛd ədɑpʃən',
  'C1-003': 'kɑntrɛri tu pɑpjələr bɪlif mʌltitæskɪŋ ɔfən lidz tu rədust proʊdʌktɪvəti æz ðə breɪn strʌgəlz tu swɪʧ ɪfɛktɪvli bɪtwin kəmbitɪŋ tæsks',
};

/**
 * Get IPA transcription for a sentence by ID, with fallback to generation
 */
export const getIPAForSentence = (sentenceId: string, sentenceText: string): string => {
  // First try pre-generated mapping
  if (sentenceIPAMappings[sentenceId]) {
    return sentenceIPAMappings[sentenceId];
  }
  
  // Fall back to automatic generation
  return generateIPATranscription(sentenceText).ipa;
};