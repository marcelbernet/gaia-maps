import React from 'react';

const sublines = [
  'This is a test box rendered with Tailwind CSS.',
  'You can use this to verify overlay placement and styling.',
  'Adjust the component as needed.'
];

const TestTailwindBox: React.FC = () => {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center pointer-events-none">
      <div className="bg-red-600/90 rounded-2xl shadow-2xl px-8 py-6 flex flex-col items-center max-w-xl w-full pointer-events-auto">
        <div className="font-serif text-4xl md:text-5xl text-white text-center mb-6 drop-shadow-lg select-none">
          Test
        </div>
        <div className="flex flex-col items-center gap-2 w-full">
          {sublines.map((line, i) => (
            <div
              key={i}
              className="font-sans text-base md:text-lg text-red-100 text-center max-w-lg mx-auto leading-relaxed tracking-wide bg-none select-none"
            >
              {line}
            </div>
          ))}
        </div>
        <div className="flex gap-4 mt-8 justify-center w-full min-h-[56px] items-center">
          <button
            type="button"
            className="rounded-lg border-none bg-gradient-to-r from-red-400 to-red-700 text-white text-lg px-6 py-2 font-bold shadow-md font-sans transition-colors hover:from-red-700 hover:to-red-400"
          >
            Launch Tutorial
          </button>
          <button
            type="button"
            className="rounded-lg border-none bg-red-800/80 text-white text-lg px-6 py-2 font-bold shadow-md font-sans transition-colors hover:bg-red-700"
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestTailwindBox; 