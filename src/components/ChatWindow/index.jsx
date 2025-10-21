import ChatWindowHeader from "./Header";
import SessionId from "../SessionId";
import useChatHistory from "@/hooks/chat/useChatHistory";
import useAutoReset from "@/hooks/useAutoReset";
import ChatContainer from "./ChatContainer";
import Sponsor from "../Sponsor";
import { ChatHistoryLoading } from "./ChatContainer/ChatHistory";
import ResetChat from "../ResetChat";
import FeedbackModal from "../FeedbackModal";
import FeedbackService from "@/models/feedbackService";
import { useTranslation } from "react-i18next";
import { getLanguageLabels } from "@/utils/language";
import { useState, useEffect } from "react";

export default function ChatWindow({ closeChat, settings, sessionId }) {
  const { i18n } = useTranslation();
  const [labels, setLabels] = useState(() => getLanguageLabels(i18n.language));
  const [showFeedback, setShowFeedback] = useState(true); // Set to true for testing/design
  
  useEffect(() => {
    setLabels(getLanguageLabels(i18n.language));
  }, [i18n.language]);
  
  const { chatHistory, setChatHistory, loading } = useChatHistory(
    settings,
    sessionId
  );

  // Auto-reset chat if session expired due to inactivity
  useAutoReset(settings, sessionId, setChatHistory);

  // Handle feedback submission
  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await FeedbackService.submitFeedback(feedbackData);
      console.log("✅ Feedback submitted successfully");
    } catch (error) {
      console.error("❌ Failed to submit feedback:", error);
      throw error;
    }
  };

  // Handle feedback modal close
  const handleFeedbackClose = () => {
    setShowFeedback(false);
  };

  if (loading) {
    return (
      <div className="allm-flex allm-flex-col allm-h-full">
        <ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
          labels={labels}
        />
        <ChatHistoryLoading />
        <div className="allm-pt-4 allm-pb-2 allm-h-fit allm-gap-y-1">
          <SessionId />
          <Sponsor settings={settings} />
        </div>
      </div>
    );
  }

  setEventDelegatorForCodeSnippets();

  return (
    <div className="allm-flex allm-flex-col allm-h-full allm-relative">
      {!settings.noHeader && (
        <ChatWindowHeader
          sessionId={sessionId}
          settings={settings}
          iconUrl={settings.brandImageUrl}
          closeChat={closeChat}
          setChatHistory={setChatHistory}
          labels={labels}
        />
      )}
      <div className="allm-flex-grow allm-overflow-y-auto">
        <ChatContainer
          sessionId={sessionId}
          settings={settings}
          knownHistory={chatHistory}
          labels={labels}
        />
      </div>
      
      {/* Feedback Modal */}
      <FeedbackModal
        isVisible={showFeedback}
        onClose={handleFeedbackClose}
        onSubmit={handleFeedbackSubmit}
        sessionId={sessionId}
        chatHistory={chatHistory}
      />
      
      {/* <div className="allm-mt-4 allm-pb-4 allm-h-fit allm-gap-y-2 allm-z-10">
        <Sponsor settings={settings} />
        <ResetChat
          setChatHistory={setChatHistory}
          settings={settings}
          sessionId={sessionId}
          closeChat={closeChat}
        />
      </div> */}
    </div>
  );
}

// Enables us to safely markdown and sanitize all responses without risk of injection
// but still be able to attach a handler to copy code snippets on all elements
// that are code snippets.
function copyCodeSnippet(uuid) {
  const target = document.querySelector(`[data-code="${uuid}"]`);
  if (!target) return false;

  const markdown =
    target.parentElement?.parentElement?.querySelector(
      "pre:first-of-type"
    )?.innerText;
  if (!markdown) return false;

  window.navigator.clipboard.writeText(markdown);

  target.classList.add("allm-text-green-500");
  const originalText = target.innerHTML;
  target.innerText = "Copied!";
  target.setAttribute("disabled", true);

  setTimeout(() => {
    target.classList.remove("allm-text-green-500");
    target.innerHTML = originalText;
    target.removeAttribute("disabled");
  }, 2500);
}

// Listens and hunts for all data-code-snippet clicks.
function setEventDelegatorForCodeSnippets() {
  document?.addEventListener("click", function (e) {
    const target = e.target.closest("[data-code-snippet]");
    const uuidCode = target?.dataset?.code;
    if (!uuidCode) return false;
    copyCodeSnippet(uuidCode);
  });
}
