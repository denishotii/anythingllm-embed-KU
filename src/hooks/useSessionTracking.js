import { useEffect, useRef, useState } from 'react';
import FeedbackService from '@/models/feedbackService';

export default function useSessionTracking(sessionId, chatHistory) {
  const lastMessageCountRef = useRef(0);
  const [sessionData, setSessionData] = useState(null);

  useEffect(() => {

    if (!sessionId) {
      console.warn("⚠️ No sessionId provided to useSessionTracking");
      return;
    }

    // Count actual messages (exclude pending/loading messages)
    const actualMessages = chatHistory.filter(msg => !msg.pending);
    const userMessages = actualMessages.filter(msg => msg.role === "user");
    const botMessages = actualMessages.filter(msg => msg.role === "assistant");
    
    const userCount = userMessages.length;
    const botCount = botMessages.length;
    const totalMessages = userCount + botCount;


    // Only track if there are actual messages and count has changed
    if (totalMessages === 0 || totalMessages === lastMessageCountRef.current) {
      return;
    }

    lastMessageCountRef.current = totalMessages;

    // Get session start from the first message's timestamp
    const firstMessage = actualMessages[0];
    const lastMessage = actualMessages[actualMessages.length - 1];
    
    let sessionStart = null;
    let sessionEnd = null;
    
    if (firstMessage && firstMessage.sentAt) {
      // Convert unix timestamp to ISO string
      sessionStart = new Date(firstMessage.sentAt * 1000).toISOString();
    }
    
    if (lastMessage && lastMessage.sentAt) {
      sessionEnd = new Date(lastMessage.sentAt * 1000).toISOString();
    }


    // Update session analytics
    const currentSessionData = {
      session_id: sessionId,
      message_count: totalMessages,
      user_message_count: userCount,
      bot_message_count: botCount,
      session_start_at: sessionStart,
      session_end_at: sessionEnd,
      avg_response_time_ms: null
    };

    // Store the session data for the feedback modal to use
    setSessionData(currentSessionData);


    FeedbackService.updateSession(currentSessionData)
      .catch((err) => {
        console.error("❌ Failed to update session analytics:", err);
      });

  }, [sessionId, chatHistory]);

  return sessionData;
}
