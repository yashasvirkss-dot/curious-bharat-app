import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Flame, 
  Award, 
  Brain, 
  Sparkles, 
  RotateCcw,
  Sliders,
  CheckCircle,
  TrendingUp,
  Atom,
  Lightbulb,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  User,
  Key,
  Coins,
  List,
  Grid,
  Menu,
  BookOpen,
  Bookmark,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { defaultCourses, defaultCustomization } from './data/defaultCourses';
import { UserProgress, Chapter, Course, AppCustomization, StudentAnalysisRecord, OwnerProfile } from './types';
import Dashboard from './components/Dashboard';
import ChapterView from './components/ChapterView';
import QuizView from './components/QuizView';
import FlashcardsView from './components/FlashcardsView';
import AIAssistant from './components/AIAssistant';
import AdminPortal from './components/AdminPortal';
import BottomNavigation from './components/BottomNavigation';
import BatchesTab from './components/BatchesTab';
import PracticeTab from './components/PracticeTab';
import ProfileHub from './components/ProfileHub';
import OnboardingWizard from './components/OnboardingWizard';
import { playSound } from './utils/audio';

const INITIAL_PROGRESS: UserProgress = {
  completedChapters: [],
  quizScores: {},
  flashcardStatus: {},
  streak: 1,
  lastActiveDate: new Date().toDateString(),
  totalXP: 0, // starts from 0 for fresh scholars
  aiDoubtsAsked: 0,
  purchasedCourses: [],
  onboarded: false
};

