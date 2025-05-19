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
  const [showTyping, setShowTyping] = useState(false);
  const [showPostTypingWiggle, setShowPostTypingWiggle] = useState(false);
  const [showHalo, setShowHalo] = useState(false);
  const [showHoverHalo, setShowHoverHalo] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [fadeBubble, setFadeBubble] = useState(false);
  const [isIdleJumping, setIsIdleJumping] = useState(false);
  const [showEntranceAnimation, setShowEntranceAnimation] = useState(true);
  const language = detectLanguage();
  const labels = getLanguageLabels(language);
  const [currentMessage, setCurrentMessage] = useState(labels.speechBubble.greeting);
  const idleJumpIntervalRef = useRef(null);
  const idleMessageIntervalRef = useRef(null);

  // Entrance animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowEntranceAnimation(false);
      // Start typing animation after fly-in completes
      setShowTyping(true);
      setShowBubble(true);
    }, 1500); // Animation duration

    return () => clearTimeout(timer);
  }, []);

  // Stop typing and start post-typing wiggle after 1.5s
  useEffect(() => {
    if (showTyping) {
      const timer = setTimeout(() => {
        setShowTyping(false);
        setShowPostTypingWiggle(true);
        setShowHalo(true);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [showTyping]);

  // Stop post-typing wiggle and halo after 3s
  useEffect(() => {
    if (showPostTypingWiggle) {
      const timer = setTimeout(() => {
        setShowPostTypingWiggle(false);
        // Remove halo before animation completes
        setTimeout(() => setShowHalo(false), 1500);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [showPostTypingWiggle]);

  // Fade away after 10s
  useEffect(() => {
    if (showBubble && !showTyping) {
      const timer = setTimeout(() => {
        setFadeBubble(true);
        setTimeout(() => setShowBubble(false), 500);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showBubble, showTyping]);

  // Handle hover halo animation
  useEffect(() => {
    if (isHovered) {
      setShowHoverHalo(true);
    } else {
      // Small delay before removing halo to allow animation to complete
      const timer = setTimeout(() => {
        setShowHoverHalo(false);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isHovered]);

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
    
    // Stop typing and start post-typing wiggle after 1.5s
    setTimeout(() => {
      setShowTyping(false);
      setShowPostTypingWiggle(true);
      setShowHalo(true);
    }, 1500);

    // Stop post-typing wiggle and halo after 3s
    setTimeout(() => {
      setShowPostTypingWiggle(false);
      setTimeout(() => setShowHalo(false), 3000);
    }, 4500);

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
        <div className={`allm-relative allm-flex allm-flex-col allm-items-center ${
          showEntranceAnimation ? 'allm-animate-fly-in' : ''
        }`}>
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
            <div className="allm-relative allm-w-[100px] allm-h-[100px]">
              {(showHalo || showHoverHalo) && (
                <div className={`allm-absolute allm-inset-[-10px] allm-bg-[#00aac3] allm-opacity-0 allm-rounded-full ${
                  showHoverHalo ? 'allm-animate-halo-hover' : 'allm-animate-halo'
                }`} />
              )}
              <img 
                src={superKuala} 
                alt="KU Mascot" 
                className={`allm-w-[100px] allm-h-[100px] allm-object-contain allm-relative allm-z-10 ${
                  showTyping ? 'allm-animate-wiggle' : ''
                } ${showPostTypingWiggle ? 'allm-animate-wiggle-slow' : ''} ${
                  isHovered || isIdleJumping ? 'allm-animate-bounce-subtle' : ''
                }`}
              />
            </div>
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
