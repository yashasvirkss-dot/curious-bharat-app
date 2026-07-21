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
  Home,
  CreditCard,
  X,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Mic
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
import ThreeDElement from './components/ThreeDElement';
import AshokChakra from './components/AshokChakra';
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

// Apply theme immediately on initial execution to prevent light-theme flash
if (typeof window !== 'undefined') {
  const savedTheme = localStorage.getItem('pref_theme') || 'dark';
  if (savedTheme === 'dark') {
    document.body.classList.add('dark');
    document.body.classList.remove('light');
  } else {
    document.body.classList.add('light');
    document.body.classList.remove('dark');
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<'dashboard' | 'chapter-study' | 'chapter-quiz' | 'chapter-flashcards' | 'admin'>('dashboard');
  const [activeTab, setActiveTab] = useState<'home' | 'batches' | 'practice' | 'ai' | 'profile'>('home');
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [progress, setProgress] = useState<UserProgress>(() => {
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
        return {
          ...parsed,
          streak: currentStreak,
          lastActiveDate: today
        };
      } catch (err) {
        console.error('Error loading progress:', err);
      }
    }
    return INITIAL_PROGRESS;
  });
  const [ownerProfile, setOwnerProfile] = useState<OwnerProfile>(INITIAL_OWNER_PROFILE);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);
  const [preloadAIPrompt, setPreloadAIPrompt] = useState<{ mode: string; text: string } | undefined>(undefined);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [appLanguage, setAppLanguage] = useState<'en' | 'hi'>(() => {
    const savedLang = localStorage.getItem('pref_app_language');
    if (savedLang === 'hi' || savedLang === 'en') {
      return savedLang as 'en' | 'hi';
    }
    return 'en';
  });
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const savedTheme = localStorage.getItem('pref_theme') || 'dark';
    return savedTheme === 'dark';
  });
  const [showMenuDropdown, setShowMenuDropdown] = useState<boolean>(false);
  const [menuTimer, setMenuTimer] = useState<number>(20);

  // Auto close quick nav if inactive for 20 seconds
  useEffect(() => {
    if (!showMenuDropdown) {
      setMenuTimer(20);
      return;
    }

    setMenuTimer(20);
    const interval = setInterval(() => {
      setMenuTimer((prev) => {
        if (prev <= 1) {
          setShowMenuDropdown(false);
          return 20;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [showMenuDropdown]);

  // Drilldown states lifted from Dashboard for device Back button reverse navigation
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChapterDashboard, setSelectedChapterDashboard] = useState<Chapter | null>(null);
  const [selectedTopicDashboard, setSelectedTopicDashboard] = useState<any | null>(null);
  const [viewStyle, setViewStyle] = useState<'grid' | 'list'>(() => {
    return (localStorage.getItem('pref_view_style') as 'grid' | 'list') || 'grid';
  });

  // Global Checkout Modal State
  const [globalCheckoutCourse, setGlobalCheckoutCourse] = useState<Course | null>(null);
  const [checkoutStudentName, setCheckoutStudentName] = useState('');
  const [checkoutStudentEmail, setCheckoutStudentEmail] = useState('');
  const [checkoutStudentPhone, setCheckoutStudentPhone] = useState('');
  const [checkoutTransactionId, setCheckoutTransactionId] = useState('');
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
  const [checkoutNameError, setCheckoutNameError] = useState('');
  const [checkoutEmailError, setCheckoutEmailError] = useState('');
  const [checkoutPhoneError, setCheckoutPhoneError] = useState('');
  const [checkoutTxError, setCheckoutTxError] = useState('');

  const handleOpenCheckout = (course: Course) => {
    playSound('click');
    setGlobalCheckoutCourse(course);
    setCheckoutStudentName(progress.studentName || '');
    setCheckoutStudentEmail('');
    setCheckoutStudentPhone('');
    setCheckoutTransactionId('');
    setCheckoutNameError('');
    setCheckoutEmailError('');
    setCheckoutPhoneError('');
    setCheckoutTxError('');
  };

  const handleConfirmCheckout = () => {
    if (!globalCheckoutCourse) return;
    
    let hasError = false;
    if (!checkoutStudentName.trim()) {
      setCheckoutNameError('Please enter the student\'s full name.');
      hasError = true;
    }
    if (!checkoutStudentEmail.trim() || !checkoutStudentEmail.includes('@')) {
      setCheckoutEmailError('Please enter a valid email address.');
      hasError = true;
    }
    if (!checkoutStudentPhone.trim() || checkoutStudentPhone.trim().length < 8) {
      setCheckoutPhoneError('Please enter a valid contact number.');
      hasError = true;
    }
    if (!checkoutTransactionId.trim()) {
      setCheckoutTxError('Please enter the 12-digit transaction number.');
      hasError = true;
    } else if (checkoutTransactionId.trim().length < 6) {
      setCheckoutTxError('The entered transaction number must be at least 6 characters.');
      hasError = true;
    }

    if (hasError) return;

    setIsCheckoutProcessing(true);
    setTimeout(() => {
      // Create student analysis record for owner verification
      const newRecord: StudentAnalysisRecord = {
        id: `analysis-${Date.now()}`,
        studentName: checkoutStudentName.trim(),
        contactDetails: `Email: ${checkoutStudentEmail.trim()} | Phone: ${checkoutStudentPhone.trim()}`,
        courseId: globalCheckoutCourse.id,
        courseTitle: globalCheckoutCourse.title,
        price: globalCheckoutCourse.price,
        paymentDetails: checkoutTransactionId.trim(),
        purchasedAt: new Date().toLocaleString(),
        status: 'pending' // Send to owner portal and do not unlock
      };

      handleAddStudentAnalysisRecord(newRecord);
      
      setIsCheckoutProcessing(false);
      setGlobalCheckoutCourse(null);
      alert(appLanguage === 'hi' 
        ? 'भुगतान विवरण सफलतापूर्वक जमा! आपका बैच सत्यापन की प्रक्रिया में है। शिक्षक इसकी समीक्षा करेंगे और इसे जल्द ही अनलॉक करेंगे।'
        : 'Payment details submitted successfully! Your batch is now under verification. The educator will review and unlock it shortly.'
      );
    }, 1500);
  };

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
    const savedTheme = localStorage.getItem('pref_theme') || 'dark';
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      setIsDarkMode(false);
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    }
  }, []);

  const handleDarkModeChange = (dark: boolean) => {
    setIsDarkMode(dark);
    if (dark) {
      localStorage.setItem('pref_theme', 'dark');
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    } else {
      localStorage.setItem('pref_theme', 'light');
      document.body.classList.add('light');
      document.body.classList.remove('dark');
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

  // APK Version Update Popup States
  const [apkUpdateInfo, setApkUpdateInfo] = useState<{version: string, url: string, notes: string} | null>(null);
  const [showApkUpdateModal, setShowApkUpdateModal] = useState<boolean>(false);
  const [currentClientApkVersion, setCurrentClientApkVersion] = useState<string>(() => {
    return localStorage.getItem('curious_client_apk_version') || '1.0.0';
  });
  const [isDownloadingApk, setIsDownloadingApk] = useState<boolean>(false);
  const [apkDownloadPercent, setApkDownloadPercent] = useState<number>(0);

  useEffect(() => {
    const checkApkVersion = () => {
      fetch('/api/apk-version')
        .then(res => res.json())
        .then(data => {
          if (data && data.version) {
            if (data.version !== currentClientApkVersion) {
              setApkUpdateInfo(data);
              setShowApkUpdateModal(true);
            }
          }
        })
        .catch(err => console.error('Error checking APK version:', err));
    };

    checkApkVersion();
    const interval = setInterval(checkApkVersion, 10000);
    return () => clearInterval(interval);
  }, [currentClientApkVersion]);

  const handleUpdateApk = () => {
    if (!apkUpdateInfo) return;
    setIsDownloadingApk(true);
    setApkDownloadPercent(0);
    
    const interval = setInterval(() => {
      setApkDownloadPercent(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            localStorage.setItem('curious_client_apk_version', apkUpdateInfo.version);
            setCurrentClientApkVersion(apkUpdateInfo.version);
            setIsDownloadingApk(false);
            setShowApkUpdateModal(false);
            if (apkUpdateInfo.url) {
              window.location.href = apkUpdateInfo.url;
            }
          }, 600);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // Student Analysis Records
  const [studentAnalysisRecords, setStudentAnalysisRecords] = useState<StudentAnalysisRecord[]>([]);

  // Courses and Theme Customization State
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [customization, setCustomization] = useState<AppCustomization>(defaultCustomization);

  // Student Feedback modal state
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Admin login dialog states
  const [showAdminLoginModal, setShowAdminLoginModal] = useState<boolean>(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggedInAdmin, setIsLoggedInAdmin] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState(0);

  // Student Feedback & Feature Suggestions System
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Feature Suggestion');
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [isFeedbackRecording, setIsFeedbackRecording] = useState<boolean>(false);
  const [feedbacksList, setFeedbacksList] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('bharat_student_feedbacks');
      return saved ? JSON.parse(saved) : [
        {
          id: 'fb-init-1',
          category: 'Feature Suggestion',
          text: 'Sir, Class 10th Electricity me real-life curiosity-driven physical analogies badhaiye, thode tough numerical boards level questions add kijiye.',
          date: '2026-07-20T10:00:00.000Z',
          status: 'Under Active Review'
        }
      ];
    } catch {
      return [];
    }
  });

  const handleAddFeedback = (cat: string, text: string) => {
    const newFb = {
      id: `fb-${Date.now()}`,
      category: cat,
      text: text,
      date: new Date().toISOString(),
      status: 'Under Active Review'
    };
    const updated = [newFb, ...feedbacksList];
    setFeedbacksList(updated);
    localStorage.setItem('bharat_student_feedbacks', JSON.stringify(updated));
  };

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

  const lastSyncRef = useRef({ courses: 0, customization: 0, studentAnalysis: 0, ownerProfile: 0 });

  // Load state on mount and setup real-time polling to sync all devices instantly
  useEffect(() => {
    const bootstrapData = async () => {
      let serverVersions = { courses: 0, customization: 0, studentAnalysis: 0, ownerProfile: 0 };
      try {
        const syncRes = await fetch('/api/sync-version');
        if (syncRes.ok) {
          serverVersions = await syncRes.json();
          lastSyncRef.current = serverVersions;
        }
      } catch (err) {
        console.warn('Failed to get sync versions on mount:', err);
      }

      // Load courses from server
      try {
        const res = await fetch('/api/courses');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setCourses(data);
          } else {
            // Bootstrap server file system with defaults
            await fetch('/api/courses', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ courses: defaultCourses })
            });
            setCourses(defaultCourses);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch courses, loading local fallback:', err);
        const savedCourses = localStorage.getItem('curious_courses');
        if (savedCourses) setCourses(JSON.parse(savedCourses));
      }

      // Load customization from server
      try {
        const res = await fetch('/api/customization');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setCustomization(data);
          } else {
            await fetch('/api/customization', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ customization: defaultCustomization })
            });
            setCustomization(defaultCustomization);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch customization, loading local fallback:', err);
        const savedCustom = localStorage.getItem('curious_customization');
        if (savedCustom) setCustomization(JSON.parse(savedCustom));
      }

      // Load student analysis
      try {
        const res = await fetch('/api/student-analysis');
        if (res.ok) {
          let data = await res.json();
          if (!data || data.length === 0) {
            const defaultRecords: StudentAnalysisRecord[] = [
              {
                id: 'rec-1',
                studentName: 'Amit Sharma',
                contactDetails: 'amit.sharma99@gmail.com',
                courseId: 'course-optics-master',
                courseTitle: 'Optics: Masterclass Batch',
                price: '₹499',
                paymentDetails: 'UPI-7182930411',
                purchasedAt: new Date(Date.now() - 3600000 * 24).toLocaleString(),
                status: 'approved',
                diagnosticScore: 92,
                syllabusChaptersRead: 15,
                quizSubmissionsSolved: 135
              },
              {
                id: 'rec-2',
                studentName: 'Priya Patel',
                contactDetails: 'priya.patel.edu@yahoo.com',
                courseId: 'course-optics-master',
                courseTitle: 'Optics: Masterclass Batch',
                price: '₹499',
                paymentDetails: 'UPI-3928172948',
                purchasedAt: new Date(Date.now() - 3600000 * 12).toLocaleString(),
                status: 'approved',
                diagnosticScore: 78,
                syllabusChaptersRead: 9,
                quizSubmissionsSolved: 82
              },
              {
                id: 'rec-3',
                studentName: 'Karan Malhotra',
                contactDetails: '+91 98765 43210',
                courseId: 'course-optics-master',
                courseTitle: 'Optics: Masterclass Batch',
                price: '₹499',
                paymentDetails: 'UPI-1192837465',
                purchasedAt: new Date(Date.now() - 3600000 * 4).toLocaleString(),
                status: 'pending',
                diagnosticScore: 45,
                syllabusChaptersRead: 4,
                quizSubmissionsSolved: 28
              }
            ];
            await fetch('/api/student-analysis', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ studentAnalysisRecords: defaultRecords })
            });
            data = defaultRecords;
          }
          setStudentAnalysisRecords(data);
        }
      } catch (err) {
        console.warn('Failed to fetch student analysis, loading local fallback:', err);
        const savedAnalysis = localStorage.getItem('curious_student_analysis');
        if (savedAnalysis) setStudentAnalysisRecords(JSON.parse(savedAnalysis));
      }

      // Load owner profile
      try {
        const res = await fetch('/api/owner-profile');
        if (res.ok) {
          const data = await res.json();
          if (data) {
            setOwnerProfile(data);
          } else {
            await fetch('/api/owner-profile', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ownerProfile: INITIAL_OWNER_PROFILE })
            });
            setOwnerProfile(INITIAL_OWNER_PROFILE);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch owner profile, loading local fallback:', err);
        const savedOwner = localStorage.getItem('curious_owner_profile');
        if (savedOwner) setOwnerProfile(JSON.parse(savedOwner));
      }
    };

    bootstrapData();

    // Snappy background poll interval to synchronize modifications across student and educator screens immediately
    const intervalId = setInterval(async () => {
      try {
        const syncRes = await fetch('/api/sync-version');
        if (!syncRes.ok) return;
        const serverVersions = await syncRes.json();

        // Sync courses
        if (serverVersions.courses > lastSyncRef.current.courses) {
          const res = await fetch('/api/courses');
          if (res.ok) {
            const data = await res.json();
            if (data) setCourses(data);
          }
          lastSyncRef.current.courses = serverVersions.courses;
        }

        // Sync customization
        if (serverVersions.customization > lastSyncRef.current.customization) {
          const res = await fetch('/api/customization');
          if (res.ok) {
            const data = await res.json();
            if (data) setCustomization(data);
          }
          lastSyncRef.current.customization = serverVersions.customization;
        }

        // Sync student analysis records
        if (serverVersions.studentAnalysis > lastSyncRef.current.studentAnalysis) {
          const res = await fetch('/api/student-analysis');
          if (res.ok) {
            const data = await res.json();
            if (data) setStudentAnalysisRecords(data);
          }
          lastSyncRef.current.studentAnalysis = serverVersions.studentAnalysis;
        }

        // Sync owner profile
        if (serverVersions.ownerProfile > lastSyncRef.current.ownerProfile) {
          const res = await fetch('/api/owner-profile');
          if (res.ok) {
            const data = await res.json();
            if (data) setOwnerProfile(data);
          }
          lastSyncRef.current.ownerProfile = serverVersions.ownerProfile;
        }
      } catch (err) {
        // Silent background sync failsafe
      }
    }, 4000);

    return () => clearInterval(intervalId);
  }, []);

  const handleUpdateOwnerProfile = async (newProfile: OwnerProfile) => {
    setOwnerProfile(newProfile);
    localStorage.setItem('curious_owner_profile', JSON.stringify(newProfile));
    try {
      const res = await fetch('/api/owner-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerProfile: newProfile })
      });
      if (res.ok) {
        const data = await res.json();
        lastSyncRef.current.ownerProfile = data.version;
      }
    } catch (err) {
      console.error('Failed to sync owner profile to server:', err);
    }
  };

  const handleAddStudentAnalysisRecord = async (record: StudentAnalysisRecord) => {
    const updated = [record, ...studentAnalysisRecords];
    setStudentAnalysisRecords(updated);
    localStorage.setItem('curious_student_analysis', JSON.stringify(updated));
    try {
      const res = await fetch('/api/student-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnalysisRecords: updated })
      });
      if (res.ok) {
        const data = await res.json();
        lastSyncRef.current.studentAnalysis = data.version;
      }
    } catch (err) {
      console.error('Failed to sync student analysis to server:', err);
    }
  };

  const handleUpdateStudentAnalysisRecords = async (records: StudentAnalysisRecord[]) => {
    setStudentAnalysisRecords(records);
    localStorage.setItem('curious_student_analysis', JSON.stringify(records));
    try {
      const res = await fetch('/api/student-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnalysisRecords: records })
      });
      if (res.ok) {
        const data = await res.json();
        lastSyncRef.current.studentAnalysis = data.version;
      }
    } catch (err) {
      console.error('Failed to sync student analysis records to server:', err);
    }
  };

  const syncStudentProgressWithAnalysisRecords = (newProgress: UserProgress) => {
    const studentName = newProgress.studentName || 'Curious Scholar';
    const chaptersRead = newProgress.completedChapters?.length || 0;
    
    const quizAttempts = Object.values(newProgress.quizScores || {});
    const submissionsSolved = quizAttempts.reduce((sum, item) => sum + (item.attempts || 0), 0);
    
    const highscores = quizAttempts.map(item => item.highscore);
    const avgScore = highscores.length > 0 ? Math.round(highscores.reduce((sum, val) => sum + val, 0) / highscores.length) : 0;
    
    setStudentAnalysisRecords(prev => {
      let updated = [...prev];
      const studentRecords = updated.filter(r => r.studentName === studentName);
      
      if (studentRecords.length > 0) {
        updated = updated.map(r => {
          if (r.studentName === studentName) {
            return {
              ...r,
              diagnosticScore: avgScore || r.diagnosticScore || 0,
              syllabusChaptersRead: chaptersRead,
              quizSubmissionsSolved: submissionsSolved
            };
          }
          return r;
        });
      } else {
        const newRecord: StudentAnalysisRecord = {
          id: `analysis-auto-${Date.now()}`,
          studentName: studentName,
          contactDetails: newProgress.studentSchool ? `School: ${newProgress.studentSchool}` : 'Self-Enrolled Student',
          courseId: 'course-optics-master',
          courseTitle: 'Class 10 Optics & Vision Masterclass',
          price: 'Free',
          paymentDetails: 'Auto-Enrolled',
          purchasedAt: new Date().toLocaleString(),
          status: 'approved',
          diagnosticScore: avgScore,
          syllabusChaptersRead: chaptersRead,
          quizSubmissionsSolved: submissionsSolved
        };
        updated = [newRecord, ...updated];
      }
      
      // Post updated records to server-side persistence in real-time
      fetch('/api/student-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentAnalysisRecords: updated })
      }).then(async res => {
        if (res.ok) {
          const data = await res.json();
          lastSyncRef.current.studentAnalysis = data.version;
        }
      }).catch(err => console.error('Failed to sync progress with analysis:', err));
      
      localStorage.setItem('curious_student_analysis', JSON.stringify(updated));
      return updated;
    });
  };

  const saveProgressState = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('curious_bharat_progress', JSON.stringify(newProgress));
    syncStudentProgressWithAnalysisRecords(newProgress);
  };

  const handleOnboardingComplete = (newProgress: UserProgress) => {
    setProgress(newProgress);
    localStorage.setItem('curious_bharat_progress', JSON.stringify(newProgress));
    syncStudentProgressWithAnalysisRecords(newProgress);
  };

  const handleUpdateCourses = async (newCourses: Course[]) => {
    setCourses(newCourses);
    localStorage.setItem('curious_courses', JSON.stringify(newCourses));
    try {
      const res = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courses: newCourses })
      });
      if (res.ok) {
        const data = await res.json();
        lastSyncRef.current.courses = data.version;
      }
    } catch (err) {
      console.error('Failed to sync courses to server:', err);
    }
  };

  const handleUpdateCustomization = async (newCustom: AppCustomization) => {
    setCustomization(newCustom);
    localStorage.setItem('curious_customization', JSON.stringify(newCustom));
    try {
      const res = await fetch('/api/customization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customization: newCustom })
      });
      if (res.ok) {
        const data = await res.json();
        lastSyncRef.current.customization = data.version;
      }
    } catch (err) {
      console.error('Failed to sync customization to server:', err);
    }
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
    <div className={`min-h-screen relative overflow-x-hidden ${isDarkMode ? 'bg-[#080707] text-slate-100' : 'bg-[#F8F9FA] text-slate-900'} flex flex-col selection:bg-zinc-850 selection:text-white ${fontClass}`}>
      
      {/* Immersive Atmospheric Background Glows (Patriotic Tricolor Saffron, White, Green, and Ashok Chakra Navy) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Saffron (Top Left) */}
        <div className={`absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ${isDarkMode ? 'bg-[#FF671F]/10' : 'bg-[#FF671F]/4'}`} />
        
        {/* Navy Blue Ashok Chakra (Center) */}
        <div className={`absolute top-[25%] left-[30%] w-[500px] h-[500px] rounded-full blur-[150px] transition-all duration-700 ${isDarkMode ? 'bg-[#06038D]/5' : 'bg-[#06038D]/2'}`} />
        
        {/* Green (Bottom Right) */}
        <div className={`absolute bottom-[-15%] right-[-15%] w-[600px] h-[600px] rounded-full blur-[140px] transition-all duration-700 ${isDarkMode ? 'bg-[#046A38]/10' : 'bg-[#046A38]/4'}`} />
      </div>
      
      {/* Header bar styled in crisp premium aesthetic */}
      <header className="sticky top-0 z-40 bg-black/40 backdrop-blur-md border-b border-white/10 px-4 sm:px-6 py-4">
        {/* Premium Indian Tricolor accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38] opacity-100" />
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
            <div className="w-9 h-9 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center justify-center text-white font-sans font-bold shadow group-hover:bg-zinc-900 transition overflow-hidden">
              {customization.appLogoUrl ? (
                <img src={customization.appLogoUrl} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <AshokChakra size={28} animateRotation={true} glow={true} />
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
            
            {/* Feedback & Suggestion Button */}
            <button
              onClick={() => {
                playSound('click');
                setShowFeedbackModal(true);
              }}
              title="Feedback & Feature Suggestions by Students"
              className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-300 hover:text-white rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Feedback</span>
            </button>
            
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
                      <div className="px-2.5 py-1.5 text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-extrabold border-b border-zinc-900 flex justify-between items-center">
                        <span>{appLanguage === 'hi' ? 'त्वरित नेविगेशन' : 'QUICK NAVIGATION'}</span>
                        {/* Timer is inbuild but not shown */}
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
                  isEditMode={false}
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
                  onOpenCheckout={handleOpenCheckout}
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
                  onOpenCheckout={handleOpenCheckout}
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
                  feedbacksList={feedbacksList}
                  onAddFeedback={handleAddFeedback}
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
                isEditMode={false}
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
                isLiveEditing={false}
                onToggleLiveEditing={() => {}}
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
                      placeholder="Enter username"
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
                      placeholder="Enter password"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Student Feedback & Feature Suggestion Dialog */}
      <AnimatePresence>
        {showFeedbackModal && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 15, scale: 0.98 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8.5 h-8.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">Student Feedback Desk</h3>
                    <p className="text-[10px] text-zinc-500 font-medium">Bilingual & Language-Agnostic Channel</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    playSound('click');
                    setShowFeedbackModal(false);
                    setFeedbackText('');
                  }}
                  className="w-7 h-7 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scrollable Form Body */}
              <div className="p-5 overflow-y-auto space-y-4 text-xs">
                <p className="text-zinc-400 leading-relaxed">
                  Post features suggestion, course requests, or bug reports. Write or voice-record in <strong className="text-white">Bhojpuri, English, Hindi, or Hinglish</strong> — we prioritize physical concepts, clarity, and curiosity over grammar.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Feedback Category</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-850 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-zinc-500"
                    >
                      <option value="Feature Suggestion">💡 Feature Suggestion</option>
                      <option value="Academic Request">🔬 Course or Syllabus Request</option>
                      <option value="Bug Report">🐛 Bug Report</option>
                      <option value="General Feedback">📝 General Feedback</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Language Inclusivity</label>
                    <div className="bg-zinc-900/60 border border-zinc-850 p-2 rounded-xl text-[9px] text-zinc-500 leading-normal">
                      We analyze content depth. Regional mixture is 100% fine!
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Your message</label>
                    <button
                      type="button"
                      onClick={() => {
                        if (isFeedbackRecording) return;
                        playSound('click');
                        setIsFeedbackRecording(true);
                        setFeedbackText("Listening... speak now in Hindi/English/Bhojpuri...");
                        
                        const phrases = [
                          "Sir, please add speed control (.25x, 1.5x, 2x) and download quality settings in video lecture panel.",
                          "Class 10th Optics and Light refraction me mind maps compile karke PDF support de dijiye notes section me.",
                          "Hum Bhojpuri me bolat bani, humra ke is platform pe offline test notes download kare ke pure options provide kijiye.",
                          "Bharat AI evaluation me negative feedback tough kijiye, humein strict boards pattern validation chahiye!"
                        ];

                        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];

                        setTimeout(() => {
                          setFeedbackText(randomPhrase);
                          setIsFeedbackRecording(false);
                          playSound('success');
                        }, 2200);
                      }}
                      className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition active:scale-95 cursor-pointer ${
                        isFeedbackRecording 
                          ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' 
                          : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border-zinc-850'
                      }`}
                    >
                      <Mic className="w-3 h-3 text-red-500" />
                      <span>{isFeedbackRecording ? 'Recording...' : 'Simulate Voice Input'}</span>
                    </button>
                  </div>
                  
                  <textarea
                    placeholder="Speak or type in Hindi, Bhojpuri, or English..."
                    rows={4}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-500 leading-relaxed font-sans placeholder-zinc-600 resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!feedbackText.trim() || feedbackText.startsWith("Listening...")) return;
                    playSound('click');
                    handleAddFeedback(feedbackCategory, feedbackText);
                    setFeedbackText('');
                    setShowFeedbackModal(false);
                    alert("✨ Jai Hind! Your feedback has been queued and logged for Priyanshu Admin's active review.");
                  }}
                  disabled={!feedbackText.trim() || isFeedbackRecording}
                  className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-35 text-zinc-950 font-extrabold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-950/20"
                >
                  Submit Suggestions to Administration
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Payment / Checkout Modal */}
      <AnimatePresence>
        {globalCheckoutCourse && (
          <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98, y: 15 }}
              className="bg-zinc-950 border border-zinc-900 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-5 border-b border-zinc-900 flex justify-between items-center bg-zinc-900/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white">Unlock Course Batch</h3>
                    <p className="text-[10px] text-zinc-500">Secure Direct QR & UPI Verification Transfer</p>
                  </div>
                </div>
                <button
                  onClick={() => setGlobalCheckoutCourse(null)}
                  className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-850 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form & Transfer Container (Scrollable) */}
              <div className="p-6 overflow-y-auto space-y-5 text-zinc-300">
                {/* Brand-new Interactive 3D Price Tag Banner */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/30 to-zinc-900/40 border border-amber-900/20 flex items-center justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl" />
                  <div className="flex items-center gap-4 z-10">
                    {/* Floating 3D Gold/Orange Price Tag Cutout */}
                    <div className="w-16 h-16 bg-amber-500/10 rounded-xl border border-amber-500/25 flex items-center justify-center overflow-hidden shrink-0 p-0.5 shadow-md">
                      <img 
                        src="/src/assets/images/cartoon_price_tag_cutout_1784618402053.jpg" 
                        alt="3D Price Tag Cutout" 
                        className="w-full h-full object-cover rounded-lg scale-105 hover:scale-115 transition duration-500" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-mono font-bold tracking-widest text-amber-400 uppercase flex items-center gap-1.5 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-900/40 w-fit">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        Exclusive Batch Discount
                      </span>
                      <h4 className="text-xs font-black text-white mt-1">{globalCheckoutCourse.title}</h4>
                    </div>
                  </div>
                  <div className="text-right z-10 shrink-0 bg-black/40 border border-zinc-900/80 px-3.5 py-2 rounded-xl">
                    <span className="text-[10px] font-mono text-zinc-500 line-through block">₹1,999</span>
                    <p className="text-base font-black font-mono text-amber-400 tracking-tight">{globalCheckoutCourse.price}</p>
                  </div>
                </div>

                {/* Direct UPI Scan Box */}
                <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-900 flex flex-col sm:flex-row items-center gap-5">
                  <div className="w-32 h-32 bg-white p-2.5 rounded-2xl shrink-0 flex flex-col items-center justify-center border border-zinc-800 shadow-inner">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=${ownerProfile.upiId || 'rst010186@paytm'}&pn=${encodeURIComponent(ownerProfile.name)}&am=${globalCheckoutCourse.price.replace(/[^\d]/g, '')}&cu=INR`}
                      alt="Payment UPI QR Code"
                      className="w-full h-full object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <h5 className="text-xs font-bold text-white">Direct Transfer QR Code</h5>
                    <p className="text-[11px] text-zinc-400 leading-relaxed">
                      Scan the QR code with GPay, PhonePe, Paytm, or BHIM. Alternatively, transfer directly to UPI ID:
                    </p>
                    <div className="p-2 bg-zinc-950 border border-zinc-900 rounded-xl flex items-center justify-between">
                      <code className="text-[10px] font-mono text-yellow-400 select-all font-bold">{ownerProfile.upiId || 'rst010186@paytm'}</code>
                      <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold bg-zinc-900 px-2 py-0.5 rounded-md">UPI ID</span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Full Name</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Student name"
                        value={checkoutStudentName}
                        onChange={(e) => { setCheckoutStudentName(e.target.value); setCheckoutNameError(''); }}
                        className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-zinc-500 animate-none"
                      />
                      {checkoutNameError && <span className="text-[10px] text-red-400 font-mono">{checkoutNameError}</span>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Contact Number</span>
                      </label>
                      <input
                        type="tel"
                        placeholder="Mobile (e.g. +91 9876543210)"
                        value={checkoutStudentPhone}
                        onChange={(e) => { setCheckoutStudentPhone(e.target.value); setCheckoutPhoneError(''); }}
                        className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-zinc-500 animate-none"
                      />
                      {checkoutPhoneError && <span className="text-[10px] text-red-400 font-mono">{checkoutPhoneError}</span>}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Email ID</span>
                    </label>
                    <input
                      type="email"
                      placeholder="Student email address"
                      value={checkoutStudentEmail}
                      onChange={(e) => { setCheckoutStudentEmail(e.target.value); setCheckoutEmailError(''); }}
                      className="w-full bg-zinc-900/60 border border-zinc-850 rounded-xl py-2.5 px-3 text-xs text-white outline-none focus:border-zinc-500 animate-none"
                    />
                    {checkoutEmailError && <span className="text-[10px] text-red-400 font-mono">{checkoutEmailError}</span>}
                  </div>

                  {/* Transaction ID / UTR Input Section */}
                  <div className="space-y-2 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-850">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-mono font-bold text-yellow-400 uppercase tracking-wider block">
                        Transaction Number (12-Digit UTR/Ref No)
                      </label>
                      <input
                        type="text"
                        placeholder="Enter payment reference number"
                        value={checkoutTransactionId}
                        onChange={(e) => { setCheckoutTransactionId(e.target.value); setCheckoutTxError(''); }}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2.5 px-3 text-xs text-white font-mono uppercase outline-none focus:border-yellow-500 animate-none"
                      />
                      {checkoutTxError && <span className="text-[10px] text-red-400 font-mono">{checkoutTxError}</span>}
                    </div>

                    <div className="pt-2 text-[10px] text-zinc-400 leading-normal border-t border-zinc-850/60">
                      <p className="font-semibold text-zinc-300 mb-1">💡 How to access your Transaction Number?</p>
                      <p>
                        Open your UPI App (GPay, PhonePe, Paytm, or BHIM) after completing the transfer. Look for the <strong>"UTR"</strong>, <strong>"UPI Ref No"</strong>, or <strong>"Transaction Ref"</strong> in your transaction receipt/history. This is a unique 12-digit number.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-5 border-t border-zinc-900 flex gap-2.5 bg-zinc-900/20">
                <button
                  type="button"
                  onClick={() => setGlobalCheckoutCourse(null)}
                  className="flex-1 py-3 rounded-xl bg-zinc-900 text-zinc-400 hover:bg-zinc-850 hover:text-white font-bold text-xs cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isCheckoutProcessing}
                  onClick={handleConfirmCheckout}
                  className="flex-1 py-3 rounded-xl bg-yellow-400 text-black hover:bg-yellow-300 font-extrabold text-xs cursor-pointer transition flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCheckoutProcessing ? (
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Buy the Batch</span>
                      <ArrowRight className="w-4 h-4 shrink-0" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showApkUpdateModal && apkUpdateInfo && (
          <div key="apk-update-modal" className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden max-w-md w-full shadow-2xl relative"
            >
              <div className="bg-gradient-to-br from-emerald-600/20 via-zinc-950 to-zinc-950 p-6 border-b border-zinc-900 text-center relative overflow-hidden">
                <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-2xl"></div>
                <div className="mx-auto w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-bounce">
                  <Atom className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-extrabold text-white">New Learning Version Available!</h3>
                <p className="text-xs text-zinc-400 mt-1">Upgrade Curious Bharat App to access the latest features</p>
                
                <button 
                  onClick={() => setShowApkUpdateModal(false)}
                  className="absolute top-4 right-4 text-zinc-500 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center bg-zinc-900/60 border border-zinc-850 p-3.5 rounded-2xl">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">Your App Version</span>
                    <strong className="text-sm font-mono text-zinc-400">{currentClientApkVersion}</strong>
                  </div>
                  <div className="text-zinc-700 font-bold">➔</div>
                  <div className="text-right">
                    <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-wider block">New Version</span>
                    <strong className="text-sm font-mono text-emerald-400">{apkUpdateInfo.version}</strong>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase tracking-wider block">What's New in this Build:</span>
                  <div className="bg-zinc-900/40 p-4 rounded-2xl border border-zinc-900/80 max-h-32 overflow-y-auto">
                    <p className="text-xs text-zinc-300 leading-relaxed font-sans">{apkUpdateInfo.notes || 'Performance enhancements and optimized course video streaming pipelines.'}</p>
                  </div>
                </div>

                {isDownloadingApk ? (
                  <div className="space-y-3 bg-zinc-900/30 p-4 rounded-2xl border border-zinc-900">
                    <div className="flex justify-between items-center text-xs font-mono">
                      <span className="text-emerald-400 animate-pulse flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        Downloading package...
                      </span>
                      <span className="text-zinc-400 font-bold">{apkDownloadPercent}%</span>
                    </div>
                    <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-850">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-200" 
                        style={{ width: `${apkDownloadPercent}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-zinc-500 text-center">Please do not close the app. Installation will start automatically.</p>
                  </div>
                ) : (
                  <button
                    onClick={handleUpdateApk}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-extrabold text-xs rounded-2xl transition shadow-lg shadow-emerald-950/40 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Update & Install Automatically</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}

                <div className="text-center">
                  <button 
                    onClick={() => setShowApkUpdateModal(false)}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 font-bold transition uppercase tracking-widest cursor-pointer"
                  >
                    Continue using old version
                  </button>
                </div>
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
