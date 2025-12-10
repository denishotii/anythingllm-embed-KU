import { useEffect, useState } from "react";
import { embedderSettings } from "../main";
import { v4 } from "uuid";
import { shouldResetSession, updateSessionActivity } from "@/utils/sessionManager";

export default function useSessionId() {
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    function getOrAssignSessionId() {
      if (!window || !embedderSettings?.settings?.embedId) return;

      const embedId = embedderSettings.settings.embedId;
      const STORAGE_IDENTIFIER = `allm_${embedId}_session_id`;
      
      // Check if we should reset the session due to inactivity
      if (shouldResetSession(embedId)) {
        // Clear the session ID to force a fresh start
        window.localStorage.removeItem(STORAGE_IDENTIFIER);
        updateSessionActivity(embedId);
      }
      
      const currentId = window.localStorage.getItem(STORAGE_IDENTIFIER);
      if (!!currentId) {
        updateSessionActivity(embedId); // Update activity timestamp
        setSessionId(currentId);
        return;
      }

      const newId = v4();
      window.localStorage.setItem(STORAGE_IDENTIFIER, newId);
      updateSessionActivity(embedId);
      setSessionId(newId);
    }
    getOrAssignSessionId();
  }, [window]);

  return sessionId;
}
