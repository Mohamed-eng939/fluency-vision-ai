import React from 'react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AccountSection } from './AccountSection';
import { PersonalInfoSection } from './PersonalInfoSection';
import { LearningContextSection } from './LearningContextSection';
import { PreferencesSection } from './PreferencesSection';
import { ConsentSection } from './ConsentSection';
import { profileFormSchema, ProfileFormValues } from './types';
import { countries, languages, cefrLevels, testReasons } from './constants';
import { StudentInfo } from '@/hooks/assessment';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/language/LanguageContext';
import { useAuth } from '@/contexts/auth';

interface ProfileFormProps {
  onSubmit: (data: StudentInfo) => void;
  onCancel?: () => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const { toast } = useToast();
  const { t, dir } = useLanguage();
  const { user } = useAuth();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      citizenshipCountry: '',
      residenceCountry: '',
      firstLanguage: '',
      testReason: '',
      estimatedLevel: '',
      preferredContact: 'email',
      pronunciationPreference: 'neutral',
      promoCode: '',
      dataConsent: false,
      emailResults: false,
      dateOfBirth: new Date(2000, 0, 1), // Default date to prevent undefined issues
    },
  });

  const [loading, setLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const hasProceededRef = React.useRef(false);
  const authPhaseRef = React.useRef<'idle' | 'waiting_session' | 'proceeded'>('idle');

  // Pre-fill from what we already know so the student never re-types data we
  // already hold: the signed-in profile, or the lead/invite the agent/partner
  // already captured. When signed in, the account (email/password) section is
  // hidden and no second account is created.
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      const set = (k: keyof ProfileFormValues, v: any) => {
        if (v !== undefined && v !== null && v !== '') form.setValue(k, v as any, { shouldValidate: false });
      };
      // Lead / invite candidate captured earlier (sales agent or partner handoff).
      try {
        const lead = JSON.parse(sessionStorage.getItem('lead_candidate') || 'null');
        const inv = JSON.parse(sessionStorage.getItem('invite_candidate') || 'null');
        const c = lead || inv;
        if (c) {
          set('name', c.name);
          set('email', c.email);
          set('phone', c.phone);
          set('citizenshipCountry', c.nationality || c.country);
        }
      } catch { /* ignore */ }

      if (user) {
        set('name', user.full_name);
        set('email', user.email);
        try {
          const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (!cancelled && data) {
            const p = data as any;
            set('phone', p.phone);
            set('citizenshipCountry', p.country_of_citizenship);
            set('residenceCountry', p.country_of_residence);
            set('firstLanguage', p.first_language);
            if (p.date_of_birth) form.setValue('dateOfBirth', new Date(p.date_of_birth));
          }
        } catch { /* ignore */ }
        // The account section is hidden when signed in; satisfy the schema with
        // a throwaway password (never used — we skip signUp) and a stable username.
        const pw = `Aa1!${Math.random().toString(36).slice(2, 12)}`;
        form.setValue('password', pw);
        form.setValue('confirmPassword', pw);
        const uname = ((user.email || user.full_name || 'user').split('@')[0] || 'user')
          .replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 20);
        form.setValue('username', uname.length >= 3 ? uname : `user${Math.floor(Math.random() * 1000)}`);
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Safety: never allow an infinite "Saving..." state
  React.useEffect(() => {
    if (!loading) return;
    const t = window.setTimeout(() => {
      if (!hasProceededRef.current) {
        // Allow longer when we're waiting for Supabase to finalize session storage.
        const phase = authPhaseRef.current;
        console.error(`⏱️ ProfileForm watchdog: still loading (phase=${phase}).`);
        if (phase !== 'waiting_session') {
          setErrorMsg('Request is taking too long. Please try again.');
          setLoading(false);
        }
      }
    }, 35000);
    return () => window.clearTimeout(t);
  }, [loading]);

  const withTimeout = async <T,>(promiseLike: PromiseLike<T>, ms: number, label: string): Promise<T> => {
    let timeoutId: number | undefined;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutId = window.setTimeout(() => {
        reject(new Error(`${label} timed out after ${ms}ms`));
      }, ms);
    });

    try {
      // Supabase query builders are PromiseLike (thenable) but not typed as Promise.
      const promise = Promise.resolve(promiseLike);
      return await Promise.race([promise, timeoutPromise]);
    } finally {
      if (timeoutId) window.clearTimeout(timeoutId);
    }
  };

  const waitForSession = async (ms: number) => {
    const start = Date.now();

    // Fast path
    const existing = await supabase.auth.getSession();
    console.log('🔎 waitForSession: initial getSession hasSession=', !!existing.data.session);
    if (existing.data.session) return existing.data.session;

    return await new Promise<NonNullable<Awaited<ReturnType<typeof supabase.auth.getSession>>['data']['session']>>(
      (resolve, reject) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
          console.log('🔔 waitForSession onAuthStateChange:', { event: _event, hasSession: !!session });
          if (session) {
            subscription.unsubscribe();
            resolve(session);
          }
        });

        const t = window.setInterval(async () => {
          // Also poll, because onAuthStateChange can be missed during rapid remounts
          const s = await supabase.auth.getSession();
          console.log('🔁 waitForSession poll getSession hasSession=', !!s.data.session);
          if (s.data.session) {
            window.clearInterval(t);
            subscription.unsubscribe();
            resolve(s.data.session);
          } else if (Date.now() - start > ms) {
            window.clearInterval(t);
            subscription.unsubscribe();
            reject(new Error(`Session not available after ${ms}ms`));
          }
        }, 500);
      }
    );
  };

  // Auto-generate username
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === 'name' || name === 'phone') && value.name && value.phone?.length >= 4) {
        const baseName = value.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const lastFour = value.phone.slice(-4).replace(/\D/g, '');
        if (baseName && lastFour.length >= 4) {
          form.setValue('username', `${baseName}${lastFour}`);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Reset error after timeout
  React.useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => {
        setErrorMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMsg]);

  const handleSubmit = async (values: ProfileFormValues) => {
    console.log('🚀 Form submission started with values:', values);
    setLoading(true);
    setErrorMsg(null);
    hasProceededRef.current = false;
    authPhaseRef.current = 'idle';

    try {
      // Validate required fields first (password only matters for new accounts)
      if (!values.name || !values.email || (!user && !values.password)) {
        throw new Error('Please fill in all required fields');
      }

      if (!values.dataConsent) {
        throw new Error('You must agree to the data usage terms');
      }

      console.log('📧 Starting authentication with:', values.email);

      // Auth strategy:
      // - Fire signUp first.
      // - If user already exists, fire signIn.
      // - Do NOT block the UX on those promises; instead proceed when Supabase session becomes available.
      let userId: string;

      if (user) {
        // Already signed in — never create a second account. Reuse the session;
        // the detailed fields below are gathered once.
        userId = user.id;
        console.log('✅ Already authenticated; reusing session for', userId);
      } else {
      let session;

      console.time('⏱️ supabase.auth.signUp (best-effort)');
      const signUpRes = await withTimeout<any>(
        supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              name: values.name,
              phone: values.phone,
            },
            emailRedirectTo: `${window.location.origin}/assessment`,
          },
        }) as any,
        12000,
        'Sign up'
      ).catch((e) => {
        console.warn('⚠️ signUp best-effort timed out/failed (will still wait for session):', e);
        return null;
      }).finally(() => {
        console.timeEnd('⏱️ supabase.auth.signUp (best-effort)');
      });

      const signUpError = signUpRes?.error;
      const signUpData = signUpRes?.data;
      console.log('🔐 SignUp result:', signUpData, signUpError);

      // Use session from signUp if available
      if (signUpData?.session) {
        console.log('✅ Got session directly from signUp response');
        session = signUpData.session;
      } else if (signUpError && String(signUpError.message || '').includes('User already registered')) {
        console.log('👤 User exists, attempting sign in...');
        console.time('⏱️ supabase.auth.signInWithPassword');
        try {
          const signInRes = await withTimeout<any>(
            supabase.auth.signInWithPassword({ email: values.email, password: values.password }) as any,
            15000,
            'Sign in'
          );
          console.log('🔑 SignIn result:', signInRes?.data, signInRes?.error);
          if (signInRes?.error) {
            throw new Error(`Sign in failed: ${signInRes.error.message}`);
          }
          session = signInRes?.data?.session;
        } finally {
          console.timeEnd('⏱️ supabase.auth.signInWithPassword');
        }
      } else if (signUpError) {
        // For other signup errors, stop early.
        throw new Error(`Sign up failed: ${signUpError.message}`);
      }

      // Only wait for session if we don't have one yet
      if (!session) {
        console.log('⏳ No session from auth response; waiting for Supabase session...');
        authPhaseRef.current = 'waiting_session';
        session = await waitForSession(25000);
      }
      console.log('✅ Session available. Proceeding.');

      if (!session) {
        console.error('❌ No session after auth');
        throw new Error('Authentication failed - no session created');
      }

      userId = session.user.id;
      }
      console.log('✅ Authentication successful, userId:', userId);

      // 4️⃣ Convert to StudentInfo format
      // IMPORTANT: Proceed to assessment immediately after auth to avoid UI getting stuck
      // if profile upsert/select stalls due to network/RLS/timing.
      const studentInfoData: StudentInfo = {
        name: values.name,
        email: values.email,
        username: values.username,
        phone: values.phone,
        citizenshipCountry: values.citizenshipCountry,
        residenceCountry: values.residenceCountry,
        dateOfBirth: values.dateOfBirth,
        firstLanguage: values.firstLanguage,
        testReason: values.testReason,
        otherReason: values.otherReason,
        estimatedLevel: values.estimatedLevel,
        preferredContact: values.preferredContact,
        pronunciationPreference: values.pronunciationPreference,
        promoCode: values.promoCode,
        dataConsent: values.dataConsent,
        emailResults: values.emailResults,
      };

      if (!hasProceededRef.current) {
        hasProceededRef.current = true;
        console.log('🎉 Proceeding to assessment (onSubmit) before DB upsert');
        onSubmit(studentInfoData);
      }

      // 2️⃣ Prepare profile data
      const profileData = {
        id: userId,
        full_name: values.name, // Fixed: database column is 'full_name', not 'name'
        username: values.username,
        email: values.email,
        phone: values.phone,
        date_of_birth: values.dateOfBirth.toISOString().split('T')[0], // Convert Date to string
        country_of_citizenship: values.citizenshipCountry,
        country_of_residence: values.residenceCountry,
        first_language: values.firstLanguage,
        test_reason: values.testReason,
        other_reason: values.otherReason || null,
        estimated_level: values.estimatedLevel,
        preferred_contact: values.preferredContact,
        pronunciation_preference: values.pronunciationPreference,
        promo_code: values.promoCode || null,
        data_consent: values.dataConsent,
        email_results: values.emailResults,
      };

      console.log('💾 Saving profile data:', profileData);
      
      // 3️⃣ Save to database
      // Avoid `.select()` here—if it fails or stalls, the user experience should still proceed.
      const upsertQuery = supabase
        .from('profiles')
        .upsert([profileData]);

      const { error: dbError } = await withTimeout<any>(upsertQuery as any, 8000, 'Profile save');

      console.log('🗃️ Database result:', { ok: !dbError }, dbError);

      if (dbError) {
        console.error('❌ Database error:', dbError);
        throw new Error(`Database save failed: ${dbError.message}`);
      }

      console.log('✅ Profile saved successfully');

      // Then show success feedback
      toast({
        title: "Success",
        description: "Profile created successfully!",
      });

    } catch (err: any) {
      console.error('❌ Profile submission error:', err);
      const errorMessage = err.message || 'Unexpected error occurred';
      console.error('Setting error message:', errorMessage);
      
      setErrorMsg(errorMessage);
      
      // If we already proceeded to assessment, don't block the user with a hard failure.
      // Still surface the error for visibility.
      toast({
        title: hasProceededRef.current ? "Saved with warning" : "Error",
        description: hasProceededRef.current
          ? `Assessment started, but profile save had an issue: ${errorMessage}`
          : errorMessage,
        variant: hasProceededRef.current ? undefined : "destructive",
      });
    } finally {
      console.log('🏁 Setting loading to false');
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return t('Saving…', 'جارٍ الحفظ…');
    if (errorMsg) return `${t('Error', 'خطأ')}: ${errorMsg}`;
    return user
      ? t('Confirm & Start Assessment', 'تأكيد وبدء التقييم')
      : t('Create Profile & Start Assessment', 'أنشئ الملف وابدأ التقييم');
  };

  const getButtonStyle = () => {
    if (errorMsg) return 'bg-destructive hover:bg-destructive/90 text-destructive-foreground';
    return 'bg-primary hover:bg-primary/90 text-primary-foreground';
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8" dir={dir}>
        <PersonalInfoSection form={form} countries={countries} languages={languages} />
        {/* Account creation is only for brand-new users — a signed-in student
            (or one who already registered) is never asked for email/password
            again. */}
        {!user && <AccountSection form={form} />}
        <LearningContextSection form={form} testReasons={testReasons} cefrLevels={cefrLevels} />
        <PreferencesSection form={form} />
        <ConsentSection form={form} />

        <Button
          type="submit"
          disabled={loading}
          className={`w-full ${getButtonStyle()}`}
        >
          {getButtonText()}
        </Button>
      </form>
    </Form>
  );
};