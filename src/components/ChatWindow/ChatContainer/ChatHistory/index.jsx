import HistoricalMessage from "./HistoricalMessage";
import PromptReply from "./PromptReply";
import WelcomePanel from "./WelcomePanel";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, CircleNotch } from "@phosphor-icons/react";
import { embedderSettings } from "@/main";
import debounce from "lodash.debounce";
import { SEND_TEXT_EVENT } from "..";

export default function ChatHistory({ settings = {}, history = [], labels }) {
  const replyRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const chatHistoryRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [history]);

  const handleScroll = () => {
    if (!chatHistoryRef.current) return;
    const diff =
      chatHistoryRef.current.scrollHeight -
      chatHistoryRef.current.scrollTop -
      chatHistoryRef.current.clientHeight;
    // Fuzzy margin for what qualifies as "bottom". Stronger than straight comparison since that may change over time.
    const isBottom = diff <= 40;
    setIsAtBottom(isBottom);
  };

  const debouncedScroll = debounce(handleScroll, 100);
  useEffect(() => {
    function watchScrollEvent() {
      if (!chatHistoryRef.current) return null;
      const chatHistoryElement = chatHistoryRef.current;
      if (!chatHistoryElement) return null;
      chatHistoryElement.addEventListener("scroll", debouncedScroll);
    }
    watchScrollEvent();
  }, []);

  const scrollToBottom = () => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTo({
        top: chatHistoryRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  if (history.length === 0) {
    return (
      <div className="allm-h-full allm-overflow-y-hidden allm-px-2 allm-py-4 allm-flex allm-flex-col allm-justify-start allm-no-scroll">
        <div className="allm-flex allm-h-full allm-flex-col allm-items-center allm-justify-center">
          <WelcomePanel labels={labels} />
          <SuggestedMessages settings={settings} />
        </div>
      </div>
    );
  }

  return (
    <div
      className="allm-h-full allm-overflow-y-auto allm-px-2 allm-pt-4 allm-pb-8 allm-flex allm-flex-col allm-justify-start allm-no-scroll"
      id="chat-history"
      ref={chatHistoryRef}
    >
      <div className="allm-flex allm-flex-col allm-gap-y-4">
        {history.map((props, index) => {
          const isLastMessage = index === history.length - 1;
          const isLastBotReply =
            index === history.length - 1 && props.role === "assistant";

          if (isLastBotReply && props.animate) {
            return (
              <PromptReply
                key={props.uuid}
                ref={isLastMessage ? replyRef : null}
                uuid={props.uuid}
                reply={props.content}
                pending={props.pending}
                sources={props.sources}
                error={props.error}
                closed={props.closed}
              />
            );
          }

          return (
            <HistoricalMessage
              key={index}
              ref={isLastMessage ? replyRef : null}
              message={props.content}
              sentAt={props.sentAt || Date.now() / 1000}
              role={props.role}
              sources={props.sources}
              chatId={props.chatId}
              feedbackScore={props.feedbackScore}
              error={props.error}
              errorMsg={props.errorMsg}
            />
          );
        })}
      </div>
      {!isAtBottom && (
        <div className="allm-fixed allm-bottom-[10rem] allm-right-[50px] allm-z-50 allm-cursor-pointer allm-animate-pulse">
          <div className="allm-flex allm-flex-col allm-items-center">
            <div className="allm-rounded-full allm-border allm-border-white/10 allm-bg-black/20 hover:allm-bg-black/50 allm-w-8 allm-h-8 allm-flex allm-items-center allm-justify-center">
              <ArrowDown
                weight="bold"
                className="allm-text-white/50 allm-w-4 allm-h-4"
                onClick={scrollToBottom}
                id="scroll-to-bottom-button"
                aria-label="Scroll to bottom"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ChatHistoryLoading() {
  return (
    <div className="allm-h-full allm-w-full allm-relative">
      <div className="allm-h-full allm-max-h-[82vh] allm-pb-[100px] allm-pt-[5px] allm-bg-gray-100 allm-rounded-lg allm-px-2 allm-h-full allm-mt-2 allm-gap-y-2 allm-overflow-y-scroll allm-flex allm-flex-col allm-justify-start allm-no-scroll">
        <div className="allm-flex allm-h-full allm-flex-col allm-items-center allm-justify-center">
          <CircleNotch
            size={14}
            className="allm-text-slate-400 allm-animate-spin"
          />
        </div>
      </div>
    </div>
  );
}

function SuggestedMessages({ settings }) {
  if (!settings?.defaultMessages?.length) return null;

  return (
    <div className="allm-flex allm-flex-col allm-gap-y-2 allm-w-[75%]">
      {settings.defaultMessages.map((content, i) => (
        <button
          key={i}
          style={{
            opacity: 0,
            wordBreak: "break-word",
            backgroundColor: embedderSettings.USER_STYLES.msgBg,
            fontSize: settings.textSize,
          }}
          type="button"
          onClick={() => {
            window.dispatchEvent(
              new CustomEvent(SEND_TEXT_EVENT, { detail: { command: content } })
            );
          }}
          className={`msg-suggestion allm-border-none hover:allm-shadow-[0_4px_14px_rgba(0,0,0,0.5)] allm-cursor-pointer allm-px-2 allm-py-2 allm-rounded-lg allm-text-white allm-w-full allm-shadow-[0_4px_14px_rgba(0,0,0,0.25)]`}
        >
          {content}
        </button>
      ))}
    </div>
  );
}
