import { useEffect, useState } from 'react';
import superKuala from '../../assets/superKuala.svg';
import { detectLanguage, getLanguageLabels } from '@/utils/language';

export default function IntroAnimation({ onAnimationComplete }) {
  const [isVisible, setIsVisible] = useState(false);
  const [showTyping, setShowTyping] = useState(true);
  const [showMessage, setShowMessage] = useState(false);
  const language = detectLanguage();
  const labels = getLanguageLabels(language);

  useEffect(() => {
    // Check if animation should be shown
    const shouldShowAnimation = () => {
      // Check if user has seen the animation before
      const hasSeenAnimation = localStorage.getItem('kualaAnimationSeen');
      // Check if user has opened chat before
      const hasOpenedChat = localStorage.getItem('kualaChatOpened');
      // Check scroll position (show only if not scrolled too far)
      const scrollPosition = window.scrollY;
      const maxScroll = 300; // Maximum scroll position to show animation

      // Show animation if:
      // 1. User hasn't seen it before AND
      // 2. Either it's their first visit OR they've opened chat before AND
      // 3. They haven't scrolled too far
      return !hasSeenAnimation && 
             (!hasOpenedChat || hasOpenedChat === 'true') && 
             scrollPosition < maxScroll;
    };

    // Initial delay of 5 seconds
    const initialTimer = setTimeout(() => {
      if (shouldShowAnimation()) {
        setIsVisible(true);
      }
    }, 5000);

    // Typing effect timer
    const typingTimer = setTimeout(() => {
      if (isVisible) {
        setShowTyping(false);
        setShowMessage(true);
      }
    }, 1400);

    // Auto-hide after 18 seconds
    const hideTimer = setTimeout(() => {
      if (isVisible) {
        setIsVisible(false);
        onAnimationComplete?.();
        // Mark animation as seen
        localStorage.setItem('kualaAnimationSeen', 'true');
      }
    }, 18000);

    // Cleanup timers
    return () => {
      clearTimeout(initialTimer);
      clearTimeout(typingTimer);
      clearTimeout(hideTimer);
    };
  }, [isVisible, onAnimationComplete]);

  // Track chat opening
  useEffect(() => {
    const handleChatOpen = () => {
      localStorage.setItem('kualaChatOpened', 'true');
    };

    // Listen for chat open event
    window.addEventListener('anythingllm-chat-widget-opened', handleChatOpen);

    return () => {
      window.removeEventListener('anythingllm-chat-widget-opened', handleChatOpen);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div className="allm-fixed allm-bottom-24 allm-right-4 allm-z-50 allm-animate-fade-up">
      <div className="allm-relative allm-flex allm-flex-col allm-items-end">
        {/* Message Bubble with creative design */}
        <div className="allm-bg-gradient-to-br allm-from-white allm-to-gray-50 allm-rounded-2xl allm-p-4 allm-shadow-xl allm-w-[280px] allm-animate-slide-in allm-border allm-border-gray-100 allm-relative allm-transform allm-transition-all allm-duration-300 hover:allm-scale-[1.02]">
          {/* Decorative elements */}
          <div className="allm-absolute allm-top-0 allm-right-0 allm-w-16 allm-h-16 allm-bg-[#002D72] allm-opacity-5 allm-rounded-full allm-blur-xl"></div>
          <div className="allm-absolute allm-bottom-0 allm-left-0 allm-w-12 allm-h-12 allm-bg-[#002D72] allm-opacity-5 allm-rounded-full allm-blur-xl"></div>
          
          <div className="allm-flex allm-items-start allm-gap-3 allm-relative">
            {/* KUala Profile Picture */}
            <div className={`allm-w-16 allm-h-16 allm-relative allm-flex-shrink-0 ${showTyping ? 'allm-animate-bounce-subtle' : ''}`}>
              <img 
                src={superKuala} 
                alt="KUala" 
                className="allm-w-full allm-h-full allm-object-contain allm-drop-shadow-md allm-rounded-full allm-border-2 allm-border-[#002D72]"
              />
            </div>
            
            <div className="allm-flex-1">
              <div className="allm-text-[#002D72] allm-font-bold allm-text-sm allm-mb-1">
                {labels.animation.botName}
              </div>
              <div className="allm-text-gray-700 allm-text-sm allm-leading-relaxed allm-min-h-[20px] allm-flex allm-items-center">
                {showTyping ? (
                  <div className="allm-flex allm-items-center allm-gap-1.5">
                    <span className="allm-w-1.5 allm-h-1.5 allm-bg-gray-500 allm-rounded-full allm-animate-bounce-subtle"></span>
                    <span className="allm-w-1.5 allm-h-1.5 allm-bg-gray-500 allm-rounded-full allm-animate-bounce-subtle allm-animation-delay-150"></span>
                    <span className="allm-w-1.5 allm-h-1.5 allm-bg-gray-500 allm-rounded-full allm-animate-bounce-subtle allm-animation-delay-300"></span>
                  </div>
                ) : showMessage && (
                  <div className="allm-animate-message-appear">
                    {labels.animation.message}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Creative message bubble triangle */}
          <div className="allm-absolute allm-bottom-[-8px] allm-right-[20px] allm-transform allm-rotate-45 allm-w-4 allm-h-4 allm-bg-gradient-to-br allm-from-white allm-to-gray-50 allm-border-r allm-border-b allm-border-gray-100"></div>
        </div>
      </div>
    </div>
  );
} 