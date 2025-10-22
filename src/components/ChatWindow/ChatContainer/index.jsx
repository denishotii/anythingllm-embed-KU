import React, { useState, useEffect, useRef } from "react";
import ChatHistory from "./ChatHistory";
import PromptInput from "./PromptInput";
import handleChat from "@/utils/chat";
import ChatService from "@/models/chatService";
import { updateSessionActivity } from "@/utils/sessionManager";
import { getResponseForMessage } from "@/utils/greetingHandler";
import { detectLanguage } from "@/utils/language";
import { embedderSettings } from "@/main";
import useFeedbackTrigger from "@/hooks/useFeedbackTrigger";
import useSessionTracking from "@/hooks/useSessionTracking";
export const SEND_TEXT_EVENT = "anythingllm-embed-send-prompt";

export default function ChatContainer({
  sessionId,
  settings,
  knownHistory = [],
  labels,
  onFeedbackStateChange,
}) {
  const [message, setMessage] = useState("");
  const [loadingResponse, setLoadingResponse] = useState(false);
  const [chatHistory, setChatHistory] = useState(knownHistory);
  const isProcessingGreetingRef = useRef(false);

  // Initialize feedback trigger
  const {
    showFeedback,
    strategy,
    handleFeedbackClose,
    handleFeedbackSubmit
  } = useFeedbackTrigger(sessionId, chatHistory);

  // Track session analytics automatically
  const sessionData = useSessionTracking(sessionId, chatHistory);

  // Pass feedback state to parent
  useEffect(() => {
    if (onFeedbackStateChange) {
      onFeedbackStateChange({
        showFeedback,
        strategy,
        handleFeedbackClose,
        handleFeedbackSubmit,
        sessionData
      });
    }
  }, [showFeedback, strategy, sessionData, onFeedbackStateChange]);

  // Resync history if the ref to known history changes
  // eg: cleared.
  useEffect(() => {
    if (knownHistory.length !== chatHistory.length)
      setChatHistory([...knownHistory]);
  }, [knownHistory]);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!message || message === "") return false;

    // Update session activity when user sends a message
    if (embedderSettings?.settings?.embedId) {
      updateSessionActivity(embedderSettings.settings.embedId);
    }

    // Check if this is a greeting that should get an instant response
    const language = detectLanguage();
    const greetingResponse = getResponseForMessage(message, language, labels);

    if (greetingResponse) {
      // Handle greeting with typing animation
      isProcessingGreetingRef.current = true;
      const userMessage = {
        content: message,
        role: "user",
        sentAt: Math.floor(Date.now() / 1000)
      };
      
      // Add user message immediately
      const newHistory = [...chatHistory, userMessage];
      setChatHistory(newHistory);
      setMessage("");
      
      // Add typing indicator
      const typingMessage = {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
        sentAt: Math.floor(Date.now() / 1000),
      };
      
      setChatHistory([...newHistory, typingMessage]);
      setLoadingResponse(true);
      
      // Simulate typing for at least 3 seconds
      const minTypingTime = 3000; // 3 seconds
      const startTime = Date.now();
      
      setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minTypingTime - elapsedTime);
        
        setTimeout(() => {
          // Replace typing indicator with actual response
          const botResponse = {
            content: greetingResponse,
            role: "assistant",
            sentAt: Math.floor(Date.now() / 1000)
          };
          
          setChatHistory([...newHistory, botResponse]);
          setLoadingResponse(false);
          isProcessingGreetingRef.current = false;
        }, remainingTime);
      }, 100);
      
      return false; // Don't send to AnythingLLM
    }

    // Regular message - send to AnythingLLM
    const prevChatHistory = [
      ...chatHistory,
      { content: message, role: "user", sentAt: Math.floor(Date.now() / 1000) },
      {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: message,
        animate: true,
        sentAt: Math.floor(Date.now() / 1000),
      },
    ];
    setChatHistory(prevChatHistory);
    setMessage("");
    setLoadingResponse(true);
  };

  const sendCommand = (command, history = [], attachments = []) => {
    if (!command || command === "") return false;

    // Update session activity when a command is sent
    if (embedderSettings?.settings?.embedId) {
      updateSessionActivity(embedderSettings.settings.embedId);
    }

    // Check if this is a greeting that should get an instant response
    const language = detectLanguage();
    const greetingResponse = getResponseForMessage(command, language, labels);

    if (greetingResponse) {
      // Handle greeting with typing animation
      isProcessingGreetingRef.current = true;
      const userMessage = {
        content: command,
        role: "user",
        attachments,
        sentAt: Math.floor(Date.now() / 1000)
      };
      
      // Add user message immediately
      const newHistory = [...chatHistory, userMessage];
      setChatHistory(newHistory);
      
      // Add typing indicator
      const typingMessage = {
        content: "",
        role: "assistant",
        pending: true,
        userMessage: command,
        animate: true,
        sentAt: Math.floor(Date.now() / 1000),
      };
      
      setChatHistory([...newHistory, typingMessage]);
      setLoadingResponse(true);
      
      // Simulate typing for at least 3 seconds
      const minTypingTime = 3000; // 3 seconds
      const startTime = Date.now();
      
      setTimeout(() => {
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, minTypingTime - elapsedTime);
        
        setTimeout(() => {
          // Replace typing indicator with actual response
          const botResponse = {
            content: greetingResponse,
            role: "assistant",
            sentAt: Math.floor(Date.now() / 1000)
          };
          
          setChatHistory([...newHistory, botResponse]);
          setLoadingResponse(false);
          isProcessingGreetingRef.current = false;
        }, remainingTime);
      }, 100);
      
      return false; // Don't send to AnythingLLM
    }

    let prevChatHistory;
    if (history.length > 0) {
      // use pre-determined history chain.
      prevChatHistory = [
        ...history,
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          attachments,
          animate: true,
        },
      ];
    } else {
      prevChatHistory = [
        ...chatHistory,
        {
          content: command,
          role: "user",
          attachments,
        },
        {
          content: "",
          role: "assistant",
          pending: true,
          userMessage: command,
          animate: true,
        },
      ];
    }

    setChatHistory(prevChatHistory);
    setLoadingResponse(true);
  };

  useEffect(() => {
    async function fetchReply() {
      // Don't send to LLM if we're processing a greeting
      if (isProcessingGreetingRef.current) {
        setLoadingResponse(false);
        return false;
      }

      const promptMessage =
        chatHistory.length > 0 ? chatHistory[chatHistory.length - 1] : null;
      const remHistory = chatHistory.length > 0 ? chatHistory.slice(0, -1) : [];
      var _chatHistory = [...remHistory];

      if (!promptMessage || !promptMessage?.userMessage) {
        setLoadingResponse(false);
        return false;
      }

      // Check if this is a greeting that should not be sent to AnythingLLM
      const language = detectLanguage();
      const greetingResponse = getResponseForMessage(promptMessage.userMessage, language, labels);
      
      if (greetingResponse) {
        // This is a greeting message that was already handled, don't send to LLM
        setLoadingResponse(false);
        return false;
      }

      await ChatService.streamChat(
        sessionId,
        settings,
        promptMessage.userMessage,
        (chatResult) =>
          handleChat(
            chatResult,
            setLoadingResponse,
            setChatHistory,
            remHistory,
            _chatHistory
          )
      );
      return;
    }

    loadingResponse === true && fetchReply();
  }, [loadingResponse, chatHistory]);

  const handleAutofillEvent = (event) => {
    if (!event.detail.command) return;
    sendCommand(event.detail.command, [], []);
  };

  useEffect(() => {
    window.addEventListener(SEND_TEXT_EVENT, handleAutofillEvent);
    return () => {
      window.removeEventListener(SEND_TEXT_EVENT, handleAutofillEvent);
    };
  }, []);

  return (
    <div className="allm-h-full allm-w-full allm-flex allm-flex-col">
      <div className="allm-flex-1 allm-min-h-0 allm-mb-8">
        <ChatHistory settings={settings} history={chatHistory} labels={labels} />
      </div>
      <div className="allm-flex-shrink-0 allm-mt-auto">
        <PromptInput
          settings={settings}
          message={message}
          submit={handleSubmit}
          onChange={handleMessageChange}
          inputDisabled={loadingResponse}
          buttonDisabled={loadingResponse}
          labels={labels}
        />
      </div>
    </div>
  );
}
