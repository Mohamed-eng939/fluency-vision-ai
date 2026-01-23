
# Fix Plan: Assessment Flow Not Advancing After Profile Save

## Problem Summary
After creating a profile or clicking "Skip Profile & Start Test", the assessment gets stuck on the entry step despite successful authentication and prompt initialization. The console shows:
- `Auth state changed: SIGNED_IN`
- `[PROMPT_INIT]` logs (from hook re-execution, not actual initialization)
- But `currentStep` remains `entry` and `user` shows as `null`

## Root Cause Analysis

### Issue 1: Stale Closure with Async State Updates
The `initializeAssessmentFlow` function is async, but the auth state change from `supabase.auth.signUp()` triggers an immediate re-render BEFORE the async function completes:

```
ProfileForm.handleSubmit()
  ↓
supabase.auth.signUp() → triggers onAuthStateChange
  ↓
onAuthStateChange sets user in AuthContext
  ↓
AssessmentFlow re-renders with new hook instances
  ↓
OLD initializeAssessmentFlow continues with STALE closure references
  ↓
setCurrentStep(WELCOME) may not work properly
```

### Issue 2: Misleading Log Messages
The `[PROMPT_INIT]` logs appear on every hook execution (line 27 of `usePromptManagement.ts`), not when `initializePromptQueue()` is called. This creates confusion about what's actually executing.

### Issue 3: No State Persistence Across Auth Changes
The assessment state is managed by hooks that reinitialize on each render. When auth state changes cause re-renders, there's no mechanism to preserve the in-progress initialization.

## Solution

### Phase 1: Make State Transitions Synchronous and Guaranteed

**File: `src/hooks/assessment/useAssessmentFlowActions.ts`**

Restructure `initializeAssessmentFlow` to set the step FIRST (synchronously), then do async operations:

```typescript
const initializeAssessmentFlow = async (withEmail: boolean = false) => {
  console.log("🚀 INIT: Starting assessment initialization with email:", withEmail);
  
  // CRITICAL: Set step to WELCOME FIRST, synchronously, before any async operations
  console.log("🎯 INIT: setCurrentStep(WELCOME) - SYNCHRONOUS");
  setCurrentStep(AssessmentStep.WELCOME);
  
  // Now do async operations - they won't affect the step
  try {
    const sessionId = await initializeSession(withEmail);
    console.log("✅ INIT: Session initialized with ID:", sessionId);
    
    initializePromptQueue();
    resetScoring();
    resetStoredResponses();
    console.log("✅ INIT: All initializations complete");
  } catch (error) {
    console.error("❌ INIT: Error during initialization (step already set to WELCOME):", error);
  }
};
```

### Phase 2: Fix Misleading Logs in usePromptManagement

**File: `src/hooks/assessment/usePromptManagement.ts`**

Move the logging inside `initializePromptQueue` and make `orderedPrompts` a memoized value:

```typescript
import { useState, useMemo } from 'react';

export const usePromptManagement = (maxPrompts: number = 38) => {
  // Memoize sorted prompts to prevent recalculation on every render
  const sortedPrompts = useMemo(() => {
    const freeSpeakingPrompts = mockPrompts.filter(p => !p.isReadAloud);
    const readAloudPrompts = mockPrompts.filter(p => p.isReadAloud);
    return [...freeSpeakingPrompts, ...readAloudPrompts];
  }, []);
  
  // ... rest of hook ...
  
  const initializePromptQueue = () => {
    console.info('[PROMPT_QUEUE_INIT] Actually initializing queue now');
    console.info('[PROMPT_QUEUE_INIT] Available prompts:', sortedPrompts.length);
    // ... rest of function
  };
};
```

### Phase 3: Add useRef Flag to Prevent Auth Re-render Issues

**File: `src/components/assessment/AssessmentFlow.tsx`**

Add a ref to track initialization state that persists across re-renders:

```typescript
const isInitializing = useRef(false);
const hasInitialized = useRef(false);

const handleSignUpSuccess = (studentInfo: StudentInfo) => {
  console.log("AssessmentFlow: SignUp successful");
  
  if (isInitializing.current || hasInitialized.current) {
    console.log("AssessmentFlow: Already initializing/initialized, skipping");
    return;
  }
  
  isInitializing.current = true;
  isFromProfileForm.current = true;
  
  handleStudentInfoSubmit(studentInfo);
  setShowSignUpDialog(false);
  setShowAssessmentOptions(false);
  
  // Initialize assessment
  initializeAssessment(studentInfo.emailResults || false).finally(() => {
    isInitializing.current = false;
    hasInitialized.current = true;
  });
};
```

### Phase 4: Add Debug Panel for Visibility

**File: `src/components/assessment/AssessmentFlow.tsx`**

Add a debug panel (shown with `?debug=true` query param) to track state in real-time:

```typescript
const [searchParams] = useSearchParams();
const showDebug = searchParams.get('debug') === 'true';

// In render:
{showDebug && (
  <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50">
    <div>Step: {currentStep}</div>
    <div>User: {user?.id || 'null'}</div>
    <div>StudentInfo: {studentInfo?.name || 'null'}</div>
    <div>SessionId: {sessionId || 'null'}</div>
    <div>PromptQueue: {promptQueue?.length || 0}</div>
  </div>
)}
```

### Phase 5: Clean Up Duplicate AuthContext File

**File to delete: `src/contexts/AuthContext.tsx`**

This file is not being imported anywhere but could cause confusion. Delete it to prevent future issues.

## Files to Modify

1. `src/hooks/assessment/useAssessmentFlowActions.ts` - Move `setCurrentStep(WELCOME)` to be synchronous and first
2. `src/hooks/assessment/usePromptManagement.ts` - Fix misleading logs, memoize sorted prompts
3. `src/components/assessment/AssessmentFlow.tsx` - Add initialization guards and debug panel
4. `src/contexts/AuthContext.tsx` - Delete (unused duplicate file)

## Testing Verification

After implementation:
1. Go to `/assessment?debug=true`
2. Click "Quick Assessment" → "Skip Profile & Start Test"
3. Debug panel should show: Step changes from `entry` → `welcome`
4. Click "Start" → Step changes to `recording`
5. Verify no duplicate initialization logs

For signup flow:
1. Click "Sign Up" → Fill form → Submit
2. Debug panel should show user ID after auth
3. Step should be `welcome` (not stuck on `entry`)

## Why This Will Work

1. **Synchronous step change**: By setting `currentStep` to `WELCOME` synchronously BEFORE any async operations (like `initializeSession`), the state is set before auth triggers any re-renders

2. **Ref guards**: Using refs to track initialization state persists across re-renders and prevents duplicate initializations

3. **Better logging**: Moving logs inside actual function calls rather than hook body prevents misleading output

4. **Debug visibility**: The debug panel allows immediate verification of state during testing
