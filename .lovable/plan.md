
# Fix Plan: Navigation to Start Assessment After Profile Form

## Problem Summary

After successfully authenticating and saving profile data, the assessment flow is not navigating to the "Welcome" step (start assessment page). The user remains stuck, likely seeing the assessment options screen instead of proceeding.

## Root Cause Analysis

After tracing the code flow, I identified **two related issues**:

### Issue 1: `showAssessmentOptions` State Not Persisted

In `AssessmentFlow.tsx`, the `showAssessmentOptions` state is initialized with `useState(true)`:
```javascript
const [showAssessmentOptions, setShowAssessmentOptions] = useState(true);
```

While `currentStep` changes are handled with module-level flags (`moduleInitializing`, `moduleHasInitialized`, `modulePendingStudentInfo`) to persist across auth-triggered re-renders, `showAssessmentOptions` is NOT similarly protected.

When authentication succeeds:
1. `ProfileForm` completes auth and calls `onSubmit()`
2. `handleProfileSubmit` → `onStart()` → `initializeAssessmentFlow()`
3. `setShowAssessmentOptions(false)` is called
4. `setCurrentStep(WELCOME)` is called
5. **BUT** auth state change triggers re-render
6. If the component remounts, `showAssessmentOptions` resets to `true`

### Issue 2: `showAssessmentOptions` Check Blocks Step Rendering

In `AssessmentStepRenderer.tsx` lines 72-78:
```javascript
if (showAssessmentOptions) {
  return <AssessmentOptions ... />;
}
switch (currentStep) { ... }
```

Even if `currentStep` is correctly set to `WELCOME`, if `showAssessmentOptions` is `true`, the user sees `AssessmentOptions` instead of the welcome screen.

### Issue 3: TestEntryStep vs SignUpSheet Flow Mismatch

There are **two paths** to profile submission:
1. **SignUpSheet path**: Uses module-level guards and `handleSignUpSuccess` callback
2. **TestEntryStep path**: Directly calls `onStart()` without the same guards

The `TestEntryStep` path (triggered when user clicks "Quick Assessment" → fills profile) doesn't have the same protection mechanisms.

## Solution

### Phase 1: Persist `showAssessmentOptions` at Module Level

Similar to how `moduleInitializing` and `moduleHasInitialized` are module-level, add a module-level flag for the assessment options state.

**File: `src/components/assessment/AssessmentFlow.tsx`**

```typescript
// Module-level flags to persist across re-renders caused by auth state changes
let moduleInitializing = false;
let moduleHasInitialized = false;
let modulePendingStudentInfo: StudentInfo | null = null;
let moduleShowAssessmentOptions = true; // ADD THIS

// Inside the component:
const [showAssessmentOptions, setShowAssessmentOptions] = useState(moduleShowAssessmentOptions);

// Sync module-level flag whenever state changes
useEffect(() => {
  moduleShowAssessmentOptions = showAssessmentOptions;
}, [showAssessmentOptions]);
```

### Phase 2: Add Guard for TestEntryStep Path

The `TestEntryStep.handleProfileSubmit` path needs the same initialization guards.

**File: `src/components/assessment/AssessmentStepRenderer.tsx`**

Create a wrapper callback that mimics `handleSignUpSuccess` behavior:

```typescript
// Wrap the initializeAssessment call with guards
const handleTestEntryStart = (withEmail: boolean) => {
  if (moduleInitializing || moduleHasInitialized) {
    console.log("Already initializing, skipping duplicate call");
    return;
  }
  initializeAssessment(withEmail);
};
```

Then pass this wrapper to `TestEntryStep`:
```typescript
<TestEntryStep 
  onStart={handleTestEntryStart}
  onStudentInfoSubmit={onStudentInfoSubmit}
/>
```

### Phase 3: Ensure Step Change Happens Before Auth Triggers Re-render

The current code sets `currentStep` to `WELCOME` synchronously, which is correct. However, we need to ensure the `showAssessmentOptions = false` also persists.

**File: `src/hooks/assessment/useAssessmentFlowActions.ts`**

No changes needed here - the synchronous `setCurrentStep(WELCOME)` is already correct.

### Phase 4: Reset Module Flags on Full Reset

When the assessment is reset, ensure all module-level flags are reset.

**File: `src/components/assessment/AssessmentFlow.tsx`**

The `handleAfterReset` function already resets module flags, but add the new one:
```typescript
const handleAfterReset = () => {
  moduleInitializing = false;
  moduleHasInitialized = false;
  modulePendingStudentInfo = null;
  moduleShowAssessmentOptions = true; // ADD THIS
  isFromProfileForm.current = false;
  
  resetAssessment();
  setShowAssessmentOptions(true);
};
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/assessment/AssessmentFlow.tsx` | Add `moduleShowAssessmentOptions` module-level flag, sync with state, update reset function |
| `src/components/assessment/AssessmentStepRenderer.tsx` | Add guarded wrapper for `initializeAssessment` (optional, depends on architecture preference) |

## Implementation Details

### AssessmentFlow.tsx Changes

```typescript
// Line 12-15: Add new module-level flag
let moduleInitializing = false;
let moduleHasInitialized = false;
let modulePendingStudentInfo: StudentInfo | null = null;
let moduleShowAssessmentOptions = true; // NEW

// Line 25: Initialize from module-level
const [showAssessmentOptions, setShowAssessmentOptions] = useState(moduleShowAssessmentOptions);

// Add new useEffect after line 27:
useEffect(() => {
  moduleShowAssessmentOptions = showAssessmentOptions;
}, [showAssessmentOptions]);

// Line 189-197: Update handleAfterReset
const handleAfterReset = () => {
  moduleInitializing = false;
  moduleHasInitialized = false;
  modulePendingStudentInfo = null;
  moduleShowAssessmentOptions = true; // NEW
  isFromProfileForm.current = false;
  
  resetAssessment();
  setShowAssessmentOptions(true);
};
```

## Testing Verification

After implementation:

1. **Test Quick Assessment Flow:**
   - Go to `/assessment`
   - Click "Quick Assessment" → "Create Profile"
   - Fill in the profile form with valid data
   - Click "Create Profile & Start Assessment"
   - Verify: Should navigate to Welcome step (not stuck on options)

2. **Test Skip Profile Flow:**
   - Go to `/assessment`
   - Click "Quick Assessment"
   - Click "Skip Profile & Start Test"
   - Verify: Should navigate to Welcome step immediately

3. **Test Sign Up Sheet Flow:**
   - Go to `/assessment`
   - Click "Sign Up" button
   - Fill in profile form
   - Submit
   - Verify: Should navigate to Welcome step

4. **Use Debug Panel:**
   - Add `?debug=true` to URL
   - Watch the debug panel to see step changes in real-time
   - Confirm `Step: welcome` appears after form submission

## Why This Fix Works

1. **Module-level persistence**: By storing `showAssessmentOptions` at module level, the value survives any component remounts caused by auth state changes

2. **Sync on change**: The `useEffect` keeps the module-level flag in sync with React state, ensuring consistency

3. **Proper reset**: The reset function clears all module-level flags, ensuring clean state for new assessments

4. **No race conditions**: Since `setCurrentStep(WELCOME)` is already synchronous and happens first, the step is set before any async auth operations can trigger re-renders
