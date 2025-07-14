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
  // No fadeOut, overlay stays until closed

  // Typewriter effect for headline
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

  // Animate in sublines, then show buttons
  useEffect(() => {
    if (done) {
      const timers: number[] = [];
      timers.push(setTimeout(() => setShowLines([true, false, false]), 500));
      timers.push(setTimeout(() => setShowLines([true, true, false]), 1000));
      timers.push(setTimeout(() => setShowLines([true, true, true]), 1500));
      timers.push(setTimeout(() => setShowButtons(true), 500)); // 1s after last subline is fully visible
      return () => timers.forEach(clearTimeout);
    }
  }, [done]);

  if (!displayed) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'none', // fully transparent
        pointerEvents: 'none',
        opacity: 1,
      }}
    >
      <div
        style={{
          background: 'rgba(30,34,54,0.82)',
          borderRadius: '22px',
          boxShadow: '0 4px 32px 0 #000a',
          padding: '2.2em 2.5em 1.5em 2.5em',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          pointerEvents: 'auto', // allow interaction for close button
          maxWidth: 700,
          position: 'relative',
        }}
      >
        <div
          style={{
            fontFamily: 'serif',
            fontSize: '3.2rem',
            color: '#fff',
            textShadow: '0 0 24px #fff, 0 0 48px #6ec1e4',
            marginBottom: '1.2em',
            pointerEvents: 'none',
            textAlign: 'center',
          }}
        >
          {displayed}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5em', width: '100%' }}>
          {sublines.map((line, i) => (
            <div
              key={i}
              style={{
                opacity: showLines[i] ? 1 : 0,
                transform: showLines[i] ? 'translateY(0)' : 'translateY(24px)',
                transition: 'opacity 0.7s, transform 0.7s',
                transitionDelay: `${i * 0.5}s`,
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontSize: '1.2rem',
                color: '#f4faff',
                textAlign: 'center',
                maxWidth: 600,
                margin: '0 auto',
                lineHeight: 1.6,
                letterSpacing: '0.01em',
                background: 'none',
                pointerEvents: 'none',
              }}
            >
              {line}
            </div>
          ))}
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1em',
            marginTop: '2em',
            justifyContent: 'center',
            width: '100%',
            minHeight: 56,
            alignItems: 'center',
            opacity: showButtons ? 1 : 0,
            transform: showButtons ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 0.7s, transform 0.7s',
            transitionDelay: '3.5s',
            pointerEvents: showButtons ? 'auto' : 'none',
          }}
        >
          <button
            type="button"
            onClick={() => onFinish && onFinish('tutorial')}
            style={{
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #6ec1e4 0%, #b388ff 100%)',
              color: '#fff',
              fontSize: '1.1em',
              padding: '0.6em 1.5em',
              cursor: showButtons ? 'pointer' : 'default',
              boxShadow: '0 2px 8px #0006',
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Launch Tutorial
          </button>
          <button
            type="button"
            onClick={() => onFinish && onFinish('skip')}
            style={{
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(30,34,54,0.7)',
              color: '#fff',
              fontSize: '1.1em',
              padding: '0.6em 1.5em',
              cursor: showButtons ? 'pointer' : 'default',
              boxShadow: '0 2px 8px #0006',
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default IntroOverlay; 