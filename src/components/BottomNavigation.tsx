import React from 'react';
import { Home, Bookmark, BookOpen, Brain, User, ShieldAlert } from 'lucide-react';

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
  interface TabItem {
    id: 'home' | 'batches' | 'practice' | 'ai' | 'profile';
    label: string;
    icon: React.ComponentType<any>;
    isAccent?: boolean;
  }
  const tabs: TabItem[] = [
    { id: 'home', label: appLanguage === 'hi' ? 'होम' : 'Home', icon: Home },
    { id: 'batches', label: appLanguage === 'hi' ? 'बैच' : 'Batches', icon: BookOpen },
    { id: 'practice', label: appLanguage === 'hi' ? 'अभ्यास' : 'Practice', icon: Bookmark },
    { id: 'ai', label: 'Bharat AI', icon: Brain, isAccent: true },
    { id: 'profile', label: appLanguage === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-zinc-900 z-40 pb-safe shadow-2xl">
      {/* Offline Alert Strip */}
      {!isOnline && (
        <div className="bg-red-950/40 border-b border-red-900/60 text-red-400 py-1 text-[10px] font-mono font-semibold tracking-wider flex items-center justify-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 animate-pulse" />
          <span>{appLanguage === 'hi' ? 'ऑफ़लाइन-प्रथम मोड सक्रिय — स्थानीय डेटाबेस उपयोग में है' : 'OFFLINE-FIRST MODE ACTIVE — LOCAL DATABASE IN USE'}</span>
        </div>
      )}

      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full py-2 select-none transition-all cursor-pointer relative group"
            >
              <div
                className={`flex items-center justify-center rounded-xl transition-all duration-300 ${
                  tab.isAccent
                    ? isActive
                      ? 'bg-white text-black p-2.5 scale-110 shadow-lg'
                      : 'bg-zinc-900 text-yellow-400 p-2 hover:bg-zinc-850 hover:scale-105'
                    : isActive
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                <Icon className={`${tab.isAccent ? 'w-5 h-5' : 'w-5.5 h-5.5'}`} />
              </div>

              {/* Dot Indicator for Regular Tabs */}
              {!tab.isAccent && isActive && (
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
