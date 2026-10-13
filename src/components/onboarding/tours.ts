import type { UserRole } from '@/contexts/auth/types';

export interface TourStep {
  title: string;
  body: string;
}

export interface Tour {
  title: string;
  steps: TourStep[];
}

/**
 * First-login walkthroughs per role. Short, plain-language, and re-openable from
 * the "Guide" button in each dashboard. Kept as data so copy is easy to tweak.
 */
export const TOURS: Partial<Record<UserRole, Tour>> = {
  assessor: {
    title: 'Welcome, Tester 👋',
    steps: [
      {
        title: 'Your queue fills itself',
        body: 'Submitted tests are shared out to testers automatically (round-robin), up to 15 per day. You never have to claim a test — it simply appears in your list.',
      },
      {
        title: 'Review the recordings',
        body: 'Open a test, listen to each answer, and grade Grammar, Fluency and Vocabulary, then confirm the overall CEFR level (you can override it with a reason).',
      },
      {
        title: 'Build the performance report',
        body: 'Choose the Upedia program + Private/Group + level (the band fills in). Add Goals, Feedback and any Other Programs, then click Preview to see exactly what the student gets.',
      },
      {
        title: 'Submit & you’re done',
        body: 'Submitting generates the student’s report. The student and their sales agent are notified automatically — you’ll also get a 🔔 chime when a new test lands.',
      },
    ],
  },
  agent: {
    title: 'Welcome, Sales Agent 👋',
    steps: [
      {
        title: 'Add your leads',
        body: 'Import your leads sheet (.xlsx or .csv) or add leads one by one. Name, phone, nationality and notes are picked up automatically.',
      },
      {
        title: 'Send the test link',
        body: 'Click WhatsApp on any lead to send them their own one-time test link (bilingual message, ready to go).',
      },
      {
        title: 'Track every step',
        body: 'Watch each lead move: New → Link sent → Signed up → Test submitted → Reviewed. The 🔔 bell (with sound) alerts you at each step.',
      },
      {
        title: 'Deliver the report',
        body: 'When a lead reaches Reviewed, open it to View, Download or Email the performance report to the student — then seal the deal.',
      },
    ],
  },
  admin: {
    title: 'Welcome 👋',
    steps: [
      {
        title: 'Your control room',
        body: 'The dashboard shows live counts, CEFR distribution, and a Storage & capacity card so you always know how much room is left for tests.',
      },
      {
        title: 'Manage your people',
        body: 'User Management lets you invite people, set each one’s role (Tester / Student / Sales Agent) and their organization.',
      },
      {
        title: 'Full oversight',
        body: 'Jump into the Tester or Sales Agent panels, review or override any feedback, and get a bell alert if every tester is at capacity so nothing waits unassigned.',
      },
      {
        title: 'It mostly runs itself',
        body: 'Assignment, reports and notifications are automatic — you only step in for the exceptions.',
      },
    ],
  },
  learner: {
    title: 'Welcome to Upedia! 👋',
    steps: [
      {
        title: 'Your results live here',
        body: 'Once a specialist reviews your test, your performance report appears on this page — you can view and download it anytime.',
      },
      {
        title: 'Take a new test whenever',
        body: 'Use “Take a new test” to start again. The test has an Arabic/English toggle, so pick whichever is comfortable.',
      },
    ],
  },
};
