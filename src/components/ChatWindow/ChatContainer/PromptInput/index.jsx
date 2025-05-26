import { CircleNotch, PaperPlaneRight } from "@phosphor-icons/react";
import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import KUalaWithBook from "../../../../assets/KUalaWithBook.svg";

export default function PromptInput({
  settings,
  message,
  submit,
  onChange,
  inputDisabled,
  buttonDisabled,
  labels,
}) {
  const { t } = useTranslation();
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (!inputDisabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [inputDisabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(e);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit(event);
    }
  };

  return (
    <div className="allm-w-[97%] allm-ml-[1.5%] allm-mb-[3px] allm-sticky allm-bottom-0 allm-z-10 allm-flex allm-justify-center allm-items-center allm-bg-gradient-to-b allm-from-white/80 allm-to-white allm-backdrop-blur-sm allm-py-3">
      <form
        onSubmit={handleSubmit}
        className="allm-flex allm-w-full allm-items-center allm-justify-center allm-max-w-md allm-mx-auto"
        autoComplete="off"
      >
        <div className={`allm-relative allm-flex allm-items-center allm-bg-[#f8f9fc] allm-border allm-border-[#d1d5db] allm-rounded-full allm-shadow-sm allm-px-2 allm-py-1 allm-w-[95%] allm-mx-auto allm-transition-all allm-duration-200 ${isFocused ? 'allm-ring-2 allm-ring-[#1d3c78]/30 allm-shadow-md' : ''}`}>
          {/* Mascot icon */}
          <img
            src={KUalaWithBook}
            alt="KUala mascot"
            className="allm-w-7 allm-h-7 allm-ml-2 allm-mr-2 allm-select-none allm-pointer-events-none"
            aria-hidden="true"
          />
          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            onChange={onChange}
            onKeyDown={handleKeyDown}
            required={true}
            disabled={inputDisabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            value={message}
            className="allm-flex-1 allm-bg-transparent allm-border-none allm-outline-none allm-text-[15px] allm-text-[#1d3c78] placeholder:allm-text-[#1d3c78]/40 allm-px-2 allm-py-2 focus:allm-outline-none disabled:allm-opacity-50 disabled:allm-cursor-not-allowed"
            placeholder={labels?.inputPlaceholder || "Ask me anything about KU…"}
            id="message-input"
            aria-label="Chat message input"
            autoComplete="off"
          />
          {/* Send button */}
          <button
            ref={formRef}
            type="submit"
            disabled={buttonDisabled}
            className="allm-ml-2 allm-mr-1 allm-flex allm-items-center allm-justify-center allm-w-10 allm-h-10 allm-rounded-full allm-bg-[#1d3c78] allm-text-white allm-shadow-md allm-transition-all allm-duration-200 hover:allm-bg-[#163060] hover:allm-scale-110 hover:allm-cursor-pointer active:allm-scale-95 disabled:allm-opacity-50 disabled:allm-cursor-not-allowed focus:allm-outline-none focus:allm-ring-2 focus:allm-ring-[#1d3c78]/40"
            id="send-message-button"
            aria-label="Send message"
          >
            {buttonDisabled ? (
              <CircleNotch className="allm-w-5 allm-h-5 allm-animate-spin" />
            ) : (
              <PaperPlaneRight
                size={20}
                weight="fill"
                className="allm-transform allm-rotate-90 allm-transition-transform allm-duration-200"
              />
            )}
            <span className="allm-sr-only">Send message</span>
          </button>
        </div>
      </form>
    </div>
  );
}
