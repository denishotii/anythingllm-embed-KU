# Feedback Logic Implementation Plan

## Overview
This document outlines the implementation strategy for the randomized feedback system in the KUala-Bot chat widget.

## Randomized Feedback Strategy

### Three Random Options (Weighted Probabilities):

> **Key principle:** all timing is anchored to the moment the bot's answer has
> **fully rendered** (streaming/typing finished), never to when the user sent the
> prompt. The feedback modal is therefore never shown over an answer that is still
> being written.

1. **Option 1 (50% chance)**: 
   - **Trigger**: After 1 user + 1 bot message, once the answer has fully rendered
   - **Timing**: Wait 30 seconds after the answer finishes (INACTIVITY)
   - **Purpose**: Capture quick interactions and immediate feedback

2. **Option 2 (30% chance)**:
   - **Trigger**: After the user's 2nd question has been answered (2 user + 2 bot messages), once that answer has fully rendered
   - **Timing**: Show 5 seconds after the answer finishes (POST_ANSWER)
   - **Purpose**: Capture feedback from more engaged users during longer conversations

3. **Option 3 (20% chance)**:
   - **Trigger**: Never show feedback
   - **Purpose**: Avoid feedback fatigue and reduce user annoyance

### Anti-Spam Protection:
- ✅ Track by Session ID only
- ✅ Never show to same session ID again
- ✅ One feedback prompt per session maximum
- ✅ Strategy determined once per session (no mid-conversation changes)

## Technical Implementation Flow

```
Chat Session Starts
↓
Generate Random Strategy (50/30/20)
↓
Store Strategy for Session ID
↓
Monitor Messages in Real-time
↓
Check if Strategy Conditions Met
↓
Wait Until Answer Has Fully Rendered
↓
Execute Timing Logic (measured from answer completion):
  - Option 1: 30 seconds after the answer finishes
  - Option 2: 5 seconds after the answer finishes
  - Option 3: Never trigger
↓
Show Feedback Modal
↓
Mark Session as "Feedback Shown"
↓
Never Show Again for This Session
```

## Key Components

### 1. `useFeedbackTrigger` Hook
- Manages the entire feedback logic
- Generates and stores random strategy per session
- Monitors chat history for trigger conditions
- Handles timing delays and immediate triggers

### 2. Message Tracking
- Counts user messages vs bot responses
- Tracks message sequence (User → Bot → User pattern)
- Monitors chat history changes in real-time

### 3. Timer Management
- Detects answer completion via the `pending`/`animate` message flags
- Arms the 30s (Option 1) / 5s (Option 2) delay from the completion moment
- Re-arms from the newest answer if the user sends a follow-up while waiting
- Cleans up timers on component unmount

### 4. Strategy Storage
- Uses localStorage to remember chosen strategy per session
- Prevents strategy changes mid-conversation
- Tracks which sessions have already shown feedback

### 5. Integration Points
- Works with existing `FeedbackModal` component
- Integrates with current chat history tracking
- Uses existing `FeedbackService` for API calls

## Implementation Details

### Random Strategy Generation
```javascript
const getFeedbackStrategy = (sessionId) => {
  // Check if already shown to this session
  const sessionKey = `feedback_shown_${sessionId}`;
  if (localStorage.getItem(sessionKey)) {
    return null; // Don't show
  }
  
  // Random weighted selection
  const random = Math.random();
  if (random < 0.50) return 'option1';      // 50% - 2 messages + 8s
  if (random < 0.80) return 'option2';      // 30% - 3 messages + immediate
  return null;                              // 20% - no feedback
};
```

### Message Counting Logic
- Count actual user messages (role: "user")
- Count actual bot responses (role: "assistant")
- Exclude pending/loading messages
- Track message sequence for trigger conditions

### Timing Implementation
- **Option 1**: Set 30-second timer after the answer has fully rendered
- **Option 2**: Set 5-second timer after the answer has fully rendered
- **Option 3**: No timer, no trigger

## Benefits

1. **Reduced User Fatigue**: Only 80% of users see feedback prompts
2. **Diverse Data Collection**: Different timing strategies capture various user behaviors
3. **Anti-Spam Protection**: One feedback per session maximum
4. **Smart Timing**: Balances immediate feedback with user experience
5. **Scalable**: Easy to adjust percentages or add new strategies

## Future Enhancements

- A/B testing different percentage distributions
- Analytics on feedback trigger effectiveness
- User preference settings for feedback frequency
- Integration with user behavior analytics
