# Feedback Logic Implementation Plan

## Overview
This document outlines the implementation strategy for the randomized feedback system in the KUala-Bot chat widget.

## Randomized Feedback Strategy

### Three Random Options (Weighted Probabilities):

1. **Option 1 (50% chance)**: 
   - **Trigger**: After 2 messages (1 user + 1 bot)
   - **Timing**: Wait 20 seconds after bot's response
   - **Purpose**: Capture quick interactions and immediate feedback

2. **Option 2 (30% chance)**:
   - **Trigger**: After 3 messages (User → Bot → User → Show feedback while bot responds)
   - **Timing**: Show immediately while bot is still generating response
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
Execute Timing Logic:
  - Option 1: 20 seconds after bot response
  - Option 2: Immediately after 3rd message
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
- Handles 8-second delay for Option 1
- Manages immediate triggers for Option 2
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
- **Option 1**: Set 8-second timer after bot response
- **Option 2**: Show immediately when 3rd message condition met
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
