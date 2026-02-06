

# Improved Auth Page UX - Split CTA Buttons

## The Problem
The current auth page has a subtle text link toggle at the bottom that users easily miss. This leads to confusion when returning users try to create duplicate accounts.

## Solution
Replace the single dynamic button + text toggle with **two clearly separated action buttons**:

1. **Primary CTA**: "Create Account" (gradient button - sign up)
2. **Secondary CTA**: "I already have an account" (outlined/ghost button - sign in)

When user clicks "I already have an account", the form switches to sign-in mode with the buttons flipped.

## Visual Design

### Sign Up Mode (Default)
```text
+----------------------------------------+
|  [Email Input                       ]  |
|  [Password Input                    ]  |
|                                        |
|  [ Create Account            ] ← Primary gradient button
|                                        |
|  [ I already have an account ] ← Secondary outlined button
|                                        |
|  🔒 Secure & encrypted                 |
|                                        |
|  ─────── or ───────                    |
|  [ Continue with Google ]              |
+----------------------------------------+
```

### Sign In Mode
```text
+----------------------------------------+
|  [Email Input                       ]  |
|  [Password Input                    ]  |
|                                        |
|  [ Sign In                   ] ← Primary gradient button
|                                        |
|  [ Create a new account      ] ← Secondary outlined button
|                                        |
|  🔒 Secure & encrypted                 |
|                                        |
|  ─────── or ───────                    |
|  [ Continue with Google ]              |
+----------------------------------------+
```

## Changes to Auth.tsx

### Remove
- Bottom text toggle (lines 360-369)
- Bottom dot indicators (lines 373-379)

### Modify
Replace the single submit button with two buttons stacked:

```tsx
<div className="pt-3 space-y-3">
  {/* Primary action button */}
  <Button
    type="submit"
    disabled={loading}
    size="lg"
    className="w-full h-13 bg-gradient-to-r from-primary to-secondary ..."
  >
    {loading ? (
      <LoadingSpinner />
    ) : (
      isSignUp ? "Create Account" : "Sign In"
    )}
  </Button>
  
  {/* Secondary action button - switches mode */}
  <Button
    type="button"
    variant="outline"
    size="lg"
    onClick={() => setIsSignUp(!isSignUp)}
    disabled={loading}
    className="w-full h-12 border-border/60 hover:bg-muted/50 ..."
  >
    {isSignUp ? "I already have an account" : "Create a new account"}
  </Button>
</div>
```

## File Changes

| File | Action |
|------|--------|
| `src/pages/Auth.tsx` | Replace single CTA + text toggle with dual button layout |

## Benefits
- Zero database/AI calls needed
- Immediately obvious to users
- Both options equally visible
- Reduces sign-up friction for new users
- Reduces confusion for returning users
- Clean, modern dual-button pattern

