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
            width: 80,
            height: 80,
            borderRadius: '50%',
            border: '4px solid #fff',
            boxShadow: '0 0 32px #6ec1e4',
            animation: 'pulse 1.2s infinite',
            pointerEvents: 'none',
          }}
        />
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
    </div>
  );
};

export default TutorialModal; 