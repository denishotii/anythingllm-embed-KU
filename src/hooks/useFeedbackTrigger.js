import { useState, useEffect, useRef } from 'react';
import FeedbackService from '@/models/feedbackService';

const FEEDBACK_STRATEGIES = {
  OPTION1: 'option1', // 50% - 2 messages + 30s delay
  OPTION2: 'option2', // 30% - 3 messages + immediate
  OPTION3: 'option3'  // 20% - no feedback
};

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

const countMessages = (chatHistory) => {
  const actualMessages = chatHistory.filter(msg => !msg.pending);
  const userMessages = actualMessages.filter(msg => msg.role === "user");
  const botMessages = actualMessages.filter(msg => msg.role === "assistant");
  
  return {
    userCount: userMessages.length,
    botCount: botMessages.length,
    totalCount: actualMessages.length
  };
};

const shouldTriggerOption1 = (messageCounts, lastBotMessageTime) => {
  // After 1 user + 1 bot message, wait 30 seconds after bot response
  if (messageCounts.userCount >= 1 && messageCounts.botCount >= 1) {
    const timeSinceLastBotMessage = Date.now() - lastBotMessageTime;
    return timeSinceLastBotMessage >= 30000; // 33 seconds
  }
  return false;
};

const shouldTriggerOption2 = (messageCounts) => {
  // After 2 user + 1 bot message, trigger immediately
  return messageCounts.userCount >= 2 && messageCounts.botCount >= 1;
};

export default function useFeedbackTrigger(sessionId, chatHistory, isVisible = true) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [strategy, setStrategy] = useState(null);
  const [promptType, setPromptType] = useState("POST_ANSWER");
  const [hasBeenSubmitted, setHasBeenSubmitted] = useState(false);
  const lastBotMessageTimeRef = useRef(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (!sessionId || !isVisible || hasBeenSubmitted) return;

    // Get or generate strategy for this session
    const sessionStrategy = getFeedbackStrategy(sessionId);
    setStrategy(sessionStrategy);

    // If no strategy (already shown or option3), don't show feedback
    if (!sessionStrategy || sessionStrategy === FEEDBACK_STRATEGIES.OPTION3) {
      return;
    }

    const messageCounts = countMessages(chatHistory);

    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Track last bot message time - only for completed messages (not pending)
    const actualMessages = chatHistory.filter(msg => !msg.pending && msg.role === "assistant");
    const lastBotMessage = actualMessages.pop();
    if (lastBotMessage && lastBotMessage.sentAt) {
      lastBotMessageTimeRef.current = lastBotMessage.sentAt * 1000;
    }

    // Check trigger conditions based on strategy
    if (sessionStrategy === FEEDBACK_STRATEGIES.OPTION1) {
      if (shouldTriggerOption1(messageCounts, lastBotMessageTimeRef.current)) {
        setPromptType("INACTIVITY");
        setShowFeedback(true);
        markFeedbackAsShown();
      } else if (messageCounts.userCount >= 1 && messageCounts.botCount >= 1 && lastBotMessageTimeRef.current > 0) {
        // Only start timer if we have a valid bot message timestamp
        // Set timer for 33 seconds after last bot message
        const timeSinceLastBotMessage = Date.now() - lastBotMessageTimeRef.current;
        const remainingTime = Math.max(0, 33000 - timeSinceLastBotMessage);
        
        if (remainingTime > 0) {
          timerRef.current = setTimeout(() => {
            setPromptType("INACTIVITY");
            setShowFeedback(true);
            markFeedbackAsShown();
          }, remainingTime);
        }
      }
    } else if (sessionStrategy === FEEDBACK_STRATEGIES.OPTION2) {
      if (shouldTriggerOption2(messageCounts)) {
        setPromptType("POST_ANSWER");
        setShowFeedback(true);
        markFeedbackAsShown();
      }
    }

  }, [sessionId, chatHistory, isVisible, hasBeenSubmitted]);

  const markFeedbackAsShown = () => {
    const sessionKey = `feedback_shown_${sessionId}`;
    localStorage.setItem(sessionKey, 'true');
  };

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
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
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
