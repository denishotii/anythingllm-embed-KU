import { useEffect, useRef } from "react";
import { embedderSettings } from "../main";
import { shouldResetSession } from "@/utils/sessionManager";
import ChatService from "@/models/chatService";

export default function useAutoReset(settings, sessionId, setChatHistory) {
  const hasResetRef = useRef(false);

  useEffect(() => {
    if (!settings?.embedId || !sessionId || hasResetRef.current) return;

    // Check if session should be reset due to inactivity
    if (shouldResetSession(settings.embedId)) {
      console.log("Auto-resetting chat due to inactivity");
      hasResetRef.current = true;
      
      // Call the reset function
      const performReset = async () => {
        try {
          await ChatService.resetEmbedChatSession(settings, sessionId);
          setChatHistory([]);
          console.log("Auto-reset completed");
        } catch (error) {
          console.error("Auto-reset failed:", error);
        }
      };
      
      performReset();
    }
  }, [settings, sessionId, setChatHistory]);

  return hasResetRef.current;
} 