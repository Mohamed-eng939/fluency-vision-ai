
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import MicCheck from './MicCheck';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/contexts/language/LanguageContext';

interface WelcomeStepProps {
  onStart: () => void;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onStart }) => {
  const [micReady, setMicReady] = useState(false);
  const { t, dir } = useLanguage();

  return (
    <Card className="max-w-lg mx-auto" dir={dir}>
      <CardHeader className="text-center">
        <div className="mb-2 flex justify-end">
          <LanguageToggle />
        </div>
        <h2 className="text-2xl font-bold text-assessment-blue">{t('Quick Assessment', 'اختبار سريع')}</h2>
        <p className="text-gray-600">{t('Welcome to your speaking test', 'مرحبًا بك في اختبار المحادثة')}</p>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">{t('Overview', 'نظرة عامة')}</h3>
            <p className="text-gray-700">
              {t(
                'You will answer a short series of spoken questions designed to estimate your CEFR level. The questions will adapt to your ability level.',
                'ستجيب عن سلسلة قصيرة من الأسئلة المنطوقة لتقدير مستواك وفق الإطار الأوروبي المرجعي (CEFR). وتتكيّف الأسئلة مع مستواك.',
              )}
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t('How it works', 'كيف يعمل الاختبار')}</h3>
            <ul className="list-disc ps-5 space-y-1 text-gray-700">
              <li>{t("You'll be presented with one speaking prompt at a time", 'يظهر لك سؤال واحد في كل مرة')}</li>
              <li>{t('Speak naturally in response to each prompt', 'تحدّث بشكل طبيعي للإجابة عن كل سؤال')}</li>
              <li>{t('The test adapts based on your performance', 'يتكيّف الاختبار بناءً على أدائك')}</li>
              <li>{t('Most learners complete 4–10 questions', 'ينهي معظم المتعلمين من ٤ إلى ١٠ أسئلة')}</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-2">{t('Tips for best results', 'نصائح لأفضل النتائج')}</h3>
            <ul className="list-disc ps-5 space-y-1 text-gray-700">
              <li>{t('Speak clearly at a normal pace', 'تحدّث بوضوح وبسرعة طبيعية')}</li>
              <li>{t('Use a quiet environment with minimal background noise', 'اختر مكانًا هادئًا بأقل قدر من الضوضاء')}</li>
              <li>{t('Answer the questions thoroughly but concisely', 'أجب عن الأسئلة بشكل وافٍ ومختصر')}</li>
              <li>{t('You may be asked to talk about yourself, your experiences, and your opinions', 'قد يُطلب منك التحدث عن نفسك وتجاربك وآرائك')}</li>
              <li>{t('There are no right or wrong answers — just speak naturally', 'لا توجد إجابات صحيحة أو خاطئة — تحدّث بشكل طبيعي فقط')}</li>
            </ul>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <MicCheck onReady={() => setMicReady(true)} />

          {/* Pre-test instruction — intentionally shown in BOTH languages. */}
          <div className="rounded-lg border border-assessment-blue/20 bg-assessment-blue/5 p-3 text-sm" dir="ltr">
            <p className="text-gray-800">
              You are about to begin your assessment. Make sure you are in a quiet place, then speak naturally when prompted.
            </p>
            <p className="mt-2 text-gray-800" dir="rtl">
              أنت على وشك بدء التقييم. تأكد من أنك في مكان هادئ، ثم تحدّث بشكل طبيعي عند ظهور السؤال.
            </p>
          </div>

          <Button className="w-full" onClick={onStart} disabled={!micReady}>
            {t('Start Test', 'ابدأ الاختبار')} <ArrowRight className="ms-2 h-4 w-4 rtl:rotate-180" />
          </Button>
          {!micReady && (
            <button
              type="button"
              onClick={onStart}
              className="w-full text-xs text-muted-foreground underline underline-offset-2 hover:text-gray-700 focus-visible:outline-2 focus-visible:outline-assessment-blue"
            >
              {t('Skip the mic check and start anyway', 'تخطَّ فحص الميكروفون وابدأ على أي حال')}
            </button>
          )}
        </div>
      </CardContent>

      <CardFooter className="text-xs text-center text-muted-foreground">
        <p className="w-full">
          {t(
            'Your responses are analyzed by our scoring tools (grammar, fluency and vocabulary) and reviewed by a specialist to estimate your English speaking level.',
            'يتم تحليل إجاباتك بأدوات التقييم لدينا (القواعد والطلاقة والمفردات) ومراجعتها من قبل مختص لتقدير مستواك في التحدث بالإنجليزية.',
          )}
        </p>
      </CardFooter>
    </Card>
  );
};

export default WelcomeStep;