const INITIAL_OWNER_PROFILE: OwnerProfile = {
  name: 'Alok Roy Sir',
  email: 'rst010186@gmail.com',
  contact: '+91 98765 43210',
  storageDestination: 'google-drive',
  googleStorageEmail: 'rst010186@gmail.com',
  googleDriveFolderId: 'bharat-ai-vault-101',
  upiId: 'rst010186@paytm',
  allowDownloads: true,
  instituteName: 'Bharat Science Academy',
  avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
};

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'chapter-study' | 'chapter-quiz' | 'chapter-flashcards' | 'admin'>('dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'batches' | 'practice' | 'ai' | 'profile'>('home');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<UserProgress>(INITIAL_PROGRESS);
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(INITIAL_OWNER_PROFILE);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [preloadAIPrompt, setPreloadAIPrompt] = useState<{ mode: string; text: string } | undefined>(undefined);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [appLanguage, setAppLanguage] = useState<'en' | 'hi'>('en');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [showMenuDropdown, setShowMenuDropdown] = useState<boolean>(false);

  // Drilldown states lifted from Dashboard for device Back button reverse navigation
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChapterDashboard, setSelectedChapterDashboard] = useState<Chapter | null>(null);
  const [selectedTopicDashboard, setSelectedTopicDashboard] = useState<any | null>(null);
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('pref_view_style') as 'grid' | 'list') || 'grid';
  });

  // Track if we are navigating via popstate so we don't double-push history state
  const isPoppingRef = useRef(false);

  useEffect(() => {
    // Initial history state seed
    if (window.history.state === null) {
      window.history.replaceState({ tab: 'home', view: 'dashboard' }, '');
    }
  }, []);

  useEffect(() => {
    if (isPoppingRef.current) {
      isPoppingRef.current = false;
      return;
    }

    const isRoot = activeTab === 'home' && 
                   selectedCourse === null && 
                   selectedChapterDashboard === null && 
                   selectedTopicDashboard === null && 
                   currentView === 'dashboard';

    if (!isRoot) {
      window.history.pushState({ 
        activeTab, 
        currentView,
        hasCourse: selectedCourse !== null,
        hasChapter: selectedChapterDashboard !== null,
        hasTopic: selectedTopicDashboard !== null
      }, '');
    }
  }, [activeTab, selectedCourse, selectedChapterDashboard, selectedTopicDashboard, currentView]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      isPoppingRef.current = true;
      
      const isRoot = activeTab === 'home' && 
                     selectedCourse === null && 
                     selectedChapterDashboard === null && 
                     selectedTopicDashboard === null && 
                     currentView === 'dashboard';

      if (!isRoot) {
        // Reverse folder navigation step
        if (currentView !== 'dashboard') {
          setCurrentView('dashboard');
        } else if (selectedTopicDashboard !== null) {
          setSelectedTopicDashboard(null);
        } else if (selectedChapterDashboard !== null) {
          setSelectedChapterDashboard(null);
        } else if (selectedCourse !== null) {
          setSelectedCourse(null);
        } else if (activeTab !== 'home') {
          setActiveTab('home');
        }
        
        // Re-push state so back-interception remains active
        window.history.pushState({ 
          activeTab, 
          currentView,
          hasCourse: selectedCourse !== null,
          hasChapter: selectedChapterDashboard !== null,
          hasTopic: selectedTopicDashboard !== null
        }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [activeTab, selectedCourse, selectedChapterDashboard, selectedTopicDashboard, currentView]);

  // Sync and load theme settings
  useEffect(() => {
    const savedTheme = localStorage.getItem('pref_theme');
    if (savedTheme === 'light') {
      setIsDarkMode(false);
      document.body.classList.add('light');
    } else {
      setIsDarkMode(true);
      document.body.classList.remove('light');
    }
  }, []);

  const handleDarkModeChange = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      localStorage.setItem('pref_theme', 'dark');
      document.body.classList.remove('light');
    } else {
      localStorage.setItem('pref_theme', 'light');
      document.body.classList.add('light');
    }
  };

  // Load language preference
  useEffect(() => {
    const savedLang = localStorage.getItem('pref_app_language');
    if (savedLang === 'hi' || savedLang === 'en') {
      setAppLanguage(savedLang as 'en' | 'hi');
    }
  }, []);

  const handleLanguageChange = (lang: 'en' | 'hi') => {
    setAppLanguage(lang);
    localStorage.setItem('pref_app_language', lang);
  };

  // Student Analysis Records
  const [studentAnalysisRecords, setStudentAnalysisRecords] = useState<StudentAnalysisRecord[]>([]);

  // Courses and Theme Customization State
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [customization, setCustomization] = useState<AppCustomization>(defaultCustomization);
  const [isLiveEditing, setIsLiveEditing] = useState<boolean>(false);

  // Admin login dialog states
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listeners for network status and diagnostic tests
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const handleAddAnalysis = (e: Event) => {
      const rec = (e as CustomEvent).detail;
      handleAddStudentAnalysisRecord(rec);
    };
    window.addEventListener('curious_add_analysis', handleAddAnalysis);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('curious_add_analysis', handleAddAnalysis);
    };
  }, [studentAnalysisRecords]);

  // Load state on mount
  useEffect(() => {
    // 1. Progress
    const savedProgress = localStorage.getItem('curious_bharat_progress');
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        const today = new Date().toDateString();
        let currentStreak = parsed.streak || 1;
        
        if (parsed.lastActiveDate && parsed.lastActiveDate !== today) {
          const lastActive = new Date(parsed.lastActiveDate);
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastActive.toDateString() === yesterday.toDateString()) {
            currentStreak += 1;
          } else if (lastActive.toDateString() !== today) {
            currentStreak = 1;
          }
        }
        
        setProgress({
          ...parsed,
          streak: currentStreak,
          lastActiveDate: today
        });
      } catch (err) {
        console.error('Error loading progress:', err);
      }
    }

    // 2. Courses configuration
    const savedCourses = localStorage.getItem('curious_courses');
    if (savedCourses) {
      try {
        setCourses(JSON.parse(savedCourses));
      } catch (err) {
        console.error('Error loading courses:', err);
      }
    }

    // 3. App customization settings
    const savedCustom = localStorage.getItem('curious_customization');
    if (savedCustom) {
      try {
        const parsed = JSON.parse(savedCustom);
        if (parsed.elementOrdering && !parsed.elementOrdering.includes('games')) {
          const insertIdx = parsed.elementOrdering.indexOf('courses');
          if (insertIdx !== -1) {
            parsed.elementOrdering.splice(insertIdx + 1, 0, 'games');
          } else {
            parsed.elementOrdering.push('games');
          }
        }
        setCustomization(parsed);
      } catch (err) {
        console.error('Error loading custom settings:', err);
      }
    }

    // 4. Student Analysis records
    const savedAnalysis = localStorage.getItem('curious_student_analysis');
    if (savedAnalysis) {
      try {
        setStudentAnalysisRecords(JSON.parse(savedAnalysis));
      } catch (err) {
        console.error('Error loading student analysis:', err);
      }
    }

    // 5. Owner Profile
    const savedOwner = localStorage.getItem('curious_owner_profile');
    if (savedOwner) {
      try {
        setOwnerProfile(JSON.parse(savedOwner));
      } catch (err) {
        console.error('Error loading owner profile:', err);
      }
    }
  }, []);

  const handleUpdateOwnerProfile = (newProfile: OwnerProfile) => {
    setOwnerProfile(newProfile);
    localStorage.setItem('curious_owner_profile', JSON.stringify(newProfile));
  };

  const handleAddStudentAnalysisRecord = (record: StudentAnalysisRecord) => {
    const updated = [record, ...studentAnalysisRecords];
    setStudentAnalysisRecords(updated);
    localStorage.setItem('curious_student_analysis', JSON.stringify(updated));
  };

  const handleUpdateStudentAnalysisRecords = (records: StudentAnalysisRecord[]) => {
    setStudentAnalysisRecords(records);
    localStorage.setItem('curious_student_analysis', JSON.stringify(records));
  };

  const saveProgressState = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('curious_bharat_progress', JSON.stringify(newProgress));
  };

  const handleOnboardingComplete = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('curious_bharat_progress', JSON.stringify(newProgress));
  };

  const handleUpdateCourses = (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('curious_courses', JSON.stringify(newCourses));
  };

  const handleUpdateCustomization = (newCustom: AppCustomization) => {
    setCustomization(newCustom);
    localStorage.setItem('curious_customization', JSON.stringify(newCustom));
  };

  const handleCompleteChapter = (chapterId: string) => {
    if (progress.completedChapters.includes(chapterId)) return;
    const newProgress: UserProgress = {
      ...progress,
      completedChapters: [...progress.completedChapters, chapterId],
      totalXP: progress.totalXP + 100,
      lastActiveDate: new Date().toDateString()
    };
    saveProgressState(newProgress);
  };

  const handleCompleteQuiz = (scorePct: number) => {
    if (!selectedChapter) return;
    
    const existing = progress.quizScores[selectedChapter.id];
    const highscore = existing ? Math.max(existing.highscore, scorePct) : scorePct;
    const attempts = existing ? existing.attempts + 1 : 1;

    let rewardXP = scorePct;
    if (scorePct === 100) rewardXP += 50;

    const newProgress: UserProgress = {
      ...progress,
      quizScores: {
        ...progress.quizScores,
        [selectedChapter.id]: { highscore, attempts }
      },
      totalXP: progress.totalXP + rewardXP,
      lastActiveDate: new Date().toDateString()
    };
    saveProgressState(newProgress);
  };

  const handleRateCard = (cardId: string, rating: 'easy' | 'medium' | 'hard') => {
    const existingStatus = progress.flashcardStatus[cardId];
    let xpBonus = 0;
    if (rating === 'easy' && existingStatus !== 'easy') {
      xpBonus = 15;
    }

    const newProgress: UserProgress = {
      ...progress,
      flashcardStatus: {
        ...progress.flashcardStatus,
        [cardId]: rating
      },
      totalXP: progress.totalXP + xpBonus,
      lastActiveDate: new Date().toDateString()
    };
    saveProgressState(newProgress);
  };

  const handleIncrementDoubts = () => {
    const newProgress: UserProgress = {
      ...progress,
      aiDoubtsAsked: progress.aiDoubtsAsked + 1,
      totalXP: progress.totalXP + 5,
      lastActiveDate: new Date().toDateString()
    };
    saveProgressState(newProgress);
  };

  const handleResetProgress = () => {
    if (window.confirm('Are you sure you want to reset your studies, streak, and Coins score?')) {
      saveProgressState(INITIAL_PROGRESS);
      setCurrentView('dashboard');
      setSelectedChapter(null);
    }
  };

  const handleOpenAIWithPrompt = (mode: string, context: string, customPrompt?: string) => {
    setPreloadAIPrompt({
      mode,
      text: customPrompt || `Let's discuss "${context}" in depth.`
    });
    setCurrentView('dashboard');
    setActiveTab('ai');
    setIsAIOpen(true);
  };

  const handleClearPreload = () => {
    setPreloadAIPrompt(undefined);
  };

  // Credentials Verification
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminUsername.trim() === 'Priyanshu' && adminPassword === 'Curious Bharat') {
      setIsLoggedInAdmin(true);
      setShowAdminLoginModal(false);
      setLoginError(null);
      setCurrentView('admin');
      setAdminUsername('');
      setAdminPassword('');
    } else {
      setLoginError('Invalid educator username or password. Please try again.');
    }
  };

  const getLogoIconComponent = (iconName?: string) => {
    switch (iconName) {
      case 'atom': return <Atom className="w-5 h-5 text-white" />;
      case 'brain': return <Brain className="w-5 h-5 text-white" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-yellow-400 fill-yellow-400/20" />;
      case 'lightbulb': return <Lightbulb className="w-5 h-5 text-white" />;
      default: return <GraduationCap className="w-5 h-5 text-white" />;
    }
  };

  // Styling helper classes derived from AppCustomization state
  const fontClass = customization.fontStyle === 'mono' 
    ? 'font-mono' 
    : customization.fontStyle === 'serif' 
    ? 'font-serif' 
    : 'font-sans';

  const shapeClass = customization.borderRadius === 'none'
    ? 'rounded-none'
    : customization.borderRadius === 'md'
    ? 'rounded-lg'
    : 'rounded-2xl';

  return (
    <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? 'bg-[#05070a] text-slate-100' : 'bg-slate-50 text-slate-900'} flex flex-col selection:bg-zinc-850 selection:text-white ${fontClass}`}>
      
      {/* Immersive Atmospheric Background Glows */}
      {isDarkMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#ff993315] rounded-full blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-[#13880810] rounded-full blur-[120px]" />
        </div>
      )}
      
      {/* Header bar styled in crisp monochrome with Indian Tricolor grading line */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
        {/* Tricolor flag color grading line */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-80" />
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand logo */}
          <div 
            onClick={() => {
              if (currentView !== 'admin') {
                setCurrentView('dashboard');
                setSelectedChapter(null);
              }
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white font-sans font-bold shadow group-hover:bg-zinc-850 transition overflow-hidden">
              {customization.appLogoUrl ? (
                <img src={customization.appLogoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                getLogoIconComponent(customization.appLogoIcon)
              )}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-sans font-extrabold tracking-tight text-white transition-colors">
                  {customization.brandingTitle}
                </h1>
                <span className="text-[9px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded font-mono font-bold">
                  {customization.appLogoText || 'CB'}
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold font-mono">
                {customization.brandingSubtitle}
              </span>
            </div>
          </div>

          {/* Quick study widgets */}
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* List icon menu dropdown feature */}
            <div className="relative">
              <button
                onClick={() => {
                  playSound('click');
                  setShowMenuDropdown(!showMenuDropdown);
                }}
                title={appLanguage === 'hi' ? 'नेविगेशन सूची' : 'Navigation Dropdown Menu'}
                className={`p-2 border rounded-xl cursor-pointer active:scale-95 transition ${
                  showMenuDropdown
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-500 hover:text-white'
                }`}
                id="header-btn-navlist"
              >
                <List className="w-4 h-4" />
              </button>

              <AnimatePresence>
                {showMenuDropdown && (
                  <>
                    {/* Invisible backdrop to close the dropdown */}
                    <div 
                      className="fixed inset-0 z-40 cursor-default" 
                      onClick={() => setShowMenuDropdown(false)} 
                    />
                    
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2.5 w-48 z-50 rounded-2xl border bg-black/95 backdrop-blur-md border-zinc-900 p-2 shadow-2xl space-y-1 text-xs text-zinc-300 font-sans"
                    >
                      <div className="px-2.5 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-extrabold border-b border-zinc-900">
                        {appLanguage === 'hi' ? 'त्वरित नेविगेशन' : 'QUICK NAVIGATION'}
                      </div>
                      
                      <button
                        onClick={() => {
                          playSound('click');
                          setActiveTab('home');
                          setCurrentView('dashboard');
                          setSelectedCourse(null);
                          setSelectedChapterDashboard(null);
                          setSelectedTopicDashboard(null);
                          setShowMenuDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer text-left ${
                          activeTab === 'home' && !selectedCourse
                            ? 'bg-zinc-900 text-white font-extrabold'
                            : 'hover:bg-zinc-900/60 hover:text-white'
                        }`}
                      >
                        <Home className="w-4 h-4 text-zinc-400" />
                        <span>{appLanguage === 'hi' ? 'होम' : 'Home'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound('click');
                          setActiveTab('batches');
                          setCurrentView('dashboard');
                          setShowMenuDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer text-left ${
                          activeTab === 'batches'
                            ? 'bg-zinc-900 text-white font-extrabold'
                            : 'hover:bg-zinc-900/60 hover:text-white'
                        }`}
                      >
                        <BookOpen className="w-4 h-4 text-zinc-400" />
                        <span>{appLanguage === 'hi' ? 'बैच' : 'Batches'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound('click');
                          setActiveTab('practice');
                          setCurrentView('dashboard');
                          setShowMenuDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer text-left ${
                          activeTab === 'practice'
                            ? 'bg-zinc-900 text-white font-extrabold'
                            : 'hover:bg-zinc-900/60 hover:text-white'
                        }`}
                      >
                        <Bookmark className="w-4 h-4 text-zinc-400" />
                        <span>{appLanguage === 'hi' ? 'अभ्यास' : 'Practice'}</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound('click');
                          setActiveTab('ai');
                          setCurrentView('dashboard');
                          setShowMenuDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer text-left ${
                          activeTab === 'ai'
                            ? 'bg-zinc-900 text-white font-extrabold'
                            : 'hover:bg-zinc-900/60 hover:text-white'
                        }`}
                      >
                        <Brain className="w-4 h-4 text-yellow-400" />
                        <span>Bharat AI</span>
                      </button>

                      <button
                        onClick={() => {
                          playSound('click');
                          setActiveTab('profile');
                          setCurrentView('dashboard');
                          setShowMenuDropdown(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer text-left ${
                          activeTab === 'profile'
                            ? 'bg-zinc-900 text-white font-extrabold'
                            : 'hover:bg-zinc-900/60 hover:text-white'
                        }`}
                      >
                        <User className="w-4 h-4 text-zinc-400" />
                        <span>{appLanguage === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
                      </button>
                      <button
                        onClick={() => {
                          playSound('click');
                          setShowMenuDropdown(false);
                          if (isLoggedInAdmin) {
                            setCurrentView(currentView === 'admin' ? 'dashboard' : 'admin');
                          } else {
                            setShowAdminLoginModal(true);
                          }
                        }}
                        className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl transition cursor-pointer text-left hover:bg-zinc-900/60 hover:text-white border-t border-zinc-900/80 mt-1 pt-2"
                      >
                        <Lock className="w-4 h-4 text-zinc-500" />
                        <span>{isLoggedInAdmin ? (appLanguage === 'hi' ? 'शिक्षक पैनल' : 'Educator Panel') : (appLanguage === 'hi' ? 'शिक्षक लॉगिन' : 'Educator Login')}</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </header>

      {/* Main Container Area - flat, dynamic, and fully focused for maximum readability */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8 relative">
        <div 
          style={{
            transform: 'none',
            transition: 'transform 0.15s ease-out'
          }}
          className="w-full h-full"
        >
          <AnimatePresence mode="wait">
            
            {/* Main Router */}
            {currentView === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'home' && (
                <Dashboard 
                  courses={courses}
                  progress={progress}
                  customization={customization}
                  isEditMode={isLiveEditing}
                  onUpdateCourses={handleUpdateCourses}
                  onUpdateProgress={saveProgressState}
                  onSelectChapter={(chapter) => {
                    setSelectedChapter(chapter);
                    setCurrentView('chapter-study');
                  }}
                  onOpenAI={handleOpenAIWithPrompt}
                  onAddStudentAnalysisRecord={handleAddStudentAnalysisRecord}
                  studentAnalysisRecords={studentAnalysisRecords}
                  appLanguage={appLanguage}
                  selectedCourse={selectedCourse}
                  setSelectedCourse={setSelectedCourse}
                  selectedChapter={selectedChapterDashboard}
                  setSelectedChapter={setSelectedChapterDashboard}
                  selectedTopic={selectedTopicDashboard}
                  setSelectedTopic={setSelectedTopicDashboard}
                  viewStyle={viewStyle}
                  isDarkMode={isDarkMode}
                />
              )}

              {activeTab === 'batches' && (
                <BatchesTab
                  courses={courses}
                  progress={progress}
                  onUpdateProgress={saveProgressState}
                  onSelectChapter={(chapter) => {
                    setSelectedChapter(chapter);
                    setCurrentView('chapter-study');
                  }}
                  studentAnalysisRecords={studentAnalysisRecords}
                  onAddStudentAnalysisRecord={handleAddStudentAnalysisRecord}
                  appLanguage={appLanguage}
                  ownerProfile={ownerProfile}
                />
              )}

              {activeTab === 'practice' && (
                <PracticeTab
                  progress={progress}
                  onUpdateProgress={saveProgressState}
                  studentName={progress.studentName || 'Curious Scholar'}
                  appLanguage={appLanguage}
                />
              )}

              {activeTab === 'ai' && (
                <div className={`w-full h-[760px] flex flex-col overflow-hidden animate-fadeIn border-t ${
                  isDarkMode 
                    ? 'bg-black border-zinc-900 text-white' 
                    : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}>
                  <AIAssistant
                    currentChapterTitle={selectedChapter?.title}
                    isOpen={true}
                    onClose={() => {}}
                    preloadedPrompt={preloadAIPrompt}
                    onClearPreload={handleClearPreload}
                    onIncrementDoubtsAsked={handleIncrementDoubts}
                    appLanguage={appLanguage}
                    inline={true}
                    isDarkMode={isDarkMode}
                    progress={progress}
                    onUpdateProgress={saveProgressState}
                  />
                </div>
              )}

              {activeTab === 'profile' && (
                <ProfileHub
                  progress={progress}
                  onUpdateProgress={saveProgressState}
                  studentAnalysisRecords={studentAnalysisRecords}
                  onAddStudentAnalysisRecord={handleAddStudentAnalysisRecord}
                  onLogoutAdmin={() => setIsLoggedInAdmin(false)}
                  isLoggedInAdmin={isLoggedInAdmin}
                  courses={courses}
                  appLanguage={appLanguage}
                  onLanguageChange={handleLanguageChange}
                  isDarkMode={isDarkMode}
                  onDarkModeChange={handleDarkModeChange}
                />
              )}
            </motion.div>
          )}

          {currentView === 'chapter-study' && selectedChapter && (
            <motion.div
              key="chapter-study"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChapterView 
                chapter={selectedChapter}
                progress={progress}
                isEditMode={isLiveEditing}
                onUpdateChapter={(updatedChap) => {
                  const updatedCourses = courses.map(c => {
                    if (c.chapters.some(ch => ch.id === updatedChap.id)) {
                      return {
                        ...c,
                        chapters: c.chapters.map(ch => ch.id === updatedChap.id ? updatedChap : ch)
                      };
                    }
                    return c;
                  });
                  handleUpdateCourses(updatedCourses);
                  setSelectedChapter(updatedChap);
                }}
                onBack={() => {
                  setCurrentView('dashboard');
                  setSelectedChapter(null);
                }}
                onComplete={handleCompleteChapter}
                onOpenAI={handleOpenAIWithPrompt}
                onStartQuiz={() => setCurrentView('chapter-quiz')}
                onStartFlashcards={() => setCurrentView('chapter-flashcards')}
                ownerProfile={ownerProfile}
                onUpdateProgress={saveProgressState}
              />
            </motion.div>
          )}

          {currentView === 'chapter-quiz' && selectedChapter && (
            <motion.div
              key="chapter-quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <QuizView 
                chapter={selectedChapter}
                onBack={() => setCurrentView('chapter-study')}
                onCompleteQuiz={handleCompleteQuiz}
                onOpenAI={handleOpenAIWithPrompt}
              />
            </motion.div>
          )}

          {currentView === 'chapter-flashcards' && selectedChapter && (
            <motion.div
              key="chapter-flashcards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FlashcardsView 
                chapter={selectedChapter}
                progress={progress}
                onBack={() => setCurrentView('chapter-study')}
                onRateCard={handleRateCard}
                onOpenAI={handleOpenAIWithPrompt}
              />
            </motion.div>
          )}

          {currentView === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AdminPortal 
                courses={courses}
                onUpdateCourses={handleUpdateCourses}
                customization={customization}
                onUpdateCustomization={handleUpdateCustomization}
                isLiveEditing={isLiveEditing}
                onToggleLiveEditing={() => setIsLiveEditing(!isLiveEditing)}
                onClose={() => setCurrentView('dashboard')}
                studentAnalysisRecords={studentAnalysisRecords}
                onUpdateStudentAnalysisRecords={handleUpdateStudentAnalysisRecords}
                progress={progress}
                onUpdateProgress={saveProgressState}
                ownerProfile={ownerProfile}
                onUpdateOwnerProfile={handleUpdateOwnerProfile}
              />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>

      {/* Secret Educator Authentication Modal */}
      <AnimatePresence>
        {showAdminLoginModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-sm rounded-2xl p-6 space-y-4 shadow-2xl text-zinc-300"
            >
              <div className="space-y-1.5 text-center">
                <div className="w-10 h-10 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-white">
                  <Lock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Educator Control Login</h3>
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Access the Bharat control room layout adjustments, link files, and courses.
                </p>
              </div>

              <form onSubmit={handleAdminLogin} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-zinc-500 block">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      placeholder="e.g. educator"
                      value={adminUsername}
                      onChange={(e) => setAdminUsername(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-zinc-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-semibold uppercase text-zinc-500 block">Password</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="password"
                      placeholder="e.g. rio"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2 pl-9 pr-3 text-xs text-white outline-none focus:border-zinc-500"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <p className="text-[10px] text-zinc-400 text-center font-medium leading-relaxed bg-zinc-900/60 p-2 border border-zinc-850 rounded-lg">
                    {loginError}
                  </p>
                )}

                <div className="flex gap-2 pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLoginModal(false);
                      setLoginError(null);
                    }}
                    className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl text-xs font-semibold cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl cursor-pointer transition"
                  >
                    Authenticate
                  </button>
                </div>
              </form>

              <div className="border-t border-zinc-900 pt-3 text-center text-[10px] text-zinc-500 leading-normal">
                <p>Default Educator Credentials:</p>
                <p className="font-mono text-zinc-400 mt-0.5">Username: <span className="font-bold">Priyanshu</span> | Password: <span className="font-bold">Curious Bharat</span></p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer bar with padding to avoid bottom-navigation overlap on mobile */}
      <footer className="mt-auto border-t border-zinc-900 bg-black pt-6 pb-24 px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-[11px] text-zinc-600 font-medium max-w-7xl w-full mx-auto">
        <p>© 2026 Curious Bharat. Crafted with modern, premium educational values. Jai Hind! 🇮🇳</p>
        <button
          onClick={() => {
            if (isLoggedInAdmin) {
              setCurrentView('admin');
            } else {
              setShowAdminLoginModal(true);
            }
          }}
          className="text-zinc-500 hover:text-white transition font-bold flex items-center gap-1 cursor-pointer"
        >
          🔒 Educator Control Desk login
        </button>
      </footer>

      {/* Bottom Mobile-first Navigation Bar */}
      {currentView !== 'admin' && (
        <BottomNavigation 
          activeTab={activeTab}
          onChangeTab={(tab) => {
            setActiveTab(tab);
            setCurrentView('dashboard');
          }}
          isOnline={isOnline}
          appLanguage={appLanguage}
        />
      )}

      {!progress.onboarded && (
        <OnboardingWizard 
          onComplete={handleOnboardingComplete} 
          isDarkMode={isDarkMode} 
        />
      )}

    </div>
  );
}
