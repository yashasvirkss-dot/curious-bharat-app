import React, { useState, useEffect, useRef } from 'react';
import { Home, Bookmark, BookOpen, User, Bot, ShieldAlert, ChevronUp } from 'lucide-react';
import { playSound } from '../utils/audio';

interface BottomNavigationProps {
  activeTab: 'home' | 'batches' | 'practice' | 'ai' | 'profile';
  onChangeTab: (tab: 'home' | 'batches' | 'practice' | 'ai' | 'profile') => void;
  isOnline: boolean;
  appLanguage?: 'en' | 'hi';
}

export default function BottomNavigation({ 
  activeTab, 
  onChangeTab, 
  isOnline,
  appLanguage = 'en'
}: BottomNavigationProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  interface TabItem {
    id: 'home' | 'batches' | 'practice' | 'ai' | 'profile';
    label: string;
    icon: React.ComponentType<any>;
  }

  const tabs: TabItem[] = [
    { id: 'home', label: appLanguage === 'hi' ? 'होम' : 'Home', icon: Home },
    { id: 'batches', label: appLanguage === 'hi' ? 'बैच' : 'Batches', icon: BookOpen },
    { id: 'practice', label: appLanguage === 'hi' ? 'अभ्यास' : 'Practice', icon: Bookmark },
    { id: 'ai', label: appLanguage === 'hi' ? 'भारत AI' : 'Bharat AI', icon: Bot },
    { id: 'profile', label: appLanguage === 'hi' ? 'विश्लेषण' : 'Analysis', icon: User }
  ];

  // Disappearing/Consolidating timer: 20 seconds of user idleness
  const resetTimer = () => {
    setIsCollapsed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    timerRef.current = setTimeout(() => {
      setIsCollapsed(true);
    }, 20000); // 20 seconds
  };

  useEffect(() => {
    // Listen to user interactions anywhere on the window
    const events = ['mousemove', 'click', 'keydown', 'touchstart', 'scroll'];
    
    // Start initial timer
    resetTimer();

    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => {
      window.addEventListener(event, handleActivity);
    });

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, []);

  const handleTabClick = (tabId: 'home' | 'batches' | 'practice' | 'ai' | 'profile') => {
    playSound('Toggle Tick');
    onChangeTab(tabId);
    resetTimer();
  };


  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-bounce">
        <button
          onClick={() => {
            playSound('UI Pop');
            setIsCollapsed(false);
            resetTimer();
          }}
          className="px-5 py-2.5 bg-zinc-950/95 backdrop-blur-md border border-zinc-800 text-yellow-400 hover:text-white rounded-full flex items-center gap-2 shadow-2xl text-xs font-bold transition cursor-pointer"
        >
          <ChevronUp className="w-4 h-4 animate-pulse" />
          <span>{appLanguage === 'hi' ? 'नेविगेशन दिखाएं' : 'Show Navigation'}</span>
        </button>
      </div>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-zinc-850 z-40 shadow-2xl transition-all duration-300 safe-pb">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-red-950/60 border-b border-red-900/60 text-red-400 py-1 px-3 text-[10px] font-mono font-semibold tracking-wider flex items-center justify-center gap-1.5 text-center">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse shrink-0" />
          <span>{appLanguage === 'hi' ? 'ऑफ़लाइन-प्रथम मोड सक्रिय — स्थानीय डेटाबेस उपयोग में है' : 'OFFLINE MODE ACTIVE — LOCAL STORAGE SYNCED'}</span>
        </div>
      )}

      <div className="max-w-xl mx-auto flex justify-around items-center h-16 px-2 sm:px-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 select-none transition-all cursor-pointer relative group"
            >
              <div
                className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'text-white scale-105'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className="w-5.5 h-5.5" />
              </div>

              {/* Dot Indicator for Active Tab */}
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 bg-white rounded-full animate-pulse" />
              )}

              {/* Label */}
              <span
                className={`text-[9px] font-bold tracking-tight mt-0.5 select-none transition-colors ${
                  isActive ? 'text-white font-extrabold' : 'text-zinc-500 font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
