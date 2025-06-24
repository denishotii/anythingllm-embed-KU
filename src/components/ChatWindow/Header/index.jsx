import AnythingLLMIcon from "@/assets/anything-llm-icon.svg";
import ChatService from "@/models/chatService";
import { detectLanguage, getLanguageLabels } from "@/utils/language";
import {
  ArrowCounterClockwise,
  Check,
  Copy,
  DotsThreeOutlineVertical,
  Envelope,
  X,
  Info,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export default function ChatWindowHeader({
  sessionId,
  settings = {},
  iconUrl = null,
  closeChat,
  setChatHistory,
  labels,
}) {
  const { i18n } = useTranslation();
  const [showingOptions, setShowOptions] = useState(false);
  const menuRef = useRef();
  const buttonRef = useRef();
  const [lang, setLang] = useState(() => {
    const detected = detectLanguage();
    return detected === "de" ? "DE" : "EN";
  });

  const handleChatReset = async () => {
    await ChatService.resetEmbedChatSession(settings, sessionId);
    setChatHistory([]);
    setShowOptions(false);
  };

  const handleLangSwitch = () => {
    const newLang = lang === "EN" ? "DE" : "EN";
    setLang(newLang);
    i18n.changeLanguage(newLang.toLowerCase());
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        // Use requestAnimationFrame to ensure the current click finishes
        requestAnimationFrame(() => {
          setShowOptions(false);
        });
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);
  

  return (
    <div
      style={{ borderBottom: "1px solid #E9E9E9" }}
      className="allm-relative allm-flex allm-items-center allm-justify-center allm-rounded-t-2xl allm-h-[76px] allm-min-h-[76px] allm-flex-shrink-0"
      id="anything-llm-header"
    >
      {/* Language Switcher - absolute left */}
      <button
        onClick={handleLangSwitch}
        className="allm-absolute allm-left-4 allm-top-1/2 allm--translate-y-1/2 allm-flex allm-items-center allm-justify-center allm-w-9 allm-h-9 allm-bg-gradient-to-b allm-from-[#f8f9fc] allm-to-white allm-border-2 allm-border-[#1d3c78]/30 allm-rounded-full allm-shadow-[0_2px_8px_0_rgba(29,60,120,0.08)] allm-font-semibold allm-text-[#1d3c78] allm-text-base allm-transition-all allm-duration-150 hover:allm-border-[#1d3c78]/60 hover:allm-shadow-md hover:allm-bg-[#e6ecf7] hover:allm-scale-105 hover:allm-cursor-pointer focus:allm-outline-none focus:allm-ring-2 focus:allm-ring-[#1d3c78]/40"
        aria-label="Switch language"
        style={{ zIndex: 2 }}
      >
        {lang}
      </button>
      {/* Centered KU Logo */}
      <div className="allm-absolute allm-left-1/2 allm-top-1/2 allm--translate-x-1/2 allm--translate-y-1/2">
        <img
          style={{ maxWidth: 48, maxHeight: 48 }}
          src={iconUrl ?? AnythingLLMIcon}
          alt={iconUrl ? "Brand" : "AnythingLLM Logo"}
        />
      </div>
      <div className="allm-absolute allm-right-0 allm-flex allm-gap-x-1 allm-items-center allm-px-[22px]">
        {settings.loaded && (
          <button
            ref={buttonRef}
            type="button"
            onClick={(e) => {
              e.stopPropagation(); // Prevents click bubbling to document
              setShowOptions((prev) => !prev);
            }}
            className="allm-bg-transparent allm-border-none allm-rounded-full allm-p-2 allm-transition-colors allm-duration-150 hover:allm-bg-[#e6ecf7] focus:allm-bg-[#e6ecf7] hover:allm-cursor-pointer focus:allm-outline-none focus:allm-ring-2 focus:allm-ring-[#1d3c78]/30 allm-text-slate-800/60"
            aria-label="Options"
          >
            <DotsThreeOutlineVertical size={20} weight="fill" />
          </button>
        )}
        <button
          type="button"
          onClick={closeChat}
          className="allm-bg-transparent allm-border-none allm-rounded-full allm-p-2 allm-transition-colors allm-duration-150 hover:allm-bg-[#e6ecf7] focus:allm-bg-[#e6ecf7] hover:allm-cursor-pointer focus:allm-outline-none focus:allm-ring-2 focus:allm-ring-[#1d3c78]/30 allm-text-slate-800/60"
          aria-label="Close"
        >
          <X size={20} weight="bold" />
        </button>
      </div>
      <OptionsMenu
        settings={settings}
        showing={showingOptions}
        resetChat={handleChatReset}
        sessionId={sessionId}
        menuRef={menuRef}
        labels={labels}
        setChatHistory={setChatHistory}
        closeChat={closeChat}
      />
    </div>
  );
}

function MenuItem({ as = 'button', icon, children, className = '', ...props }) {
  const Comp = as;
  return (
    <Comp
      className={`allm-flex allm-items-center allm-gap-3 allm-w-full allm-bg-transparent allm-border-none allm-px-5 allm-py-3 allm-text-[15px] allm-font-medium allm-text-[#1d3c78] hover:allm-bg-[#e6ecf7] focus:allm-bg-[#e6ecf7] allm-transition-colors allm-duration-150 allm-outline-none allm-cursor-pointer ${className}`}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </Comp>
  );
}

function OptionsMenu({ settings, showing, resetChat, sessionId, menuRef, labels, setChatHistory, closeChat }) {
  if (!showing) return null;
  return (
    <div
      ref={menuRef}
      className="allm-bg-white allm-absolute allm-z-10 allm-flex allm-flex-col allm-gap-y-1 allm-rounded-2xl allm-shadow-2xl allm-top-[64px] allm-right-[46px] allm-py-2 allm-min-w-[220px] allm-border allm-border-[#e5e7eb] allm-overflow-hidden"
    >
      <MenuItem onClick={resetChat} icon={<ArrowCounterClockwise size={22} className="allm-text-[#1d3c78]" />}>
        {labels.resetChat}
      </MenuItem>
      <ContactSupport email={settings.supportEmail} labels={labels} MenuItem={MenuItem} />
      <SessionID sessionId={sessionId} labels={labels} MenuItem={MenuItem} />
      <div className="allm-my-1 allm-border-t allm-border-[#e5e7eb]" />
      <MenuItem
        as="a"
        href="https://www.ku.de/studibot-disclaimer"
        target="_blank"
        rel="noopener noreferrer"
        icon={<Info size={22} className="allm-text-[#1d3c78]" />}
        className="allm-no-underline"
      >
        {labels.disclaimer || "Disclaimer"}
      </MenuItem>
    </div>
  );
}

function SessionID({ sessionId, labels, MenuItem }) {
  if (!sessionId) return null;

  const [sessionIdCopied, setSessionIdCopied] = useState(false);

  const copySessionId = () => {
    navigator.clipboard.writeText(sessionId);
    setSessionIdCopied(true);
    setTimeout(() => setSessionIdCopied(false), 1000);
  };

  if (sessionIdCopied) {
    return (
      <MenuItem icon={<Check size={22} />}>
        {labels.copied}
      </MenuItem>
    );
  }

  return (
    <MenuItem onClick={copySessionId} icon={<Copy size={22} />}>
      {labels.sessionId}
    </MenuItem>
  );
}

function ContactSupport({ email = null, labels, MenuItem }) {
  if (!email) return null;

  const subject = `Inquiry from ${window.location.origin}`;
  return (
    <MenuItem
      as="a"
      href={`mailto:${email}?Subject=${encodeURIComponent(subject)}`}
      icon={<Envelope size={22} />}
      className="allm-no-underline"
    >
      {labels.emailSupport}
    </MenuItem>
  );
}
