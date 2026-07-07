import { useState, useEffect, useRef } from 'react';
import FeedbackService from '@/models/feedbackService';

const FEEDBACK_STRATEGIES = {
  OPTION1: 'option1', // 50% - INACTIVITY: show 30s after the answer has fully rendered
  OPTION2: 'option2', // 30% - POST_ANSWER: show shortly after the answer has fully rendered
  OPTION3: 'option3'  // 20% - never show feedback
};

// Delays are measured from the moment the bot's answer has FULLY rendered
// (i.e. streaming/typing finished), never from when the user sent the prompt.
const INACTIVITY_DELAY_MS = 30000; // Option 1
const POST_ANSWER_DELAY_MS = 5000; // Option 2

const getFeedbackStrategy = (sessionId) => {
  // Check if already shown to this session
  const sessionKey = `feedback_shown_${sessionId}`;
  if (localStorage.getItem(sessionKey)) {
    return null;
  }

  // Check if strategy already determined for this session
  const strategyKey = `feedback_strategy_${sessionId}`;
  const existingStrategy = localStorage.getItem(strategyKey);
  if (existingStrategy) {
    return existingStrategy;
  }

  // Generate new random strategy
  const random = Math.random();
  let strategy = null;

  if (random < 0.50) {
    strategy = FEEDBACK_STRATEGIES.OPTION1; // 50%
  } else if (random < 0.80) {
    strategy = FEEDBACK_STRATEGIES.OPTION2; // 30%
  } else {
    strategy = FEEDBACK_STRATEGIES.OPTION3; // 20%
  }

  // Store strategy for this session
  localStorage.setItem(strategyKey, strategy);
  return strategy;
};

/**
 * A message counts as a fully-rendered assistant answer only when it is no
 * longer a placeholder (`pending`) and no longer streaming/typing (`animate`).
 * This is true both for streamed replies (flags set by handleChat once the
 * stream closes) and for instant greeting replies (which carry neither flag).
 */
const isCompletedAssistantMessage = (msg) =>
  !!msg &&
  msg.role === 'assistant' &&
  !msg.pending &&
  !msg.animate &&
  (!!msg.error || (typeof msg.content === 'string' && msg.content.trim().length > 0));

const countMessages = (chatHistory) => {
  const userCount = chatHistory.filter(
    (msg) => msg.role === 'user' && !msg.pending
  ).length;
  const botCount = chatHistory.filter(isCompletedAssistantMessage).length;

  return { userCount, botCount };
};

const findLastAssistantIndex = (chatHistory) => {
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    if (chatHistory[i]?.role === 'assistant') return i;
  }
  return -1;
};

export default function useFeedbackTrigger(sessionId, chatHistory, isVisible = true) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [promptType, setPromptType] = useState("POST_ANSWER");
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const timerRef = useRef(null);
  // Tracks the answer we last saw complete, so its completion timestamp is
  // stamped exactly once (chat history re-renders on every streamed chunk).
  const completionRef = useRef({ index: -1, at: 0 });

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const markFeedbackAsShown = () => {
    const sessionKey = `feedback_shown_${sessionId}`;
    localStorage.setItem(sessionKey, 'true');
  };

  useEffect(() => {
    if (!sessionId || !isVisible || hasBeenSubmitted) return;

    // Get or generate strategy for this session
    const sessionStrategy = getFeedbackStrategy(sessionId);
    setStrategy(sessionStrategy);

    // If no strategy (already shown or option3), don't show feedback
    if (!sessionStrategy || sessionStrategy === FEEDBACK_STRATEGIES.OPTION3) {
      return;
    }

    // Any pending arm is recomputed from the current state below.
    clearTimer();

    // Only ever prompt once the latest assistant answer has fully rendered, so
    // the modal can never cover an answer that is still being written.
    const lastAssistantIndex = findLastAssistantIndex(chatHistory);
    const lastAssistant =
      lastAssistantIndex === -1 ? null : chatHistory[lastAssistantIndex];

    if (!isCompletedAssistantMessage(lastAssistant)) {
      // A new answer is being generated (or none yet) — wait for it to finish.
      completionRef.current = { index: -1, at: 0 };
      return;
    }

    // Stamp the completion time once per answer (keyed by its position).
    if (completionRef.current.index !== lastAssistantIndex) {
      completionRef.current = { index: lastAssistantIndex, at: Date.now() };
    }
    const completedAt = completionRef.current.at;

    // Decide, per strategy, whether the conversation qualifies and how long to
    // wait after the answer finished before showing the prompt.
    const messageCounts = countMessages(chatHistory);
    let delayMs = null;
    let type = null;

    if (
      sessionStrategy === FEEDBACK_STRATEGIES.OPTION1 &&
      messageCounts.userCount >= 1 &&
      messageCounts.botCount >= 1
    ) {
      delayMs = INACTIVITY_DELAY_MS;
      type = "INACTIVITY";
    } else if (
      sessionStrategy === FEEDBACK_STRATEGIES.OPTION2 &&
      messageCounts.userCount >= 2 &&
      messageCounts.botCount >= 1
    ) {
      delayMs = POST_ANSWER_DELAY_MS;
      type = "POST_ANSWER";
    }

    if (delayMs === null) return;

    const remaining = Math.max(0, delayMs - (Date.now() - completedAt));
    const trigger = () => {
      setPromptType(type);
      setShowFeedback(true);
      markFeedbackAsShown();
    };

    if (remaining === 0) {
      trigger();
    } else {
      timerRef.current = setTimeout(trigger, remaining);
    }
  }, [sessionId, chatHistory, isVisible, hasBeenSubmitted]);

  const handleFeedbackClose = () => {
    setShowFeedback(false);
    markFeedbackAsShown();
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    // This will be handled by the parent component
    setShowFeedback(false);
    setHasBeenSubmitted(true);
    markFeedbackAsShown();
  };

  // Reset state when sessionId changes
  useEffect(() => {
    setHasBeenSubmitted(false);
    setShowFeedback(false);
    completionRef.current = { index: -1, at: 0 };
    clearTimer();
  }, [sessionId]);

  // Handle session end (when component unmounts or session changes)
  useEffect(() => {
    return () => {
      // If feedback was shown but not submitted, log as session end
      if (showFeedback && !hasBeenSubmitted) {
        FeedbackService.logPromptShown(sessionId, "SESSION_END", false);
      }
    };
  }, [sessionId, showFeedback, hasBeenSubmitted]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      clearTimer();
    };
  }, []);

  return {
    showFeedback,
    strategy,
    promptType,
    handleFeedbackClose,
    handleFeedbackSubmit
  };
}
