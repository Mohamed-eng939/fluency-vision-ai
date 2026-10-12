import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export type Lang = 'en' | 'ar';

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  toggle: () => void;
  dir: 'ltr' | 'rtl';
  /** Inline bilingual helper: t('English', 'العربية'). */
  t: (en: string, ar: string) => string;
}

const STORAGE_KEY = 'upedia_lang';
const LanguageContext = createContext<LanguageContextValue | null>(null);

const readInitial = (): Lang => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'ar' || v === 'en') return v;
  } catch { /* storage blocked */ }
  return 'en';
};

/**
 * Lightweight UI language for the learner-facing assessment flow (sign-up form,
 * mic check / prep, pre-test message). Not a full i18n framework — screens call
 * `t('English', 'Arabic')` inline. The preference persists per browser.
 */
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(readInitial);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch { /* ignore */ }
  }, []);

  const toggle = useCallback(() => setLang(lang === 'ar' ? 'en' : 'ar'), [lang, setLang]);

  const value = useMemo<LanguageContextValue>(() => ({
    lang,
    setLang,
    toggle,
    dir: lang === 'ar' ? 'rtl' : 'ltr',
    t: (en, ar) => (lang === 'ar' ? ar : en),
  }), [lang, setLang, toggle]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback so a component used outside the provider still renders in English.
    return {
      lang: 'en',
      setLang: () => {},
      toggle: () => {},
      dir: 'ltr',
      t: (en) => en,
    };
  }
  return ctx;
};
