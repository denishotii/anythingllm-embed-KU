import React, { useEffect, useState } from "react";
import KUalaWithBook from "@/assets/KUalaWithBook.svg";

export default function WelcomePanel({ labels }) {
  const [showEntrance, setShowEntrance] = useState(false);

  useEffect(() => {
    // Trigger entrance animation on mount
    setShowEntrance(true);
    // Optionally, remove entrance after animation duration
    const timer = setTimeout(() => setShowEntrance(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div className="allm-flex allm-flex-col allm-items-center allm-justify-center allm-gap-4 allm-p-8 allm-relative allm-min-h-[450px] allm-bg-gradient-to-b allm-from-white allm-to-[#f9fafe]/50 allm-rounded-lg allm-shadow-sm">
       
       <h2 className="allm-text-lg allm-font-semibold allm-text-[#002D72]/90 allm-text-center">
        {labels?.welcomePanel || "I'm KUala-Bot. Here to guide you through KU."}
      </h2>

      <div className="allm-relative allm-w-40 allm-h-40 ">
        <img
          src={KUalaWithBook}
          alt="KUala with Book"
          className={`allm-w-full allm-h-full allm-object-contain allm-drop-shadow-md 
            ${showEntrance ? 'allm-animate-fadeIn allm-scale-90' : ''}
            ${isHovered ? 'allm-animate-wiggle' : ''}
          `}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{ transition: 'transform 0.3s' }}
        />
      </div>

     
    </div>
  );
} 