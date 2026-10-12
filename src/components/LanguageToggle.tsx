import React from 'react';
import { useLanguage } from '@/contexts/language/LanguageContext';
import { Languages } from 'lucide-react';

/**
 * EN ⇄ العربية switch for the learner-facing flow. Compact pill; flips the
 * active UI language (and RTL direction where screens honor `dir`).
 */
const LanguageToggle: React.FC<{ className?: string }> = ({ className }) => {
  const { lang, setLang } = useLanguage();
  return (
    <div className={`inline-flex items-center gap-1 rounded-full border bg-white/80 p-0.5 text-xs ${className || ''}`}>
      <Languages className="ml-1.5 h-3.5 w-3.5 text-muted-foreground" aria-hidden />
      <button
        type="button"
        onClick={() => setLang('en')}
        aria-pressed={lang === 'en'}
        className={`rounded-full px-2.5 py-1 font-medium transition ${lang === 'en' ? 'bg-assessment-blue text-white' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLang('ar')}
        aria-pressed={lang === 'ar'}
        className={`rounded-full px-2.5 py-1 font-medium transition ${lang === 'ar' ? 'bg-assessment-blue text-white' : 'text-muted-foreground hover:text-foreground'}`}
      >
        العربية
      </button>
    </div>
  );
};

export default LanguageToggle;
