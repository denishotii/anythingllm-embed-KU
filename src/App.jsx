import useGetScriptAttributes from "@/hooks/useScriptAttributes";
import useSessionId from "@/hooks/useSessionId";
import useOpenChat from "@/hooks/useOpen";
import Head from "@/components/Head";
import OpenButton from "@/components/OpenButton";
import ChatWindow from "./components/ChatWindow";
import { useEffect } from "react";
import { I18nextProvider } from "react-i18next";
import i18next from "@/i18n";

export default function App() {
  const { isChatOpen, toggleOpenChat } = useOpenChat();
  const embedSettings = useGetScriptAttributes();
  const sessionId = useSessionId();

  useEffect(() => {
    if (embedSettings.openOnLoad === "on") {
      toggleOpenChat(true);
    }
  }, [embedSettings.loaded]);

  if (!embedSettings.loaded) return null;

  return (
    <I18nextProvider i18n={i18next}>
      <Head />
      <div
        id="anything-llm-embed-chat-container"
        className={`allm-fixed allm-inset-0 allm-z-50 ${isChatOpen ? "allm-block" : "allm-hidden"}`}
      >
        <div
          className={`
            allm-fixed allm-bottom-0 allm-right-0 allm-z-50
            allm-bg-white allm-rounded-2xl allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)] allm-border allm-border-gray-300 allm-flex allm-flex-col
            allm-w-[95%] allm-h-[90%] allm-mr-1 allm-mb-[15px]
            md:allm-w-[400px] md:allm-h-[600px] md:allm-mr-4 md:allm-mb-[60px]
          `}
          id="anything-llm-chat"
        >
          {isChatOpen && (
            <ChatWindow
              closeChat={() => toggleOpenChat(false)}
              settings={embedSettings}
              sessionId={sessionId}
            />
          )}
        </div>
      </div>
      {!isChatOpen && (
        <div
          className={`
            allm-fixed allm-bottom-0 allm-right-0 allm-z-50
            allm-mr-1 allm-mb-[60px]
            md:allm-mr-4 md:allm-mb-[60px]
          `}
        >
          <OpenButton
            settings={embedSettings}
            isOpen={isChatOpen}
            toggleOpen={() => toggleOpenChat(true)}
          />
        </div>
      )}
    </I18nextProvider>
  );
}
