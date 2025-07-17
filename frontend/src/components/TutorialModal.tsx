import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface TutorialModalProps {
  step: number;
  onNext: () => void;
  onSkip: () => void;
}

const steps = [
  {
    text: 'Choose a date & time',
    highlight: 'datetime',
  },
  {
    text: 'Click on the map',
    highlight: 'map',
  },
  {
    text: 'Watch the stars appear!',
    highlight: 'star',
  },
];

const TutorialModal: React.FC<TutorialModalProps> = ({ step, onNext, onSkip }) => {
  const [controlsEl, setControlsEl] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (step === 0) {
      const controls = document.querySelector('.controls') as HTMLElement;
      if (controls) {
        controls.style.zIndex = '1';
        setControlsEl(controls);
      }
    }
  }, [step]);

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Modal box anchored top right on desktop, top/centered on mobile */}
      <div
        className="absolute top-8 right-8 left-8 md:left-auto bg-[rgba(30,34,54,0.95)] rounded-xl shadow-2xl px-8 py-6 text-white min-w-[260px] max-w-xs md:max-w-sm font-sans text-base md:text-lg flex flex-col items-start gap-4 pointer-events-auto"
      >
        <div className="font-bold text-lg md:text-xl mb-2">{step === 2 ? 'Click Get Stars' : steps[step].text}</div>
        <div className="flex gap-3 w-full">
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg border-none bg-gradient-to-r from-sky-400 to-purple-400 text-white text-base md:text-lg px-4 py-2 font-bold shadow-md font-sans transition-colors hover:from-purple-400 hover:to-sky-400 flex-1"
          >
            {step < 2 ? 'Next' : 'Done'}
          </button>
          {step < 2 && (
            <button
              type="button"
              onClick={onSkip}
              className="rounded-lg border-none bg-[rgba(30,34,54,0.7)] text-white text-base md:text-lg px-4 py-2 font-bold shadow-md font-sans transition-colors hover:bg-sky-900 flex-1"
            >
              Skip Tutorial
            </button>
          )}
        </div>
      </div>
      {/* Step-specific highlight/animation overlays */}
      {step === 0 && controlsEl && createPortal(
        <div
          style={{
            position: 'absolute',
            top: -8,
            left: -8,
            width: 'calc(100% + 16px)',
            height: 'calc(100% + 16px)',
            borderRadius: 22,
            border: '4px solid gold',
            boxShadow: '0 0 32px 8px gold',
            pointerEvents: 'none',
            zIndex: 0,
            transition: 'all 0.5s',
          }}
        />, controlsEl
      )}
      {step === 1 && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 100,
            pointerEvents: 'none',
          }}
        >
          {/* Inline hand-pointer.svg */}
          <svg
            width="90"
            height="90"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="rebound-up"
            style={{ filter: 'drop-shadow(0 0 12px #ffe066) drop-shadow(0 0 32px #ffe066)' }}
          >
            <path d="M 13 2 C 11.355469 2 10 3.355469 10 5 L 10 16.8125 L 9.34375 16.125 L 9.09375 15.90625 C 7.941406 14.753906 6.058594 14.753906 4.90625 15.90625 C 3.753906 17.058594 3.753906 18.941406 4.90625 20.09375 L 4.90625 20.125 L 13.09375 28.21875 L 13.15625 28.25 L 13.1875 28.3125 C 14.535156 29.324219 16.253906 30 18.1875 30 L 19.90625 30 C 24.441406 30 28.09375 26.347656 28.09375 21.8125 L 28.09375 14 C 28.09375 12.355469 26.738281 11 25.09375 11 C 24.667969 11 24.273438 11.117188 23.90625 11.28125 C 23.578125 9.980469 22.394531 9 21 9 C 20.234375 9 19.53125 9.300781 19 9.78125 C 18.46875 9.300781 17.765625 9 17 9 C 16.648438 9 16.316406 9.074219 16 9.1875 L 16 5 C 16 3.355469 14.644531 2 13 2 Z M 13 4 C 13.554688 4 14 4.445313 14 5 L 14 16 L 16 16 L 16 12 C 16 11.445313 16.445313 11 17 11 C 17.554688 11 18 11.445313 18 12 L 18 16 L 20 16 L 20 12 C 20 11.445313 20.445313 11 21 11 C 21.554688 11 22 11.445313 22 12 L 22 16 L 24.09375 16 L 24.09375 14 C 24.09375 13.445313 24.539063 13 25.09375 13 C 25.648438 13 26.09375 13.445313 26.09375 14 L 26.09375 21.8125 C 26.09375 25.277344 23.371094 28 19.90625 28 L 18.1875 28 C 16.722656 28 15.457031 27.476563 14.40625 26.6875 L 6.3125 18.6875 C 5.867188 18.242188 5.867188 17.757813 6.3125 17.3125 C 6.757813 16.867188 7.242188 16.867188 7.6875 17.3125 L 12 21.625 L 12 5 C 12 4.445313 12.445313 4 13 4 Z" fill="#fff" stroke="#ffd700" strokeWidth="1.2" strokeLinejoin="round"/>
          </svg>
        </div>
      )}
      {/* No highlight for step 2, just text change */}
      {/* Pulse keyframes */}
      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 #6ec1e488; }
          70% { box-shadow: 0 0 0 16px #6ec1e400; }
          100% { box-shadow: 0 0 0 0 #6ec1e400; }
        }
      `}</style>
      {/* Custom upward bounce animation */}
      <style>{`
        @keyframes rebound-up {
          0%, 100% { transform: translateY(0); }
          30% { transform: translateY(-28px); }
          50% { transform: translateY(-32px); }
          70% { transform: translateY(-28px); }
          100% { transform: translateY(0); }
        }
        .rebound-up {
          animation: rebound-up 1.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};

export default TutorialModal; 