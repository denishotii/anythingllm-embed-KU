import React, { useEffect, useState } from 'react';

const OpenButton = () => {
  const [isJumping, setIsJumping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [showMessage, setShowMessage] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [fade, setFade] = useState(false);
  const [idleMessages] = useState([
    'Hello! How can I help you today?',
    'What would you like to know about our services?',
    'Feel free to ask any questions you have.',
    'We are here to assist you with all your needs.',
    'How can we assist you with your queries?'
  ]);

  useEffect(() => {
    let jumpInterval;
    let messageInterval;
    let lastJumpTime = Date.now();

    const startIdleAnimations = () => {
      // Jump every 15 seconds
      jumpInterval = setInterval(() => {
        const now = Date.now();
        if (now - lastJumpTime >= 15000) { // 15 seconds
          setIsJumping(true);
          lastJumpTime = now;
          setTimeout(() => setIsJumping(false), 1000);
        }
      }, 1000);

      // Send random message every 30 seconds
      messageInterval = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * idleMessages.length);
        setCurrentMessage(idleMessages[randomIndex]);
        setShowMessage(true);
        setShowTyping(true);

        setTimeout(() => {
          setShowTyping(false);
          setTimeout(() => {
            setFade(true);
            setTimeout(() => {
              setShowMessage(false);
              setFade(false);
            }, 500);
          }, 2000);
        }, 1000);
      }, 30000);
    };

    startIdleAnimations();

    return () => {
      clearInterval(jumpInterval);
      clearInterval(messageInterval);
    };
  }, []);

  return (
    <div>
      {/* Render your component content here */}
    </div>
  );
};

export default OpenButton; 