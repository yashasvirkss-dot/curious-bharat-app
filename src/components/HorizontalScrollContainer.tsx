import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { playSound, SoundType } from '../utils/audio';

interface HorizontalScrollContainerProps {
  children: React.ReactNode;
  className?: string;
  innerClassName?: string;
}

const CLICK_SOUNDS: SoundType[] = ['Soft Click', 'Digital Tap', 'Crystal Click', 'Toggle Tick'];
const WHOOSH_SOUNDS: SoundType[] = ['Smooth Whoosh', 'Swipe Transition', 'Quantum Pulse', 'Swipe Transition'];

export default function HorizontalScrollContainer({
  children,
  className = '',
  innerClassName = ''
}: HorizontalScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  
  // Track sound indices for alternating/cycling effects
  const clickSoundIndexRef = useRef(0);
  const whooshSoundIndexRef = useRef(0);
  const lastSoundTimeRef = useRef(0);

  const checkScrollLimits = () => {
    const el = scrollRef.current;
    if (el) {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      // Use 2px tolerance for fractional zoom levels
      setCanScrollLeft(scrollLeft > 2);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 2);
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    checkScrollLimits();

    // Set up ResizeObserver to handle layout/screen width changes
    const resizeObserver = new ResizeObserver(() => {
      checkScrollLimits();
    });
    resizeObserver.observe(el);

    // Also observe children changes if any
    if (el.firstElementChild) {
      resizeObserver.observe(el.firstElementChild);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [children]);

  const playInteractiveSounds = () => {
    const now = Date.now();
    // 150ms cooldown to avoid sound congestion
    if (now - lastSoundTimeRef.current > 150) {
      // Cycle click sounds
      const clickSound = CLICK_SOUNDS[clickSoundIndexRef.current];
      clickSoundIndexRef.current = (clickSoundIndexRef.current + 1) % CLICK_SOUNDS.length;
      playSound(clickSound);

      // Cycle whoosh sounds slightly delayed or layered
      setTimeout(() => {
        const whooshSound = WHOOSH_SOUNDS[whooshSoundIndexRef.current];
        whooshSoundIndexRef.current = (whooshSoundIndexRef.current + 1) % WHOOSH_SOUNDS.length;
        playSound(whooshSound);
      }, 30);

      lastSoundTimeRef.current = now;
    }
  };

  const handleScrollLeft = () => {
    const el = scrollRef.current;
    if (el) {
      playInteractiveSounds();
      el.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    const el = scrollRef.current;
    if (el) {
      playInteractiveSounds();
      el.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  // Safe manual swipe/scroll sound trigger
  const handleScroll = () => {
    checkScrollLimits();
    
    // Play a gentle whoosh sound when the user drags/swipes manually
    const now = Date.now();
    if (now - lastSoundTimeRef.current > 400) {
      const whooshSound = WHOOSH_SOUNDS[whooshSoundIndexRef.current];
      whooshSoundIndexRef.current = (whooshSoundIndexRef.current + 1) % WHOOSH_SOUNDS.length;
      playSound(whooshSound);
      lastSoundTimeRef.current = now;
    }
  };

  return (
    <div className={`relative flex items-center w-full group ${className}`}>
      {/* Left Fade/Scroll button */}
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center pl-1 pr-4 bg-gradient-to-r from-black/80 to-transparent z-20 pointer-events-none rounded-l-2xl">
          <button
            type="button"
            onClick={handleScrollLeft}
            className="pointer-events-auto flex items-center justify-center w-7 h-7 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Scroll Left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main horizontal scrolling container */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={`w-full overflow-x-auto no-scrollbar scroll-smooth flex flex-row items-center gap-2 ${innerClassName}`}
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {children}
      </div>

      {/* Right Fade/Scroll button */}
      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center pr-1 pl-4 bg-gradient-to-l from-black/80 to-transparent z-20 pointer-events-none rounded-r-2xl">
          <button
            type="button"
            onClick={handleScrollRight}
            className="pointer-events-auto flex items-center justify-center w-7 h-7 bg-zinc-900/90 border border-zinc-800 hover:border-zinc-700 text-white rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            aria-label="Scroll Right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
