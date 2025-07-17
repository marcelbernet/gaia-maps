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
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-none pointer-events-none">
      <div className="bg-[rgba(30,34,54,0.82)] rounded-2xl shadow-2xl px-6 py-6 flex flex-col items-center pointer-events-auto max-w-xl w-full relative h-2/5 min-h-[140px] justify-center">
        <div className="font-serif text-lg sm:text-xl md:text-2xl lg:text-3xl text-white text-center mb-6 drop-shadow-lg pointer-events-none select-none" style={{ textShadow: '0 0 24px #fff, 0 0 48px #6ec1e4' }}>
          {displayed}
        </div>
        <div className="flex flex-col items-center gap-1 w-full">
          {sublines.map((line, i) => (
            <div
              key={i}
              className="font-sans text-xs sm:text-sm md:text-base text-blue-50 text-center max-w-lg mx-auto leading-relaxed tracking-wide bg-none select-none transition-opacity transition-transform duration-700"
              style={{
                opacity: showLines[i] ? 1 : 0,
                transform: showLines[i] ? 'translateY(0)' : 'translateY(24px)',
                transitionDelay: `${i * 0.5}s`,
              }}
            >
              {line}
            </div>
          ))}
        </div>
        <div
          className="flex gap-3 mt-6 justify-center w-full min-h-[44px] items-center transition-opacity transition-transform duration-700"
          style={{
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(24px)',
            transitionDelay: '3.5s',
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
          <button
            type="button"
            onClick={() => onFinish && onFinish('skip')}
            className="rounded-lg border-none bg-[rgba(30,34,54,0.7)] text-white text-xs sm:text-sm md:text-base px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2.5 font-bold shadow-md font-sans transition-colors hover:bg-sky-900"
            style={{ cursor: showButtons ? 'pointer' : 'default' }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroOverlay;