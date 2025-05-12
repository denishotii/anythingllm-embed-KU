import { useState } from "react";
import {
  ChatCircleDots,
} from "@phosphor-icons/react";
import IntroAnimation from "./IntroAnimation";

export default function OpenButton({ settings, isOpen, toggleOpen }) {
  const [showIntro, setShowIntro] = useState(true);

  if (isOpen) return null;

  return (
    <>
      {showIntro && <IntroAnimation onAnimationComplete={() => setShowIntro(false)} />}
      <button
        style={{ backgroundColor: settings.buttonColor }}
        id="anything-llm-embed-chat-button"
        onClick={toggleOpen}
        className={`hover:allm-cursor-pointer allm-border-none allm-flex allm-items-center allm-justify-center allm-p-[18px] allm-rounded-full allm-text-white allm-text-2xl hover:allm-opacity-95 ${
          showIntro ? 'allm-animate-pulse-subtle' : ''
        }`}
        aria-label="Toggle Menu"
      >
        <ChatCircleDots className="text-white" />
      </button>
    </>
  );
}
