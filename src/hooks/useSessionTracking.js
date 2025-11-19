import { useEffect, useRef, useState } from 'react';
import FeedbackService from '@/models/feedbackService';

export default function useSessionTracking(sessionId, chatHistory) {
  const lastMessageCountRef = useRef(0);
  const [sessionData, setSessionData] = useState(null);
  const sessionStartTimeRef = useRef(null);
  const responseTimesRef = useRef([]);
  const isSessionEndedRef = useRef(false);

  // Initialize session start time when sessionId changes
  useEffect(() => {
    if (sessionId && !sessionStartTimeRef.current) {
      sessionStartTimeRef.current = new Date().toISOString();
    }
  }, [sessionId]);

  // Calculate response times and update session data
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

    // Calculate response times for bot messages
    const currentResponseTimes = [];
    for (let i = 0; i < actualMessages.length - 1; i++) {
      const currentMsg = actualMessages[i];
      const nextMsg = actualMessages[i + 1];
      
      // If current message is from user and next is from bot, calculate response time
      if (currentMsg.role === "user" && nextMsg.role === "assistant" && 
          currentMsg.sentAt && nextMsg.sentAt) {
        const responseTime = (nextMsg.sentAt - currentMsg.sentAt) * 1000; // Convert to milliseconds
        if (responseTime > 0 && responseTime < 300000) { // Reasonable response time (0-5 minutes)
          currentResponseTimes.push(responseTime);
        }
      }
    }
    
    // Update response times array
    responseTimesRef.current = currentResponseTimes;
    
    // Calculate average response time
    const avgResponseTime = currentResponseTimes.length > 0 
      ? Math.round(currentResponseTimes.reduce((sum, time) => sum + time, 0) / currentResponseTimes.length)
      : null;

    // Session start is when the session was created, not when first message was sent
    const sessionStart = sessionStartTimeRef.current;
    
    // Session end is current time (will be updated as session continues)
    const sessionEnd = new Date().toISOString();

    // Update session analytics
    const currentSessionData = {
      session_id: sessionId,
      message_count: totalMessages,
      user_message_count: userCount,
      bot_message_count: botCount,
      session_start_at: sessionStart,
      session_end_at: sessionEnd,
      avg_response_time_ms: avgResponseTime
    };

    // Store the session data for the feedback modal to use
    setSessionData(currentSessionData);

    // Update session in database
    FeedbackService.updateSession(currentSessionData)
      .catch((err) => {
        console.error("❌ Failed to update session analytics:", err);
      });

  }, [sessionId, chatHistory]);

  // Function to end session properly
  const endSession = () => {
    if (sessionId && sessionStartTimeRef.current && !isSessionEndedRef.current) {
      isSessionEndedRef.current = true;
      
      const finalSessionData = {
        session_id: sessionId,
        session_start_at: sessionStartTimeRef.current,
        session_end_at: new Date().toISOString(),
        avg_response_time_ms: responseTimesRef.current.length > 0 
          ? Math.round(responseTimesRef.current.reduce((sum, time) => sum + time, 0) / responseTimesRef.current.length)
          : null
      };
      
      // Send final session data
      FeedbackService.updateSession(finalSessionData)
        .catch((err) => {
          console.error("❌ Failed to update final session analytics:", err);
        });
    }
  };

  // Periodic update of session end time during active sessions
  useEffect(() => {
    if (!sessionId || isSessionEndedRef.current) return;
    
    const interval = setInterval(() => {
      if (!isSessionEndedRef.current && sessionStartTimeRef.current) {
        const currentSessionData = {
          session_id: sessionId,
          session_start_at: sessionStartTimeRef.current,
          session_end_at: new Date().toISOString(),
          avg_response_time_ms: responseTimesRef.current.length > 0 
            ? Math.round(responseTimesRef.current.reduce((sum, time) => sum + time, 0) / responseTimesRef.current.length)
            : null
        };
        
        // Update session in database
        FeedbackService.updateSession(currentSessionData)
          .catch((err) => {
            console.error("❌ Failed to update session analytics:", err);
          });
      }
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [sessionId]);

  // Cleanup: Set final session end time when component unmounts or session changes
  useEffect(() => {
    // Add beforeunload listener to ensure session is ended when page is closed
    const handleBeforeUnload = () => {
      endSession();
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      endSession();
    };
  }, [sessionId]);

  // Expose endSession function for external use
  return { sessionData, endSession };
}
