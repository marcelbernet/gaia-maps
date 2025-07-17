import React, { useEffect, useState } from 'react';

interface IntroOverlayProps {
  text: string;
  onFinish?: (action: 'tutorial' | 'skip') => void;
}

const sublines = [
  'We know of over 2 000 000 000 stars in our night sky.',
  'But the one right above you at your moment? You may be the first human to truly notice it.',
  'Let’s find yours.'
];

const IntroOverlay: React.FC<IntroOverlayProps> = ({ text, onFinish }) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const [showLines, setShowLines] = useState([false, false, false]);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i === text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, 60);
    return () => clearInterval(interval);
  }, [text]);

  useEffect(() => {
    if (done) {
      const timers: number[] = [];
      timers.push(setTimeout(() => setShowLines([true, false, false]), 500));
      timers.push(setTimeout(() => setShowLines([true, true, false]), 1000));
      timers.push(setTimeout(() => setShowLines([true, true, true]), 1500));
      timers.push(setTimeout(() => setShowButtons(true), 500));
      return () => timers.forEach(clearTimeout);
    }
  }, [done]);

  if (!displayed) return null;

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-start bg-none pointer-events-none pt-[10vh] md:pt-[18vh]">
      <div className="bg-[rgba(30,34,54,0.82)] rounded-2xl shadow-2xl px-3 sm:px-6 py-4 sm:py-6 flex flex-col items-center pointer-events-auto max-w-xl max-w-[95vw] w-full relative h-auto min-h-[120px] sm:min-h-[140px] justify-center">
        {/* X button in top-right, no background */}
        <button
          type="button"
          aria-label="Close"
          onClick={() => onFinish && onFinish('skip')}
          className="absolute top-2 right-2 sm:top-3 sm:right-3 text-white text-2xl sm:text-3xl font-bold focus:outline-none z-10 hover:scale-110 transition-transform"
          style={{ pointerEvents: 'auto', background: 'none', border: 'none', boxShadow: 'none', width: '2.2rem', height: '2.2rem', lineHeight: '2.2rem', padding: 0 }}
        >
          ×
        </button>
        <div className="font-serif text-base xs:text-lg sm:text-xl md:text-2xl lg:text-3xl text-white text-center mb-4 sm:mb-6 drop-shadow-lg pointer-events-none select-none break-words" style={{ textShadow: '0 0 24px #fff, 0 0 48px #6ec1e4', wordBreak: 'break-word' }}>
          {displayed}
        </div>
        <div className="flex flex-col items-center gap-1 w-full relative min-h-[90px] sm:min-h-[110px]">
          {sublines.map((line, i) => {
            const isVisible = showLines[i];
            return (
              <div
                key={i}
                className={`font-sans text-xs sm:text-sm md:text-base text-blue-50 text-center max-w-lg mx-auto leading-relaxed tracking-wide bg-none select-none
                  transition-all duration-700
                  ${isVisible ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-8 absolute pointer-events-none'}`}
                style={{
                  left: 0, right: 0,
                  transitionDelay: isVisible ? `${i * 0.5}s` : '0s',
                }}
              >
                {line}
              </div>
            );
          })}
        </div>
        {/* Show button only after last subline is visible */}
        {showLines[2] && (
          <div
            className="flex gap-3 mt-2 justify-center w-full min-h-[44px] items-center transition-opacity transition-transform duration-700"
            style={{
              opacity: showButtons ? 1 : 0,
              transform: showButtons ? 'translateY(0)' : 'translateY(24px)',
              transitionDelay: '0.5s',
              pointerEvents: showButtons ? 'auto' : 'none',
            }}
          >
            <button
              type="button"
              onClick={() => onFinish && onFinish('tutorial')}
              className="rounded-lg border-none bg-gradient-to-r from-sky-400 to-purple-400 text-white text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 font-bold shadow-md font-sans transition-colors hover:from-purple-400 hover:to-sky-400"
              style={{ cursor: showButtons ? 'pointer' : 'default' }}
            >
              Launch Tutorial
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default IntroOverlay;