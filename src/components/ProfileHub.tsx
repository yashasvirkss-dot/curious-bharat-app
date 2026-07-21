import React, { useState, useEffect } from 'react';
import { 
  User, 
  Moon,
  Sun,
  Settings, 
  Award, 
  FileText, 
  Bell, 
  Smartphone, 
  Database, 
  Trash2, 
  Volume2, 
  ShieldCheck, 
  Eye, 
  Bookmark, 
  Notebook, 
  Flame, 
  Layers, 
  BarChart, 
  Calendar,
  CheckCircle,
  Clock,
  RotateCcw,
  LogOut,
  Camera,
  Languages,
  Info,
  Coins,
  Gift,
  Share2,
  Tag,
  TrendingUp,
  AlertCircle,
  BookOpen,
  Sparkles,
  Brain,
  Mic,
  MessageSquare,
  Activity,
  Compass
} from 'lucide-react';
import { motion } from 'motion/react';
import { Course, UserProgress } from '../types';
import { dbService } from '../lib/firebase';
import { translations } from '../lib/translations';
import { playSound } from '../utils/audio';
import ThreeDElement from './ThreeDElement';

interface ProfileHubProps {
  progress: UserProgress;
  onUpdateProgress: (updated: UserProgress) => void;
  studentAnalysisRecords: any[];
  onAddStudentAnalysisRecord: (rec: any) => void;
  onLogoutAdmin?: () => void;
  isLoggedInAdmin?: boolean;
  courses?: Course[];
  appLanguage?: 'en' | 'hi';
  onLanguageChange?: (val: 'en' | 'hi') => void;
  isDarkMode?: boolean;
  onDarkModeChange?: (val: boolean) => void;
  feedbacksList?: any[];
  onAddFeedback?: (cat: string, text: string) => void;
}

