import React, { useState, useEffect, useRef } from 'react';
import { Home, Bookmark, BookOpen, User, ShieldAlert, ChevronUp } from 'lucide-react';
import { playSound } from '../utils/audio';
import { isFeatureEnabled } from '../utils/featureFlags';

interface BottomNavigationProps {
  activeTab: 'home' | 'batches' | 'practice' | 'profile';
  onChangeTab: (tab: 'home' | 'batches' | 'practice' | 'profile') => void;
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
    id: 'home' | 'batches' | 'practice' | 'profile';
    label: string;
    icon: React.ComponentType<any>;
    featureKey?: string;
  }

  const allTabs: TabItem[] = [
    { id: 'home', label: appLanguage === 'hi' ? 'होम' : 'Home', icon: Home },
    { id: 'batches', label: appLanguage === 'hi' ? 'बैच' : 'Batches', icon: BookOpen, featureKey: 'batches_tab_enabled' },
    { id: 'practice', label: appLanguage === 'hi' ? 'अभ्यास' : 'Practice', icon: Bookmark, featureKey: 'practice_tab_enabled' },
    { id: 'profile', label: appLanguage === 'hi' ? 'प्रोफ़ाइल' : 'Profile', icon: User, featureKey: 'profile_hub_enabled' }
  ];

  const tabs = allTabs.filter(tab => !tab.featureKey || isFeatureEnabled(tab.featureKey));

  const handleTabClick = (tabId: 'home' | 'batches' | 'practice' | 'profile') => {
    playSound('Toggle Tick');
    onChangeTab(tabId);
  };


  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-zinc-850 z-40 shadow-2xl transition-all duration-300 safe-pb">
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
