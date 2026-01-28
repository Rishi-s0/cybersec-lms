import React, { useState, useEffect } from 'react';

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const updateScrollProgress = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollable = scrollHeight - clientHeight;
      
      if (scrollable <= 0) {
        setScrollProgress(0);
        return;
      }
      
      const scrolled = (scrollTop / scrollable) * 100;
      setScrollProgress(Math.min(Math.max(scrolled, 0), 100));
    };

    // Update on scroll
    window.addEventListener('scroll', updateScrollProgress);
    
    // Update on resize (in case content height changes)
    window.addEventListener('resize', updateScrollProgress);
    
    // Initial calculation
    updateScrollProgress();

    return () => {
      window.removeEventListener('scroll', updateScrollProgress);
      window.removeEventListener('resize', updateScrollProgress);
    };
  }, []);

  return (
    <>
      {/* Main progress bar - clean and simple */}
      <div 
        className="fixed top-0 left-0 w-full pointer-events-none"
        style={{ 
          height: '3px',
          backgroundColor: 'rgba(13, 17, 23, 0.3)',
          zIndex: 9999
        }}
      >
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${scrollProgress}%`,
            background: 'linear-gradient(90deg, #9fef00, #b8ff29, #00ffff)',
            boxShadow: '0 0 8px rgba(159, 239, 0, 0.5)'
          }}
        />
      </div>
      
      {/* Subtle glow effect */}
      <div 
        className="fixed top-0 left-0 w-full pointer-events-none"
        style={{ 
          height: '3px',
          zIndex: 9998
        }}
      >
        <div 
          className="h-full transition-all duration-300 ease-out"
          style={{ 
            width: `${scrollProgress}%`,
            background: '#9fef00',
            filter: 'blur(1px)',
            opacity: 0.4
          }}
        />
      </div>
    </>
  );
};

export default ScrollProgress;