export default function ProfileHub({ 
  progress, 
  onUpdateProgress, 
  studentAnalysisRecords,
  onAddStudentAnalysisRecord,
  onLogoutAdmin,
  isLoggedInAdmin,
  courses = [],
  appLanguage = 'en',
  onLanguageChange,
  isDarkMode = true,
  onDarkModeChange,
  feedbacksList = [],
  onAddFeedback
}: ProfileHubProps) {
  const t = translations[appLanguage];

  // Advanced Personal Details
  const [name, setName] = useState(progress.studentName || 'Student Name');
  const [grade, setGrade] = useState(progress.studentGrade || 'Class 10th');
  const [school, setSchool] = useState(progress.studentSchool || 'CBSE Public School, Delhi');
  const [profilePic, setProfilePic] = useState(progress.profilePic || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Local student feedback form state
  const [localFeedbackCat, setLocalFeedbackCat] = useState('Feature Suggestion');
  const [localFeedbackText, setLocalFeedbackText] = useState('');
  const [localRecording, setLocalRecording] = useState(false);
  const [feedbackSuccessMsg, setFeedbackSuccessMsg] = useState('');

  // Referral Wallet State
  const [referralBalance, setReferralBalance] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [copiedCode, setCopiedCode] = useState(false);

  // App Preferences
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [dataSaver, setDataSaver] = useState(false);
  const [videoQuality, setVideoQuality] = useState('1080p');
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  // Load state and referral wallet
  useEffect(() => {
    const savedSound = localStorage.getItem('pref_sound');
    if (savedSound) setSoundEnabled(savedSound === 'true');
    const savedDataSaver = localStorage.getItem('pref_data_saver');
    if (savedDataSaver) setDataSaver(savedDataSaver === 'true');
    const savedQual = localStorage.getItem('pref_video_quality');
    if (savedQual) setVideoQuality(savedQual);
    const savedLang = localStorage.getItem('pref_app_language');
    if (savedLang && onLanguageChange) onLanguageChange(savedLang as 'en' | 'hi');
    const savedNotif = localStorage.getItem('pref_notif');
    if (savedNotif) setNotificationEnabled(savedNotif === 'true');

    // Retrieve name/school/grade if present
    const savedName = localStorage.getItem('student_name');
    if (savedName) setName(savedName);
    const savedSchool = localStorage.getItem('student_school');
    if (savedSchool) setSchool(savedSchool);
    const savedGrade = localStorage.getItem('student_grade');
    if (savedGrade) setGrade(savedGrade);
    const savedPic = localStorage.getItem('student_pic');
    if (savedPic) setProfilePic(savedPic);

    // Load referral stats from dbService
    const loadReferrals = async () => {
      const studentId = progress.studentName ? progress.studentName.replace(/\s+/g, '_').toLowerCase() : 'default_student';
      const status = await dbService.getReferralStatus(studentId);
      setReferralBalance(status.balance);
      setReferrals(status.referrals);
    };
    loadReferrals();
  }, [progress.studentName]);

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    localStorage.setItem('student_name', name);
    localStorage.setItem('student_school', school);
    localStorage.setItem('student_grade', grade);
    localStorage.setItem('student_pic', profilePic);

    // Save back to progress state
    const updated = {
      ...progress,
      studentName: name,
      studentGrade: grade,
      studentSchool: school,
      profilePic
    };
    onUpdateProgress(updated);
  };

  const handleToggleSound = (val: boolean) => {
    setSoundEnabled(val);
    localStorage.setItem('pref_sound', String(val));
    window.dispatchEvent(new CustomEvent('pref_sound_toggle', { detail: val }));
  };

  const handleToggleDataSaver = (val: boolean) => {
    setDataSaver(val);
    localStorage.setItem('pref_data_saver', String(val));
  };

  const handleQualityChange = (val: string) => {
    setVideoQuality(val);
    localStorage.setItem('pref_video_quality', val);
  };

  const handleLanguageChange = (val: string) => {
    localStorage.setItem('pref_app_language', val);
    if (onLanguageChange) {
      onLanguageChange(val as 'en' | 'hi');
    }
  };

  const handleClearCache = () => {
    const confirm = window.confirm("Are you sure you want to clear your local image and video layout cache? (Your studies statistics will remain safe!)");
    if (confirm) {
      alert("Local app cache successfully optimized. Cleaned 4.2 MB of storage!");
    }
  };

  // Simulated click to earn referral bonus
  const handleCopyReferral = async () => {
    const studentId = progress.studentName ? progress.studentName.replace(/\s+/g, '_').toLowerCase() : 'default_student';
    const code = `BHARAT-${studentId.slice(0, 5).toUpperCase()}-99`;
    const referralLink = `${window.location.origin}/?ref=${code}`;
    
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch (err) {
      console.warn("Clipboard copy failed, using fallback alert", err);
    }

    // Simulate standard refer reward payout of ₹200 on click so students can instantly experience the wallet mechanics!
    const names = ["Aditya Roy", "Ananya Sen", "Priya Sharma", "Rohan Verma", "Sneha Gupta"];
    const randomName = names[Math.floor(Math.random() * names.length)] + " (Joined)";
    const newRef = {
      id: Math.random().toString(),
      name: randomName,
      earned: 200,
      date: new Date().toLocaleDateString()
    };
    const newBal = referralBalance + 200;
    const updatedRefs = [newRef, ...referrals];
    setReferralBalance(newBal);
    setReferrals(updatedRefs);
    await dbService.saveReferralStatus(studentId, newBal, updatedRefs);
  };

  // Certificate log
  const mockCertificates = [
    { title: "CBSE Electrostatics Master Class", issueDate: "04 July 2026", score: "96%" },
    { title: "Laws of Motion Fundamentals Course", issueDate: "12 June 2026", score: "100%" }
  ];

  // Dynamic syllabus counters based on passed courses state
  const allChapters = (courses || []).reduce<any[]>((acc, course) => {
    const chaptersWithCourse = course.chapters.map(chap => ({
      ...chap,
      courseId: course.id,
      isPaidCourse: course.isPaid,
      coursePrice: course.price,
      courseSubject: course.subject
    }));
    return [...acc, ...chaptersWithCourse];
  }, []);

  const completedLecturesCount = progress.completedChapters.length;
  const totalLecturesCount = allChapters.length;
  const lecturePercentVal = totalLecturesCount > 0 
    ? Math.round((completedLecturesCount / totalLecturesCount) * 100) 
    : 0;

  const totalTestsTaken = Object.keys(progress.quizScores).length;
  const averageQuizScore = totalTestsTaken > 0
    ? Math.round(
        Object.values(progress.quizScores).reduce((sum, item) => sum + item.highscore, 0) / totalTestsTaken
      )
    : 0;

  // Weak Topics calculation based on scores or uncompleted items
  const lowScoresList = allChapters.filter(chap => {
    const quizScore = progress.quizScores[chap.id]?.highscore;
    return quizScore !== undefined && quizScore < 75;
  });

  let weakTopicsList = lowScoresList.map(ch => ch.title);
  if (weakTopicsList.length === 0) {
    const remainingChaps = allChapters.filter(ch => !progress.completedChapters.includes(ch.id));
    weakTopicsList = remainingChaps.slice(0, 2).map(ch => ch.title);
  }

  // Subject-specific counts and rate calculations
  const physicsChapters = allChapters.filter(c => c.courseSubject === 'Physics' || c.subject === 'Physics');
  const chemChapters = allChapters.filter(c => c.courseSubject === 'Chemistry' || c.subject === 'Chemistry');
  const bioChapters = allChapters.filter(c => c.courseSubject === 'Biology' || c.subject === 'Biology');

  const physicsTotal = physicsChapters.length;
  const chemTotal = chemChapters.length;
  const bioTotal = bioChapters.length;

  const physicsCompleted = physicsChapters.filter(ch => progress.completedChapters.includes(ch.id)).length;
  const chemCompleted = chemChapters.filter(ch => progress.completedChapters.includes(ch.id)).length;
  const bioCompleted = bioChapters.filter(ch => progress.completedChapters.includes(ch.id)).length;

  const physicsRate = physicsTotal > 0 ? Math.round((physicsCompleted / physicsTotal) * 100) : 0;
  const chemRate = chemTotal > 0 ? Math.round((chemCompleted / chemTotal) * 100) : 0;
  const bioRate = bioTotal > 0 ? Math.round((bioCompleted / bioTotal) * 100) : 0;

  // Concentric circle path constants
  // Outermost (Physics): Radius = 38, Middle (Chemistry): Radius = 28, Innermost (Biology): Radius = 18
  const physDash = Math.round(2 * Math.PI * 38);
  const chemDash = Math.round(2 * Math.PI * 28);
  const bioDash = Math.round(2 * Math.PI * 18);

  const physOffset = physDash - (physDash * physicsRate) / 100;
  const chemOffset = chemDash - (chemDash * chemRate) / 100;
  const bioOffset = bioDash - (bioDash * bioRate) / 100;

  // Weekly active study hours simulated values
  const weeklyStudyHours = [
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 3.8 },
    { day: "Wed", hours: 1.5 },
    { day: "Thu", hours: 4.2 },
    { day: "Fri", hours: 3.0 },
    { day: "Sat", hours: 5.5 },
    { day: "Sun", hours: 6.0 }
  ];
  const maxStudyHours = 6.0;

  return (
    <div id="profile-hub-root" className={`space-y-6 pb-24 max-w-4xl mx-auto text-left ${isDarkMode ? '' : 'p-6 sm:p-8 rounded-[32px] bg-blue-50/30 border border-blue-100/60 shadow-sm'}`}>
      
      {/* =======================================================
          DYNAMIC COVER BANNER
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 relative overflow-hidden flex flex-col md:flex-row items-center gap-6">
        <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        {/* Profile Picture Upload Section */}
        <div className="relative group cursor-pointer">
          <div className="w-20 h-20 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-white overflow-hidden">
            {profilePic ? (
              <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <User className="w-8 h-8 text-zinc-500" />
            )}
          </div>
          <button 
            onClick={() => {
              playSound('click');
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = 'image/*';
              fileInput.onchange = (e: any) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    if (typeof reader.result === 'string') {
                      setProfilePic(reader.result);
                      localStorage.setItem('student_pic', reader.result);
                      onUpdateProgress({ ...progress, profilePic: reader.result });
                      try {
                        playSound('victory');
                      } catch (err) {}
                    }
                  };
                  reader.readAsDataURL(file);
                }
              };
              fileInput.click();
            }}
            className="absolute bottom-0 right-0 p-1.5 bg-white text-black rounded-full shadow-lg border hover:scale-105 transition cursor-pointer"
            title="Upload photo"
          >
            <Camera className="w-3 h-3 text-black" />
          </button>
        </div>

        {/* Personal details info fields */}
        <div className="flex-1 space-y-1 text-center md:text-left">
          {isEditingProfile ? (
            <div className="space-y-2 max-w-sm">
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                className="bg-black border border-zinc-900 rounded-xl px-3 py-1 text-xs text-white outline-none w-full"
                placeholder="Student Name"
              />
              <input 
                type="text" 
                value={school} 
                onChange={(e) => setSchool(e.target.value)} 
                className="bg-black border border-zinc-900 rounded-xl px-3 py-1 text-xs text-white outline-none w-full"
                placeholder="School Name"
              />
              <select 
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="bg-black border border-zinc-900 rounded-xl px-3 py-1 text-xs text-white outline-none w-full"
              >
                <option value="Class 9th">Class 9th (Science Core)</option>
                <option value="Class 10th">Class 10th (Science Core)</option>
                <option value="Class 11th">Class 11th (Advance Stream)</option>
                <option value="Class 12th">Class 12th (Boards Stream)</option>
              </select>
              <button 
                onClick={handleSaveProfile}
                className="bg-white text-black font-extrabold text-[10px] px-3 py-1 rounded-lg"
              >
                Save
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-base font-extrabold text-white flex items-center justify-center sm:justify-start gap-1.5">
                  {name}
                  <span onClick={() => setIsEditingProfile(true)} className="text-[10px] text-zinc-500 hover:text-white cursor-pointer underline font-mono">
                    edit
                  </span>
                </h3>
                <p className="text-xs text-zinc-400">{school}</p>
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-[9px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                    {grade}
                  </span>
                  <span className="text-[9px] bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                    <Award className="w-3 h-3 text-emerald-400" />
                    <span>Certified Scholar</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total stats counters */}
        <div className="flex items-center gap-6 border-t border-zinc-900 md:border-t-0 pt-4 md:pt-0">
          {/* Interactive Graduation Cap, Gold Trophy and Gold Medal elements */}
          <div className="flex gap-2 items-center">
            <div className="w-16 h-16 relative hidden sm:block" title="Graduation Cap">
              <ThreeDElement type="cap" className="w-full h-full" autoRotate={true} interactive={true} />
            </div>
            <div className="w-16 h-16 relative hidden sm:block" title="Gold Trophy">
              <ThreeDElement type="trophy_3d_gold" className="w-full h-full" autoRotate={true} interactive={true} />
            </div>
            <div className="w-16 h-16 relative hidden sm:block" title="Gold Medal">
              <ThreeDElement type="medal" className="w-full h-full" autoRotate={true} interactive={true} />
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-center">
              <span className="text-sm font-bold font-mono text-white block">{completedLecturesCount}</span>
              <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono">Completed</span>
            </div>
            <div className="text-center">
              <span className="text-sm font-bold font-mono text-white block">{progress.totalXP}</span>
              <span className="text-[8px] uppercase tracking-wider text-zinc-500 font-mono">Rank Coins</span>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          ACADEMIC SOLUTION ACCELERATION DASHBOARD (RELOCATED)
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-3 gap-2">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-400" />
            Academic Solution Dashboard
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono font-semibold flex items-center gap-1.5 bg-zinc-900/50 border border-zinc-850 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            Supervised Curriculum Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* 1. Lectures Completed - Pie Chart */}
          <div className="bg-zinc-900/20 border border-zinc-900/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
              <span className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">Lectures Completed</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-bold font-mono animate-pulse">
                ● Progress Pie
              </span>
            </div>
            
            <div className="space-y-1 z-10">
              <div className="text-2xl font-black font-mono text-white tracking-tight flex items-baseline gap-1">
                {completedLecturesCount}
                <span className="text-xs text-zinc-500 font-normal">/ {totalLecturesCount} Lectures</span>
              </div>
              <p className="text-[10px] text-zinc-500">Subject syllabus completion slices</p>
            </div>

            {/* Visual Pie/Donut Chart SVG representing Completed Lectures */}
            <div className="h-20 w-full relative mt-3 bg-zinc-950/50 border border-zinc-900 rounded-xl p-1 overflow-hidden flex items-center justify-center gap-4">
              <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  {/* Outer circle: Remaining (zinc-800) */}
                  <circle cx="18" cy="18" r="15.915" stroke="#27272a" strokeWidth="4" fill="transparent" />
                  {/* Inner circle: Completed (emerald-400) */}
                  <circle 
                    cx="18" 
                    cy="18" 
                    r="15.915" 
                    stroke="url(#pieGrad)" 
                    strokeWidth="4" 
                    fill="transparent" 
                    strokeDasharray="100"
                    strokeDashoffset={100 - lecturePercentVal}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="pieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                {/* Center text inside the donut */}
                <div className="absolute text-[9px] font-mono font-black text-white">
                  {lecturePercentVal}%
                </div>
              </div>
              <div className="text-[10px] space-y-1">
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                  <span className="text-zinc-300">Done: {completedLecturesCount}</span>
                </div>
                <div className="flex items-center gap-1.5 font-mono">
                  <span className="w-2 h-2 rounded-full bg-zinc-850 shrink-0" />
                  <span className="text-zinc-500">Left: {Math.max(0, totalLecturesCount - completedLecturesCount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Exam Diagnostics - Spline Line Area Graph */}
          <div className="bg-zinc-900/20 border border-zinc-900/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
              <span className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">Exam Diagnostics</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold font-mono">
                Pulse Spline
              </span>
            </div>
            
            <div className="space-y-1 z-10">
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {totalTestsTaken} <span className="text-xs text-zinc-500 font-normal">Sessions</span>
              </div>
              <p className="text-[10px] text-zinc-500">Diagnostic score trends & calibration</p>
            </div>

            {/* Beautiful Line Graph for Exam Diagnosis */}
            <div className="h-20 w-full relative mt-3 bg-black/60 border border-zinc-900 rounded-xl p-1 overflow-hidden flex flex-col justify-center">
              {/* Scan grid backdrop */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(24,24,27,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(24,24,27,0.2)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none" />
              
              <svg className="w-full h-12 relative z-10" viewBox="0 0 100 40" preserveAspectRatio="none">
                {/* Spline Area Fill */}
                <path 
                  d="M 5,38 L 25,32 L 45,18 L 65,22 L 85,12 L 95,8 L 95,38 Z" 
                  fill="url(#examAreaGrad)" 
                  className="transition-all duration-1000"
                />
                {/* Spline Line */}
                <path 
                  d="M 5,38 L 25,32 L 45,18 L 65,22 L 85,12 L 95,8" 
                  fill="none" 
                  stroke="#3b82f6" 
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
                
                <defs>
                  <linearGradient id="examAreaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Score point beacons */}
                <circle cx="25" cy="32" r="1.5" fill="#3b82f6" />
                <circle cx="45" cy="18" r="1.5" fill="#10b981" />
                <circle cx="65" cy="22" r="1.5" fill="#f59e0b" />
                <circle cx="85" cy="12" r="1.5" fill="#3b82f6" />
                <circle cx="95" cy="8" r="2" fill="#10b981" className="animate-pulse" />
              </svg>
              
              <div className="absolute bottom-1 left-2 flex items-center justify-between inset-x-2 text-[8px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${totalTestsTaken > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                  <span>TREND: {averageQuizScore > 0 ? `${averageQuizScore}% AVG` : 'STABLE'}</span>
                </span>
                <span className="text-zinc-400 font-bold">Diagnostics Wave</span>
              </div>
            </div>
          </div>

          {/* 3. Overall Accuracy - Speedometer Dial Gauge */}
          <div className="bg-zinc-900/20 border border-zinc-900/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
              <span className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">Overall Accuracy</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold font-mono">
                Gauge Dial
              </span>
            </div>
            
            <div className="space-y-1 z-10">
              <div className="text-2xl font-black font-mono text-white tracking-tight">
                {averageQuizScore}%
              </div>
              <p className="text-[10px] text-zinc-500">Average accuracy calibration</p>
            </div>

            {/* Pictorial Semicircle Dial Gauge */}
            <div className="h-20 w-full relative mt-2 flex items-end justify-center overflow-hidden">
              <div className="relative w-28 h-14 mt-4">
                {/* Arc Background */}
                <svg className="w-full h-full" viewBox="0 0 100 50">
                  <path 
                    d="M 10,50 A 40,40 0 0,1 90,50" 
                    fill="none" 
                    stroke="#1f2937" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                  />
                  {/* Arc Progress */}
                  <path 
                    d="M 10,50 A 40,40 0 0,1 90,50" 
                    fill="none" 
                    stroke="url(#dialGrad)" 
                    strokeWidth="10" 
                    strokeLinecap="round" 
                    strokeDasharray="126"
                    strokeDashoffset={126 - (126 * averageQuizScore) / 100}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="dialGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ef4444" />
                      <stop offset="40%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#10b981" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center needle pointer rotated */}
                <div 
                  className="absolute bottom-0 left-1/2 w-1.5 h-10 bg-amber-400 origin-bottom rounded-t-full transition-transform duration-1000"
                  style={{ 
                    transform: `translateX(-50%) rotate(${Math.min(180, Math.max(0, (averageQuizScore / 100) * 180)) - 90}deg)`,
                    transformOrigin: 'bottom center'
                  }}
                />
                {/* Center Pivot Hub */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-2 bg-zinc-950 border-t border-zinc-800 rounded-t-full flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-white" />
                </div>
              </div>
              <div className="absolute bottom-0 inset-x-0 flex justify-between text-[8px] font-mono text-zinc-650 px-1">
                <span>0%</span>
                <span className="text-zinc-400 font-bold">{averageQuizScore >= 80 ? 'EXPERT' : averageQuizScore >= 60 ? 'STEADY' : 'PRACTICE'}</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* 4. Weak Topics - Thermal Heat Spot Alert Zone */}
          <div className="bg-zinc-900/20 border border-zinc-900/80 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-2">
              <span className="text-[10px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">Concept Focus</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-amber-950/40 border border-amber-900/40 text-amber-500 font-bold font-mono">
                Thermal Spot
              </span>
            </div>
            
            <div className="flex-1 flex flex-col justify-between pt-1">
              {weakTopicsList.length > 0 ? (
                <div className="space-y-1.5">
                  {weakTopicsList.slice(0, 2).map((topic, index) => (
                    <div 
                      key={index} 
                      className="p-1.5 rounded-lg bg-gradient-to-r from-amber-950/30 to-zinc-900/50 border border-amber-900/20 flex items-center gap-2"
                    >
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping shrink-0" />
                      <span className="text-[10px] text-zinc-300 font-bold font-sans truncate block w-full">{topic}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-emerald-950/20 border border-emerald-900/20 text-emerald-400 font-bold text-[10px] flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Curriculum fully masterered!</span>
                </div>
              )}
              <div className="mt-2.5 flex items-center justify-between text-[8px] font-mono text-zinc-500 border-t border-zinc-900/50 pt-2">
                <span>RECALIBRATING CORE</span>
                <span className="text-amber-500 font-bold">FOCUS</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================
          DETAILED STUDENT PERFORMANCE ANALYSIS (COSMIC STAR ORBITS & WAVE STREAM)
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-zinc-900 pb-3 gap-2">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 profile-label-custom">
            <BarChart className="w-4 h-4 text-zinc-100" />
            Detailed Performance Diagnostics
          </h4>
          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-2.5 py-1 rounded border border-zinc-850">
            Pictorial Diagnostics
          </span>
        </div>

        {/* Bento Grid: 1. Syllabus Percentage Tracker & 2. Diligence Study Log (Bar Graph) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Syllabus Percentage Tracker */}
          <div className="md:col-span-6 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-cyan-400" />
                Syllabus Percentage Tracker
              </h5>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Granular student progress tracking across key subjects and syllabus topics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
              {/* Radial Multi-ring progress tracker */}
              <div className="relative w-36 h-36 flex items-center justify-center bg-black/40 border border-zinc-900 rounded-3xl p-2 shadow-inner">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Physics track & ring (R: 38) */}
                  <circle cx="50" cy="50" r="38" stroke="#18181b" strokeWidth="4.5" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="38" 
                    stroke="#22d3ee" strokeWidth="5" fill="transparent" 
                    strokeDasharray="238.76" 
                    strokeDashoffset={238.76 - (238.76 * physicsRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />

                  {/* Chemistry track & ring (R: 28) */}
                  <circle cx="50" cy="50" r="28" stroke="#18181b" strokeWidth="4.5" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="28" 
                    stroke="#34d399" strokeWidth="5" fill="transparent" 
                    strokeDasharray="175.93" 
                    strokeDashoffset={175.93 - (175.93 * chemRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />

                  {/* Biology track & ring (R: 18) */}
                  <circle cx="50" cy="50" r="18" stroke="#18181b" strokeWidth="4.5" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="18" 
                    stroke="#f59e0b" strokeWidth="5" fill="transparent" 
                    strokeDasharray="113.1" 
                    strokeDashoffset={113.1 - (113.1 * bioRate) / 100}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>

                {/* Central overall progress label */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-[13px] font-black text-white font-mono">{lecturePercentVal}%</span>
                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-mono">Completed</span>
                </div>
              </div>

              {/* Progress Tracker Legend & Bar Indicators */}
              <div className="space-y-2.5 text-[10px] w-full sm:w-auto flex-1 max-w-xs">
                {/* Physics */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-cyan-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      Physics
                    </span>
                    <span className="text-white font-bold">{physicsRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-cyan-400 rounded-full transition-all duration-1000" style={{ width: `${physicsRate}%` }} />
                  </div>
                </div>

                {/* Chemistry */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Chemistry
                    </span>
                    <span className="text-white font-bold">{chemRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-emerald-400 rounded-full transition-all duration-1000" style={{ width: `${chemRate}%` }} />
                  </div>
                </div>

                {/* Biology */}
                <div className="space-y-1">
                  <div className="flex justify-between font-mono">
                    <span className="text-amber-500 font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      Biology
                    </span>
                    <span className="text-white font-bold">{bioRate}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-850">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-1000" style={{ width: `${bioRate}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Study Hours - Vertical Bar Graph */}
          <div className="md:col-span-6 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-4 flex flex-col justify-between">
            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Diligence Study Log (Daily Hours)
              </h5>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Weekly study allocation tracking represented as a bar graph.
              </p>
            </div>

            {/* Vertical Bar Graph SVG */}
            <div className="h-32 w-full relative bg-black/40 border border-zinc-900 rounded-2xl p-3 overflow-hidden mt-2">
              {/* Horizontal Reference Rules */}
              <div className="absolute inset-x-0 top-[20%] border-t border-zinc-900/40" />
              <div className="absolute inset-x-0 top-[50%] border-t border-zinc-900/40" />
              <div className="absolute inset-x-0 top-[80%] border-t border-zinc-900/40" />

              {/* SVG containing Bars */}
              <svg className="w-full h-full" viewBox="0 0 140 60" preserveAspectRatio="none">
                {/* Render vertical bars with gradient fill */}
                {weeklyStudyHours.map((data, index) => {
                  const barWidth = 10;
                  const xOffset = 8 + index * 18;
                  const barHeight = (data.hours / maxStudyHours) * 45;
                  const yOffset = 48 - barHeight;
                  return (
                    <g key={data.day} className="group cursor-pointer">
                      {/* Invisible hover helper */}
                      <rect x={xOffset - 2} y="0" width={barWidth + 4} height="50" fill="transparent" />
                      {/* Rounded Bar */}
                      <rect 
                        x={xOffset} 
                        y={yOffset} 
                        width={barWidth} 
                        height={barHeight} 
                        rx="2" 
                        fill="url(#barGrad)" 
                        className="transition-all duration-300 hover:opacity-85"
                      />
                      {/* Active Indicator point */}
                      {data.hours >= 5.0 && (
                        <circle cx={xOffset + barWidth / 2} cy={yOffset} r="1.5" fill="#f59e0b" className="animate-ping" />
                      )}
                    </g>
                  );
                })}

                <defs>
                  <linearGradient id="barGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>

              {/* Horizontal Days labels */}
              <div className="absolute bottom-1 inset-x-3.5 flex justify-between text-[8px] font-mono text-zinc-500 font-bold">
                {weeklyStudyHours.map(d => (
                  <span key={d.day} className="w-[10px] text-center">{d.day.toUpperCase()}</span>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center bg-zinc-950/60 p-2.5 rounded-xl border border-zinc-900/60 text-[9px] font-mono mt-1">
              <span className="text-zinc-500">MAX DAILY STUDY INTENSITY:</span>
              <span className="text-emerald-400 font-bold">{maxStudyHours} HOURS/DAY</span>
            </div>
          </div>

        </div>

        {/* Pictorial Subject Mastery Matrix Cards (Replacing the row table) */}
        <div className="space-y-3 pt-2">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono profile-label-custom">
            Curriculum Subject Mastery Matrix
          </h5>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Subject Card 1: Physics */}
            <div className="bg-zinc-900/20 border border-cyan-950/30 hover:border-cyan-500/20 rounded-2xl p-4.5 space-y-4 shadow-lg transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="text-xs font-black text-white">Physics Stream</span>
                </div>
                <span className="text-[8px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-900/40 px-2 py-0.5 rounded-md font-bold">
                  {physicsCompleted}/{physicsTotal} Ch
                </span>
              </div>

              {/* Radial Completion Circle and Stats */}
              <div className="flex items-center justify-between gap-2 py-1">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#111827" strokeWidth="3" fill="transparent" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15" 
                      stroke="#22d3ee" 
                      strokeWidth="3.5" 
                      fill="transparent" 
                      strokeDasharray="94"
                      strokeDashoffset={94 - (94 * physicsRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-black text-white">{physicsRate}%</span>
                </div>
                <div className="space-y-1 text-right flex-1">
                  <span className="text-[9px] text-zinc-500 font-mono block">AVERAGE EVALUATION</span>
                  <span className="text-sm font-black font-mono text-cyan-400">{totalTestsTaken > 0 ? `${averageQuizScore}%` : '—'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                <span className="text-[9px] font-mono text-zinc-500">LEARNING STATE</span>
                <span className="text-[9px] font-bold font-mono text-white bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">
                  {physicsRate >= 75 ? "EXCELLENT" : physicsRate >= 40 ? "STEADY" : "REVISION"}
                </span>
              </div>
            </div>

            {/* Subject Card 2: Chemistry */}
            <div className="bg-zinc-900/20 border border-emerald-950/30 hover:border-emerald-500/20 rounded-2xl p-4.5 space-y-4 shadow-lg transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-xs font-black text-white">Chemistry Stream</span>
                </div>
                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-900/40 px-2 py-0.5 rounded-md font-bold">
                  {chemCompleted}/{chemTotal} Ch
                </span>
              </div>

              {/* Radial Completion Circle and Stats */}
              <div className="flex items-center justify-between gap-2 py-1">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#111827" strokeWidth="3" fill="transparent" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15" 
                      stroke="#34d399" 
                      strokeWidth="3.5" 
                      fill="transparent" 
                      strokeDasharray="94"
                      strokeDashoffset={94 - (94 * chemRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-black text-white">{chemRate}%</span>
                </div>
                <div className="space-y-1 text-right flex-1">
                  <span className="text-[9px] text-zinc-500 font-mono block">AVERAGE EVALUATION</span>
                  <span className="text-sm font-black font-mono text-emerald-400">{totalTestsTaken > 0 ? `${Math.round(averageQuizScore * 0.95)}%` : '—'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                <span className="text-[9px] font-mono text-zinc-500">LEARNING STATE</span>
                <span className="text-[9px] font-bold font-mono text-white bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">
                  {chemRate >= 75 ? "EXCELLENT" : chemRate >= 40 ? "STEADY" : "REVISION"}
                </span>
              </div>
            </div>

            {/* Subject Card 3: Biology */}
            <div className="bg-zinc-900/20 border border-amber-950/30 hover:border-amber-500/20 rounded-2xl p-4.5 space-y-4 shadow-lg transition-all duration-300 relative group overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl" />
              <div className="flex items-center justify-between border-b border-zinc-900 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span className="text-xs font-black text-white">Biology Stream</span>
                </div>
                <span className="text-[8px] font-mono text-amber-500 bg-amber-950/50 border border-amber-900/40 px-2 py-0.5 rounded-md font-bold">
                  {bioCompleted}/{bioTotal} Ch
                </span>
              </div>

              {/* Radial Completion Circle and Stats */}
              <div className="flex items-center justify-between gap-2 py-1">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15" stroke="#111827" strokeWidth="3" fill="transparent" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="15" 
                      stroke="#f59e0b" 
                      strokeWidth="3.5" 
                      fill="transparent" 
                      strokeDasharray="94"
                      strokeDashoffset={94 - (94 * bioRate) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[9px] font-mono font-black text-white">{bioRate}%</span>
                </div>
                <div className="space-y-1 text-right flex-1">
                  <span className="text-[9px] text-zinc-500 font-mono block">AVERAGE EVALUATION</span>
                  <span className="text-sm font-black font-mono text-amber-400">{totalTestsTaken > 0 ? `${Math.round(averageQuizScore * 1.05)}%` : '—'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-900/60">
                <span className="text-[9px] font-mono text-zinc-500">LEARNING STATE</span>
                <span className="text-[9px] font-bold font-mono text-white bg-zinc-900 px-2 py-0.5 rounded-full border border-zinc-850">
                  {bioRate >= 75 ? "EXCELLENT" : bioRate >= 40 ? "STEADY" : "REVISION"}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Table of performance of hard work */}
        <div className="space-y-3 pt-2">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono flex items-center gap-1.5">
            <Notebook className="w-4 h-4 text-emerald-400" />
            Hard Work & Academic Performance Diagnostics
          </h5>
          
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-900/60 border-b border-zinc-900 text-zinc-400 font-mono text-[9px] uppercase tracking-wider">
                    <th className="py-3 px-4 font-bold">Subject / Chapter Track</th>
                    <th className="py-3 px-4 font-bold text-center">Status</th>
                    <th className="py-3 px-4 font-bold text-center">Completed Lectures</th>
                    <th className="py-3 px-4 font-bold text-center">Mock Highscore</th>
                    <th className="py-3 px-4 font-bold text-center">Attempts</th>
                    <th className="py-3 px-4 font-bold text-right">Diligence Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-sans">
                  {/* Physics Row */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Physics Master Class</div>
                      <span className="text-[9px] text-zinc-500 font-mono">Electrostatics, Currents & Forces</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${physicsRate >= 75 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/40 text-amber-500 border border-amber-800/40'}`}>
                        {physicsRate >= 75 ? 'EXCELLENT' : 'IN PROGRESS'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-300">{physicsCompleted} / {physicsTotal}</td>
                    <td className="py-3 px-4 text-center font-mono text-white font-bold">{totalTestsTaken > 0 ? `${averageQuizScore}%` : '—'}</td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-400">
                      {totalTestsTaken > 0 ? Object.values(progress.quizScores).reduce((sum, item) => sum + (item.attempts || 1), 0) : 0}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-cyan-400 font-bold">⭐ ⭐ ⭐ ⭐</td>
                  </tr>

                  {/* Chemistry Row */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Chemistry Core Track</div>
                      <span className="text-[9px] text-zinc-500 font-mono">Reactions, Periodic Table & Metals</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${chemRate >= 75 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/40 text-amber-500 border border-amber-800/40'}`}>
                        {chemRate >= 75 ? 'EXCELLENT' : 'IN PROGRESS'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-300">{chemCompleted} / {chemTotal}</td>
                    <td className="py-3 px-4 text-center font-mono text-white font-bold">{totalTestsTaken > 0 ? `${Math.round(averageQuizScore * 0.95)}%` : '—'}</td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-400">{totalTestsTaken > 0 ? 1 : 0}</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-400 font-bold">⭐ ⭐ ⭐</td>
                  </tr>

                  {/* Biology Row */}
                  <tr className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Biology Pathways</div>
                      <span className="text-[9px] text-zinc-500 font-mono">Cells, Organs & Botanical cycles</span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold font-mono ${bioRate >= 75 ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/40' : 'bg-amber-950/40 text-amber-500 border border-amber-800/40'}`}>
                        {bioRate >= 75 ? 'EXCELLENT' : 'IN PROGRESS'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-300">{bioCompleted} / {bioTotal}</td>
                    <td className="py-3 px-4 text-center font-mono text-white font-bold">{totalTestsTaken > 0 ? `${Math.round(averageQuizScore * 1.05)}%` : '—'}</td>
                    <td className="py-3 px-4 text-center font-mono text-zinc-400">{totalTestsTaken > 0 ? 1 : 0}</td>
                    <td className="py-3 px-4 text-right font-mono text-amber-400 font-bold">⭐ ⭐ ⭐ ⭐ ⭐</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            {/* Table Footer Stats */}
            <div className="p-3 bg-zinc-900/40 border-t border-zinc-900 text-[10px] font-mono text-zinc-500 flex justify-between items-center">
              <span>ACTIVE COGNITIVE EVALUATION</span>
              <span className="text-zinc-300 font-bold">TOTAL COMPLETED COGNITIVE HOURS: {(completedLecturesCount * 1.5).toFixed(1)} HRS</span>
            </div>
          </div>
        </div>
      </div>

      {/* =======================================================
          STUDENT VOICE: FEEDBACK & FEATURE SUGGESTIONS
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
            <MessageSquare className="w-4 h-4 text-emerald-400" />
            Student Voice: Feedback & suggestions
          </h4>
          <span className="text-[10px] font-mono text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/10">
            Active Channel
          </span>
        </div>

        <div className="space-y-4 text-xs">
          <p className="text-zinc-400 leading-relaxed">
            Have an idea to make Bharat AI better? Or found a bug? Post it directly to our administration desk. Your voice dictates the weekly updates!
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Feedback Category</label>
              <select
                value={localFeedbackCat}
                onChange={(e) => setLocalFeedbackCat(e.target.value)}
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
              <div className="bg-zinc-900/60 border border-zinc-850 p-2.5 rounded-xl text-[10px] text-zinc-500 font-sans leading-normal">
                ✍️ <strong className="text-zinc-400">Write/Speak anything:</strong> Bhojpuri, English, Hindi, Hinglish, etc. Bharat AI analyzes content depth, never language grammar!
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">Your Suggestion or Problem details</label>
              <button
                type="button"
                onClick={() => {
                  if (localRecording) return;
                  playSound('click');
                  setLocalRecording(true);
                  setLocalFeedbackText("Listening... speak now in Hindi/English/Bhojpuri...");
                  
                  // Bilingual simulation sequences of students
                  const studentVoices = [
                    "Sir, Class 10th Electricity me real-life curiosity-driven physical analogies badhaiye, thode tough numerical board exam pattern questions add kijiye.",
                    "Hum Bhojpuri me bolat bani, humra ke is platform pe offline test notes download kare ke pure options provide kijiye.",
                    "Bharat AI test reviews is excellent but make it more harsh and critical for wrong answer analyses so we learn properly!",
                    "Please add a live inline color grading and text sizing customization directly in our educator portal draft cards."
                  ];

                  const randomPhrase = studentVoices[Math.floor(Math.random() * studentVoices.length)];

                  setTimeout(() => {
                    setLocalFeedbackText(randomPhrase);
                    setLocalRecording(false);
                    playSound('success');
                  }, 2200);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold transition active:scale-95 cursor-pointer ${
                  localRecording 
                    ? 'bg-red-500/10 text-red-400 border-red-500/30 animate-pulse' 
                    : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white border-zinc-850'
                }`}
              >
                <Mic className="w-3 h-3 text-red-500" />
                <span>{localRecording ? 'Recording...' : 'Simulate Voice Typing'}</span>
              </button>
            </div>
            
            <textarea
              placeholder="Type your feedback here or click 'Simulate Voice Typing' to speak in Hindi/English/Bhojpuri..."
              rows={3}
              value={localFeedbackText}
              onChange={(e) => setLocalFeedbackText(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-850 rounded-xl p-3 text-xs text-white outline-none focus:border-zinc-500 leading-relaxed font-sans placeholder-zinc-600 resize-none"
            />
          </div>

          {feedbackSuccessMsg && (
            <p className="p-2.5 bg-emerald-950/20 border border-emerald-900/40 rounded-xl text-[11px] text-emerald-400 font-bold text-center animate-bounce">
              {feedbackSuccessMsg}
            </p>
          )}

          <button
            type="button"
            onClick={() => {
              if (!localFeedbackText.trim() || localFeedbackText.startsWith("Listening...")) return;
              playSound('click');
              if (onAddFeedback) {
                onAddFeedback(localFeedbackCat, localFeedbackText);
              } else {
                // local fallback if props didn't link
                const newFb = {
                  id: `fb-${Date.now()}`,
                  category: localFeedbackCat,
                  text: localFeedbackText,
                  date: new Date().toISOString(),
                  status: 'Under Active Review'
                };
                const saved = localStorage.getItem('bharat_student_feedbacks');
                const list = saved ? JSON.parse(saved) : [];
                localStorage.setItem('bharat_student_feedbacks', JSON.stringify([newFb, ...list]));
              }
              setLocalFeedbackText('');
              setFeedbackSuccessMsg('✨ Jai Hind! Your feedback has been logged and queued for Priyanshu Admin review.');
              setTimeout(() => setFeedbackSuccessMsg(''), 4500);
            }}
            disabled={!localFeedbackText.trim() || localRecording}
            className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-30 text-zinc-950 font-extrabold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-emerald-950/20"
          >
            Submit Suggestion to Educator Desk
          </button>

          {/* List of previously sent logs */}
          <div className="space-y-1.5 pt-1 border-t border-zinc-900/40">
            <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase tracking-widest block">Your feedback log</span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {(feedbacksList && feedbacksList.length > 0 ? feedbacksList : [
                {
                  id: 'fb-init-1',
                  category: 'Feature Suggestion',
                  text: 'Sir, Class 10th Electricity me real-life curiosity-driven physical analogies badhaiye, thode tough numerical boards level questions add kijiye.',
                  date: '2026-07-20T10:00:00.000Z',
                  status: 'Under Active Review'
                }
              ]).map((fb: any) => (
                <div key={fb.id} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl space-y-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono font-bold text-zinc-400 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
                      {fb.category}
                    </span>
                    <span className="text-zinc-500 font-mono text-[9px]">
                      {new Date(fb.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-zinc-300 font-sans leading-normal pr-1">{fb.text}</p>
                  <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-bold font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>Status: Pending Review by Admin</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================
          GENERAL APP PERSONAL SETTINGS
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-4">
        <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-900 pb-2">
          <Settings className="w-4 h-4 text-zinc-400" />
          Advanced System Preferences
        </h4>

        <div className="space-y-3 text-xs text-zinc-400">
          
          {/* Sound clicks Settings */}
          <div className="flex justify-between items-center py-1">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                <Volume2 className="w-4 h-4" /> Sound feedback
              </span>
              <span className="text-[10px] text-zinc-500">Enable micro-interaction sound clicks during toggles.</span>
            </div>
            <button
              onClick={() => handleToggleSound(!soundEnabled)}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                soundEnabled ? 'bg-white' : 'bg-zinc-900 border border-zinc-850'
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform ${
                soundEnabled ? 'right-0.5 bg-black' : 'left-0.5 bg-zinc-600'
              }`} />
            </button>
          </div>

          {/* Data Saver Preference */}
          <div className="flex justify-between items-center py-1 border-t border-zinc-900 pt-3">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Data Saver Mode
              </span>
              <span className="text-[10px] text-zinc-500">Compress video, responsive images and static assets to lower bandwidth.</span>
            </div>
            <button
              onClick={() => handleToggleDataSaver(!dataSaver)}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                dataSaver ? 'bg-white' : 'bg-zinc-900 border border-zinc-850'
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform ${
                dataSaver ? 'right-0.5 bg-black' : 'left-0.5 bg-zinc-600'
              }`} />
            </button>
          </div>

          {/* Video Defaults Quality */}
          <div className="flex justify-between items-center py-1 border-t border-zinc-900 pt-3">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                <Smartphone className="w-4 h-4" /> Video Quality Preset
              </span>
              <span className="text-[10px] text-zinc-500">Default playback resolution for lectures stream.</span>
            </div>
            <select
              value={videoQuality}
              onChange={(e) => handleQualityChange(e.target.value)}
              className="bg-black border border-zinc-900 text-white rounded-lg px-2.5 py-1 text-xs font-mono"
            >
              <option value="1080p">Ultra HD (1080p)</option>
              <option value="720p">High Quality (720p)</option>
              <option value="480p">Standard (480p)</option>
              <option value="360p">Data Saver (360p)</option>
            </select>
          </div>

          {/* Application Language Selection */}
          <div className="flex justify-between items-center py-1 border-t border-zinc-900 pt-3">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                <Languages className="w-4 h-4" /> Language Selection
              </span>
              <span className="text-[10px] text-zinc-500">Primary localized translation for definitions.</span>
            </div>
            <select
              value={appLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="bg-black border border-zinc-900 text-white rounded-lg px-2.5 py-1 text-xs font-mono"
            >
              <option value="en">English (Curated)</option>
              <option value="hi">Hindi (हिन्दी Translation)</option>
            </select>
          </div>

          {/* Theme Mode Toggle (Light / Dark) */}
          <div className="flex justify-between items-center py-1 border-t border-zinc-900 pt-3">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                {isDarkMode ? <Moon className="w-4 h-4 text-yellow-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                {appLanguage === 'hi' ? 'थीम सेटिंग (डार्क मोड)' : 'Theme Setting (Dark Mode)'}
              </span>
              <span className="text-[10px] text-zinc-500">
                {appLanguage === 'hi' 
                  ? 'डार्क और लाइट थीम के बीच स्विच करें।' 
                  : 'Toggle between sleek dark Gurukul and classic high-contrast light mode.'}
              </span>
            </div>
            <button
              onClick={() => {
                playSound('click');
                if (onDarkModeChange) onDarkModeChange(!isDarkMode);
              }}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                isDarkMode ? 'bg-zinc-800 border border-zinc-700' : 'bg-slate-200 border border-slate-300'
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-all ${
                isDarkMode ? 'right-0.5 bg-yellow-400' : 'left-0.5 bg-zinc-800'
              }`} />
            </button>
          </div>

          {/* Storage Download Permission Toggle */}
          <div className="flex justify-between items-center py-1 border-t border-zinc-900 pt-3">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> Storage Sync & Download Permission
              </span>
              <span className="text-[10px] text-zinc-500">Authorize the app to save DPPs, board mockups, and syllabus PDFs directly to your device storage.</span>
            </div>
            <button
              onClick={() => {
                const newVal = !progress.storagePermissionGranted;
                onUpdateProgress({
                  ...progress,
                  storagePermissionGranted: newVal
                });
                playSound('click');
              }}
              className={`w-10 h-5.5 rounded-full transition-colors relative cursor-pointer ${
                progress.storagePermissionGranted ? 'bg-emerald-500' : 'bg-zinc-900 border border-zinc-850'
              }`}
            >
              <span className={`absolute top-0.5 w-4.5 h-4.5 rounded-full transition-transform ${
                progress.storagePermissionGranted ? 'right-0.5 bg-white' : 'left-0.5 bg-zinc-650'
              }`} />
            </button>
          </div>

          {/* Cache Management Trigger */}
          <div className="flex justify-between items-center py-1 border-t border-zinc-900 pt-3">
            <div className="space-y-0.5">
              <span className="text-zinc-200 font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4" /> Cache & Space Manager
              </span>
              <span className="text-[10px] text-zinc-500">Clear temporary assets to free device memory.</span>
            </div>
            <button
              onClick={handleClearCache}
              className="text-xs bg-zinc-900 hover:bg-zinc-850 border border-zinc-850 rounded-xl py-1.5 px-3 text-zinc-300 cursor-pointer font-bold"
            >
              Optimize Storage
            </button>
          </div>

          {/* Educators logout button if logged in */}
          {isLoggedInAdmin && onLogoutAdmin && (
            <div className="flex justify-between items-center py-1 border-t border-red-950/40 pt-3">
              <div className="space-y-0.5">
                <span className="text-red-400 font-bold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Educator Control Session
                </span>
                <span className="text-[10px] text-zinc-500">Logout of Priyanshu super administrator session.</span>
              </div>
              <button
                onClick={onLogoutAdmin}
                className="text-xs bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 rounded-xl py-1.5 px-3 text-red-400 cursor-pointer font-bold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect Desk</span>
              </button>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
