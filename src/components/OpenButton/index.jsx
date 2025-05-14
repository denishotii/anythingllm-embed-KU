import { useState, useEffect, useCallback, useRef } from "react";
import superKuala from "../../assets/superKualaColor.svg";
import IntroAnimation from "./IntroAnimation";
import SpeechBubble from "./SpeechBubble";
import SuperKualaMascot from "./SuperKualaMascot";
import ContrastCheck from "./ContrastCheck";
import { detectLanguage, getLanguageLabels } from "../../utils/language";

export default function OpenButton({ settings, isOpen, toggleOpen }) {
  const [showIntro, setShowIntro] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [showTyping, setShowTyping] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [fadeBubble, setFadeBubble] = useState(false);
  const [isIdleJumping, setIsIdleJumping] = useState(false);
  const language = detectLanguage();
  const labels = getLanguageLabels(language);
  const [currentMessage, setCurrentMessage] = useState(labels.speechBubble.greeting);
  const idleJumpIntervalRef = useRef(null);
  const idleMessageIntervalRef = useRef(null);

  const getRandomMessage = useCallback(() => {
    const messages = labels.speechBubble.messages;
    return messages[Math.floor(Math.random() * messages.length)];
  }, [labels.speechBubble.messages]);

  const showRandomMessage = useCallback(() => {
    if (isOpen || showBubble) return;
    
    setCurrentMessage(getRandomMessage());
    setShowBubble(true);
    setShowTyping(true);
    setFadeBubble(false);
    
    // Stop typing after 1.5s
    setTimeout(() => {
      setShowTyping(false);
    }, 1500);

    // Fade away after 10s
    setTimeout(() => {
      setFadeBubble(true);
      setTimeout(() => setShowBubble(false), 500);
    }, 10000);
  }, [getRandomMessage, isOpen, showBubble]);

  const startIdleJump = useCallback(() => {
    if (isOpen || showBubble) return;
    
    setIsIdleJumping(true);
    setTimeout(() => setIsIdleJumping(false), 2000); // Stop jumping after 2s
  }, [isOpen, showBubble]);

  // Initial animation sequence
  useEffect(() => {
    const timer1 = setTimeout(() => setShowBubble(true), 0);
    const timer2 = setTimeout(() => setShowTyping(false), 1500);
    
    // Fade away after 20 seconds
    const timer3 = setTimeout(() => {
      setFadeBubble(true);
      setTimeout(() => setShowBubble(false), 500);
    }, 20000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  // Set up idle animations
  useEffect(() => {
    // Clear any existing intervals
    if (idleJumpIntervalRef.current) clearInterval(idleJumpIntervalRef.current);
    if (idleMessageIntervalRef.current) clearInterval(idleMessageIntervalRef.current);

    // Set up new intervals
    idleJumpIntervalRef.current = setInterval(() => {
      startIdleJump();
    }, 15000); // Every 15 seconds

    idleMessageIntervalRef.current = setInterval(() => {
      showRandomMessage();
    }, 30000); // Every 30 seconds

    return () => {
      if (idleJumpIntervalRef.current) clearInterval(idleJumpIntervalRef.current);
      if (idleMessageIntervalRef.current) clearInterval(idleMessageIntervalRef.current);
    };
  }, [startIdleJump, showRandomMessage]);

  if (isOpen) return null;

  return (
    <div className="allm-relative allm-flex allm-items-center allm-justify-center">
      {showIntro && <IntroAnimation onAnimationComplete={() => setShowIntro(false)} />}
      <SpeechBubble 
        text={currentMessage} 
        show={showBubble} 
        showTyping={showTyping}
        fade={fadeBubble}
      />
      <ContrastCheck>
        <div className="allm-relative allm-flex allm-flex-col allm-items-center">
          <button
            id="anything-llm-embed-chat-button"
            onClick={toggleOpen}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`hover:allm-cursor-pointer allm-bg-transparent allm-border-none allm-flex allm-items-center allm-justify-center allm-p-[0] allm-rounded-full hover:allm-opacity-95 ${
              showIntro ? 'allm-animate-pulse-subtle' : ''
            }`}
            aria-label="Toggle Menu"
          >
            <img 
              src={superKuala} 
              alt="KU Mascot" 
              className={`allm-w-[100px] allm-h-[100px] allm-object-contain ${
                showTyping ? ' allm-animate-wiggle' : ''
              } ${isHovered || isIdleJumping ? 'allm-animate-bounce-subtle' : ''}`}
            />
          </button>
          {/* Enhanced SVG shadow under mascot */}
          <svg
            width="70"
            height="26"
            viewBox="0 0 70 26"
            className={`allm-absolute allm-left-1/2 allm-bottom-[-12px] allm-translate-x-[-50%] ${
              isHovered || isIdleJumping ? 'allm-animate-shadow-bounce' : ''
            }`}
            style={{
              transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
              transform: showTyping ? 'translateX(-50%) scale(1.08, 0.92)' : 'translateX(-50%) scale(1, 1)',
              pointerEvents: 'none',
            }}
          >
            <ellipse
              cx="35"
              cy="13"
              rx="28"
              ry="9"
              fill="url(#shadowGradient)"
            />
            <defs>
              <radialGradient id="shadowGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                <stop offset="0%" stopColor="#232f66" stopOpacity="0.32" />
                <stop offset="60%" stopColor="#232f66" stopOpacity="0.16" />
                <stop offset="100%" stopColor="#232f66" stopOpacity="0" />
              </radialGradient>
            </defs>
          </svg>
        </div>
      </ContrastCheck>
    </div>
  );
}
