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
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 100,
        pointerEvents: 'none',
      }}
    >
      {/* Modal box anchored top right */}
      <div
        style={{
          position: 'absolute',
          top: 32,
          right: 32,
          background: 'rgba(30,34,54,0.95)',
          borderRadius: 18,
          boxShadow: '0 4px 32px 0 #000a',
          padding: '2em 2.5em',
          color: '#fff',
          minWidth: 320,
          maxWidth: 400,
          fontFamily: 'Montserrat, Arial, sans-serif',
          fontSize: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          gap: '1.2em',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: '1.3em', marginBottom: '0.5em' }}>{step === 2 ? 'Click Get Stars' : steps[step].text}</div>
        <div style={{ display: 'flex', gap: '1em', width: '100%' }}>
          <button
            type="button"
            onClick={onNext}
            style={{
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(90deg, #6ec1e4 0%, #b388ff 100%)',
              color: '#fff',
              fontSize: '1.1em',
              padding: '0.6em 1.5em',
              cursor: 'pointer',
              boxShadow: '0 2px 8px #0006',
              fontFamily: 'Montserrat, Arial, sans-serif',
              fontWeight: 700,
              transition: 'background 0.2s, color 0.2s',
              flex: 1,
            }}
          >
            {step < 2 ? 'Next' : 'Done'}
          </button>
          {step < 2 && (
            <button
              type="button"
              onClick={onSkip}
              style={{
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(30,34,54,0.7)',
                color: '#fff',
                fontSize: '1.1em',
                padding: '0.6em 1.5em',
                cursor: 'pointer',
                boxShadow: '0 2px 8px #0006',
                fontFamily: 'Montserrat, Arial, sans-serif',
                fontWeight: 700,
                transition: 'background 0.2s, color 0.2s',
                flex: 1,
              }}
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