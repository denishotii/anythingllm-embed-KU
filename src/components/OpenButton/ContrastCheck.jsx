import React, { useEffect, useState, useRef } from 'react';

const ContrastCheck = ({ children }) => {
  const [needsBackground, setNeedsBackground] = useState(false);
  const containerRef = useRef(null);
  const observerRef = useRef(null);
  const checkTimeoutRef = useRef(null);

  useEffect(() => {
    const checkContrast = () => {
      if (!containerRef.current) return;

      // Clear any existing timeout
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }

      // Debounce the check
      checkTimeoutRef.current = setTimeout(() => {
        const rect = containerRef.current.getBoundingClientRect();
        
        // Sample multiple points around the mascot
        const points = [
          { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, // center
          { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.25 }, // top-left
          { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.75 }, // bottom-right
        ];

        let totalLuminance = 0;
        let validPoints = 0;

        points.forEach(point => {
          // Get the element at this point
          const element = document.elementFromPoint(point.x, point.y);
          if (!element) return;

          // Get the background color
          const backgroundColor = window.getComputedStyle(element).backgroundColor;
          const rgb = backgroundColor.match(/\d+/g);
          if (!rgb) return;

          // Calculate luminance for this point
          const [r, g, b] = rgb.map(Number);
          const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          
          totalLuminance += luminance;
          validPoints++;
        });

        // Only update if we have valid points
        if (validPoints > 0) {
          const averageLuminance = totalLuminance / validPoints;
          setNeedsBackground(averageLuminance < 0.6); // Slightly higher threshold
        }
      }, 100); // 100ms debounce
    };

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          checkContrast();
        }
      },
      { 
        threshold: 0.1,
        root: null // Use viewport as root
      }
    );

    if (containerRef.current) {
      observerRef.current.observe(containerRef.current);
    }

    // Add event listeners
    const debouncedCheck = () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      checkTimeoutRef.current = setTimeout(checkContrast, 100);
    };

    window.addEventListener('scroll', debouncedCheck, { passive: true });
    window.addEventListener('resize', debouncedCheck, { passive: true });

    // Initial check
    checkContrast();

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
      window.removeEventListener('scroll', debouncedCheck);
      window.removeEventListener('resize', debouncedCheck);
    };
  }, []);

  return (
    <div ref={containerRef} className="allm-relative">
      {needsBackground && (
        <div 
          className="allm-absolute allm-inset-0 allm-rounded-full allm-bg-white/25 allm-blur-md allm-scale-110 allm-transition-opacity allm-duration-300"
          style={{ 
            pointerEvents: 'none',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)'
          }}
        />
      )}
      {children}
    </div>
  );
};

export default ContrastCheck; 