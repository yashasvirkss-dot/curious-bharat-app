import React, { useState, useRef, useEffect } from 'react';
import { RefreshCw, ArrowDown, Check } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void> | void;
  pullThreshold?: number;
}

export default function PullToRefresh({
  children,
  onRefresh,
  pullThreshold = 75
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);

  // Sound generator for tactile refresh click
  const playRefreshSound = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (_) {}
  };

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (isRefreshing) return;
    
    // Check if parent or window is scrolled to top
    const scrollTop = containerRef.current ? containerRef.current.scrollTop : window.scrollY;
    if (scrollTop > 5) return;

    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    startYRef.current = pageY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDraggingRef.current || isRefreshing) return;

    const pageY = 'touches' in e ? e.touches[0].pageY : e.pageY;
    const deltaY = pageY - startYRef.current;

    const scrollTop = containerRef.current ? containerRef.current.scrollTop : window.scrollY;

    if (deltaY > 0 && scrollTop <= 5) {
      // Resistance curve for smooth elastic pulling
      const distance = Math.min(Math.pow(deltaY, 0.8) * 1.8, pullThreshold * 1.5);
      setPullDistance(distance);
    } else {
      setPullDistance(0);
    }
  };

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current || isRefreshing) return;
    isDraggingRef.current = false;

    if (pullDistance >= pullThreshold) {
      setIsRefreshing(true);
      setPullDistance(pullThreshold);
      playRefreshSound();

      try {
        await onRefresh();
        setRefreshSuccess(true);
        setTimeout(() => setRefreshSuccess(false), 1200);
      } catch (err) {
        console.warn("Pull to refresh error:", err);
      } finally {
        setTimeout(() => {
          setIsRefreshing(false);
          setPullDistance(0);
        }, 500);
      }
    } else {
      setPullDistance(0);
    }
  };

  const progressRatio = Math.min(pullDistance / pullThreshold, 1);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      className="relative min-h-screen w-full overflow-x-hidden"
    >
      {/* Pull To Refresh Top Banner Indicator */}
      <div
        className="fixed top-0 left-0 right-0 z-50 pointer-events-none flex items-center justify-center transition-all duration-200"
        style={{
          transform: `translateY(${pullDistance - 50}px)`,
          opacity: pullDistance > 10 || isRefreshing ? 1 : 0
        }}
      >
        <div className="bg-zinc-900/90 border border-zinc-700/80 backdrop-blur-md text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2.5 text-xs font-mono font-bold tracking-wide">
          {refreshSuccess ? (
            <>
              <Check className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="text-emerald-400">Synced Realtime DB!</span>
            </>
          ) : isRefreshing ? (
            <>
              <RefreshCw className="w-4 h-4 text-cyan-400 animate-spin" />
              <span className="text-cyan-300">Refreshing Curious Bharat...</span>
            </>
          ) : (
            <>
              <ArrowDown
                className="w-4 h-4 text-zinc-300 transition-transform duration-200"
                style={{ transform: `rotate(${progressRatio * 180}deg)` }}
              />
              <span className={progressRatio >= 1 ? "text-cyan-400" : "text-zinc-300"}>
                {progressRatio >= 1 ? "Release to sync now!" : "Pull down to refresh"}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Main Content View with Dynamic Shift during pull */}
      <div
        style={{
          transform: pullDistance > 0 ? `translateY(${pullDistance * 0.4}px)` : 'none',
          transition: isDraggingRef.current ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
        }}
      >
        {children}
      </div>
    </div>
  );
}
