'use client';

import { useState, useEffect } from 'react';

const bootLines = [
  { text: 'BIOS v4.0.1 · Copyright (C) 2025 · AM Systems', type: 'dim' },
  { text: 'CPU: AANAN MUNNA FRONTEND ENGINE v5.0 · 4 Core · 8 Threads', type: 'normal' },
  { text: 'RAM: 16384MB OK · VRAM: 8192MB OK', type: 'dim' },
  { text: 'Loading core modules...', type: 'normal' },
  { text: '  [OK] react.skill → v18.3.1', type: 'ok' },
  { text: '  [OK] nextjs.skill → v15.0.0', type: 'ok' },
  { text: '  [OK] typescript.skill → v5.4', type: 'ok' },
  { text: '  [OK] animation.engine → GSAP v3.12', type: 'ok' },
  { text: '  [WARN] perfectionism.module → memory HIGH (expected)', type: 'warn' },
  { text: 'Mounting /portfolio/v5 ...', type: 'normal' },
  { text: 'Integrity: ████████████ PASS', type: 'dim' },
  { text: 'Interface ready. ', type: 'bright', cursor: true },
];

export default function BootSequence({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [isDone, setIsDone] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const showNextLine = () => {
      setVisibleLines((prev) => {
        if (prev < bootLines.length) {
          timeout = setTimeout(showNextLine, 50 + Math.random() * 80);
          return prev + 1;
        } else {
          timeout = setTimeout(() => {
            setIsFadingOut(true);
            setTimeout(() => {
              setIsDone(true);
              onComplete();
            }, 800); // Wait for fade out transition
          }, 380);
          return prev;
        }
      });
    };

    timeout = setTimeout(showNextLine, 100);

    return () => clearTimeout(timeout);
  }, [onComplete]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] bg-[#03050c] flex flex-col justify-center items-start p-[clamp(20px,5vw,80px)] font-mono overflow-hidden transition-all duration-800 ease-in-out ${
        isFadingOut ? 'opacity-0 scale-[1.012] pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Progress Bar */}
      <div 
        className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-[#00331a] to-[#00ff88] shadow-[0_0_8px_#00ff88] transition-all duration-200 ease-out"
        style={{ width: `${(visibleLines / bootLines.length) * 100}%` }}
      />

      {bootLines.map((line, index) => {
        const isVisible = index < visibleLines;
        
        let colorClass = 'text-[#00cc6a]'; // normal
        if (line.type === 'dim') colorClass = 'text-[#2a3d58]';
        if (line.type === 'warn') colorClass = 'text-[#ffb800]';
        if (line.type === 'bright') colorClass = 'text-[#ffffff]';

        return (
          <div
            key={index}
            className={`text-[clamp(10px,1.1vw,13px)] tracking-[0.04em] leading-[2.3] transition-all duration-150 ${colorClass} ${
              isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            {line.type === 'ok' ? (
              <>
                &nbsp;&nbsp;[<span className="text-[#00ff88]">OK</span>]{line.text.replace('  [OK]', '')}
              </>
            ) : line.type === 'warn' ? (
              <>
                &nbsp;&nbsp;[<span className="text-[#ffb800]">WARN</span>]{line.text.replace('  [WARN]', '')}
              </>
            ) : (
              line.text
            )}
            {line.cursor && (
              <span className="animate-blink">_</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
