import React from "react";

function TypingDots() {
  return (
    <span className="allm-inline-flex allm-items-center">
      <span className="allm-animate-bounce allm-inline-block allm-w-1.5 allm-h-1.5 allm-bg-[#232f66] allm-rounded-full allm-mx-[1.5px]" style={{ animationDelay: '0s' }}></span>
      <span className="allm-animate-bounce allm-inline-block allm-w-1.5 allm-h-1.5 allm-bg-[#232f66] allm-rounded-full allm-mx-[1.5px]" style={{ animationDelay: '0.2s' }}></span>
      <span className="allm-animate-bounce allm-inline-block allm-w-1.5 allm-h-1.5 allm-bg-[#232f66] allm-rounded-full allm-mx-[1.5px]" style={{ animationDelay: '0.4s' }}></span>
    </span>
  );
}

export default function SpeechBubble({ text, show, showTyping, fade }) {
  return (
    <div
      className={`allm-absolute allm-top-0 allm-right-[90%] allm-flex allm-flex-col allm-items-end allm-z-50 transition-all duration-500 ${
        show ? (fade ? 'allm-opacity-0 allm-translate-y-[-10px]' : 'allm-opacity-100 allm-translate-y-0') : 'allm-opacity-0'
      }`}
      style={{ pointerEvents: 'none' }}
    >
      <div className="allm-bg-[#eaf4fb] allm-text-[#232f66] allm-px-3 allm-py-1 allm-rounded-lg allm-shadow-sm allm-text-xs allm-font-bold allm-flex allm-items-center allm-justify-center allm-text-center allm-min-w-[120px] allm-max-w-[200px] allm-min-h-[20px]">
        <span style={{ display: showTyping ? 'inline-flex' : 'none', width: '100%', justifyContent: 'center' }}><TypingDots /></span>
        <span style={{ display: showTyping ? 'none' : 'inline', width: '100%' }}>{text}</span>
      </div>
      {/* Tail */}
      <svg width="14" height="10" viewBox="0 0 14 10" className="allm-block" style={{ marginRight: '-2px', marginTop: '-2px' }}>
        <polygon points="14,0 0,5 14,10" fill="#eaf4fb" />
      </svg>
    </div>
  );
} 