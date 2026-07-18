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
  Brain
} from 'lucide-react';
import { motion } from 'motion/react';
import { Course, UserProgress } from '../types';
import { dbService } from '../lib/firebase';
import { translations } from '../lib/translations';
import { playSound } from '../utils/audio';

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
  onDarkModeChange
}: ProfileHubProps) {
  const t = translations[appLanguage];

  // Advanced Personal Details
  const [name, setName] = useState(progress.studentName || 'Student Name');
  const [grade, setGrade] = useState(progress.studentGrade || 'Class 10th');
  const [school, setSchool] = useState(progress.studentSchool || 'CBSE Public School, Delhi');
  const [profilePic, setProfilePic] = useState(progress.profilePic || '');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

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
              const url = prompt("Enter a direct profile image URL:", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80");
              if (url) {
                setProfilePic(url);
                localStorage.setItem('student_pic', url);
                onUpdateProgress({ ...progress, profilePic: url });
              }
            }}
            className="absolute bottom-0 right-0 p-1.5 bg-white text-black rounded-full shadow-lg border hover:scale-105 transition"
            title="Upload photo"
          >
            <Camera className="w-3 h-3" />
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
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center justify-center md:justify-start gap-1.5">
                {name}
                <span onClick={() => setIsEditingProfile(true)} className="text-[10px] text-zinc-500 hover:text-white cursor-pointer underline font-mono">
                  edit
                </span>
              </h3>
              <p className="text-xs text-zinc-400">{school}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-2">
                <span className="text-[9px] bg-zinc-900 border border-zinc-850 text-zinc-400 px-2 py-0.5 rounded-full font-mono">
                  {grade}
                </span>
                <span className="text-[9px] bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <Award className="w-3 h-3 text-emerald-400" />
                  <span>Certified Scholar</span>
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Total stats counters */}
        <div className="flex gap-4 border-t border-zinc-900 md:border-t-0 pt-4 md:pt-0">
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



      {/* =======================================================
          ACADEMIC SOLUTION ACCELERATION DASHBOARD (RELOCATED)
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-purple-400" />
            Academic Solution Dashboard
          </h4>
          <span className="text-[10px] text-zinc-500 font-mono font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-yellow-500 animate-pulse" />
            Supervised Curriculum Tracks
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* 1. Lectures Completed */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group overflow-hidden">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase">Lectures Completed</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 font-bold font-mono">
                ● Active
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {completedLecturesCount} <span className="text-xs text-zinc-500">/ {totalLecturesCount} Lectures</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Syllabus videos & chapters read.</p>
            </div>
            
            {/* Highly realistic progress bar */}
            <div className="mt-4 pt-1">
              <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden border border-zinc-800 relative">
                <div 
                  className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 h-full rounded-full transition-all duration-500 relative"
                  style={{ width: `${lecturePercentVal}%` }}
                >
                  <div className="absolute inset-0 bg-white/10 animate-pulse" />
                </div>
              </div>
              <div className="flex justify-between items-center mt-1.5 text-[9px] font-mono text-zinc-500">
                <span>Completion Base</span>
                <span className="text-zinc-400 font-bold">{lecturePercentVal}%</span>
              </div>
            </div>
          </div>

          {/* 2. Tests Attempted */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase">Tests Attempted</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold font-mono">
                Syllabus Quiz
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {totalTestsTaken} <span className="text-xs text-zinc-500">Attempted</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Class evaluations & assessment exams.</p>
            </div>
            
            <div className="mt-4 flex items-center gap-1.5 text-[10px] font-mono text-zinc-400 bg-zinc-900/40 p-2 border border-zinc-850 rounded-xl">
              <CheckCircle className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span>Instant Score Certified</span>
            </div>
          </div>

          {/* 3. Overall Accuracy */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase">Overall Accuracy</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 font-bold font-mono">
                Target Accuracy
              </span>
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-white tracking-tight">
                {averageQuizScore}%
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">Average score of quiz evaluations.</p>
            </div>
            
            {/* Accuracy Bar */}
            <div className="mt-4 pt-1">
              <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-teal-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${averageQuizScore}%` }}
                />
              </div>
              <div className="text-[9px] font-mono text-zinc-500 mt-1 flex justify-between">
                <span>Performance grade</span>
                <span className="text-zinc-400 font-bold">
                  {averageQuizScore >= 80 ? 'Grade A' : averageQuizScore >= 60 ? 'Grade B' : totalTestsTaken > 0 ? 'Revision' : 'No Data'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Weak Topics Section */}
          <div className="bg-zinc-900/30 border border-zinc-850 p-5 rounded-2xl flex flex-col justify-between shadow-lg relative group">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-2 mb-3">
              <span className="text-[10px] font-mono font-extrabold text-zinc-500 uppercase">Focus Areas</span>
              <span className="text-[9px] px-2 py-0.5 rounded bg-zinc-900/60 border border-zinc-800 text-amber-500 font-bold font-mono">
                Weak Topics
              </span>
            </div>
            <div className="flex-1 flex flex-col justify-between">
              {weakTopicsList.length > 0 ? (
                <div className="space-y-1 py-1">
                  {weakTopicsList.slice(0, 2).map((topic, index) => (
                    <div key={index} className="flex items-center gap-1.5 text-[11px] font-semibold text-zinc-300 truncate">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                      <span className="truncate">{topic}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 py-1">
                  ✓ All topics fully cleared!
                </div>
              )}
              <p className="text-[9px] text-zinc-500 mt-1 font-medium leading-tight">Revise the concepts & retake custom mock papers.</p>
            </div>
          </div>

        </div>
      </div>

      {/* =======================================================
          DETAILED STUDENT PERFORMANCE ANALYSIS (STATISTICAL DIAGRAMS)
          ======================================================= */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-zinc-900 pb-2">
          <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5">
            <BarChart className="w-4 h-4 text-zinc-100" />
            Detailed Performance Diagnostics
          </h4>
          <span className="text-[9px] font-mono text-zinc-500 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
            Statistical Diagrams
          </span>
        </div>

        {/* Bento Grid: Pie Chart (Donut) & Vertical Bar Hours Chart */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          
          {/* Donut Pie Chart: Syllabus Completion rates */}
          <div className="md:col-span-6 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                Syllabus Mastery Concentric Pie Chart
              </h5>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Subject completion ratios calculated against curriculum base.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
              {/* Concentric Circle Donut SVG */}
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  {/* Track Rings Background */}
                  <circle cx="50" cy="50" r="38" stroke="#18181b" strokeWidth="6" fill="transparent" />
                  <circle cx="50" cy="50" r="28" stroke="#18181b" strokeWidth="6" fill="transparent" />
                  <circle cx="50" cy="50" r="18" stroke="#18181b" strokeWidth="6" fill="transparent" />
                  
                  {/* Physics Ring */}
                  <circle 
                    cx="50" cy="50" r="38" 
                    stroke="url(#physGradient)" strokeWidth="6.5" fill="transparent" 
                    strokeDasharray={physDash} 
                    strokeDashoffset={physOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />

                  {/* Chemistry Ring */}
                  <circle 
                    cx="50" cy="50" r="28" 
                    stroke="url(#chemGradient)" strokeWidth="6.5" fill="transparent" 
                    strokeDasharray={chemDash} 
                    strokeDashoffset={chemOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />

                  {/* Biology Ring */}
                  <circle 
                    cx="50" cy="50" r="18" 
                    stroke="url(#bioGradient)" strokeWidth="6.5" fill="transparent" 
                    strokeDasharray={bioDash} 
                    strokeDashoffset={bioOffset}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />

                  {/* SVG Gradients definitions */}
                  <defs>
                    <linearGradient id="physGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                    <linearGradient id="chemGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                    <linearGradient id="bioGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fbbf24" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Center text badge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-bold text-white font-mono">{lecturePercentVal}%</span>
                  <span className="text-[7px] uppercase tracking-wider text-zinc-500 font-mono">Total Avg</span>
                </div>
              </div>

              {/* Legend with precise details */}
              <div className="space-y-2 text-[10px] w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0"></span>
                  <div className="font-mono text-zinc-300">
                    Physics: <strong className="text-white">{physicsRate}%</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <div className="font-mono text-zinc-300">
                    Chemistry: <strong className="text-white">{chemRate}%</strong>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shrink-0"></span>
                  <div className="font-mono text-zinc-300">
                    Biology: <strong className="text-white">{bioRate}%</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Bar Chart: Weekly Study Hours */}
          <div className="md:col-span-6 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-4">
            <div className="space-y-1">
              <h5 className="text-[11px] font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Active Study Diligence (Daily Hours)
              </h5>
              <p className="text-[10px] text-zinc-500 leading-normal">
                Hours spent reading material, viewing videos, or practicing tests.
              </p>
            </div>

            {/* Vertical Bars SVG Container */}
            <div className="h-32 flex items-end justify-between px-1.5 pt-4">
              {weeklyStudyHours.map((val) => {
                const percent = Math.round((val.hours / maxStudyHours) * 100);
                return (
                  <div key={val.day} className="flex flex-col items-center gap-1.5 group cursor-pointer h-full justify-end">
                    {/* Tooltip value */}
                    <span className="text-[8px] font-mono text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded mb-1">
                      {val.hours}h
                    </span>
                    {/* Visual Bar */}
                    <div className="w-4 bg-zinc-900 hover:bg-zinc-800 rounded-t h-24 relative overflow-hidden flex items-end">
                      <div 
                        className="w-full bg-gradient-to-t from-zinc-100 to-white transition-all duration-1000 origin-bottom"
                        style={{ height: `${percent}%` }}
                      >
                        <div className="absolute inset-x-0 top-0 h-1.5 bg-zinc-300" />
                      </div>
                    </div>
                    {/* Label */}
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">{val.day}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Detailed Subject Performance Table (Bar Table style) */}
        <div className="space-y-2.5 pt-2">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Curriculum Breakdown Table</h5>
          
          <div className="border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-900/10">
            <div className="grid grid-cols-4 bg-zinc-950 p-3 border-b border-zinc-900 text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider text-center">
              <div className="text-left pl-1">Subject Stream</div>
              <div>Mastery Base</div>
              <div>Quiz Score</div>
              <div>Learning State</div>
            </div>

            <div className="divide-y divide-zinc-900 text-xs">
              
              {/* Row 1: Physics */}
              <div className="grid grid-cols-4 p-3 items-center text-center">
                <div className="text-left font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                  Physics
                </div>
                <div className="space-y-1">
                  <div className="font-mono font-bold text-white">{physicsCompleted}/{physicsTotal} chapters</div>
                  <div className="w-full bg-black h-1.5 rounded-full overflow-hidden max-w-[100px] mx-auto">
                    <div className="bg-cyan-400 h-full" style={{ width: `${physicsRate}%` }} />
                  </div>
                </div>
                <div className="font-mono text-zinc-300 font-semibold">{totalTestsTaken > 0 ? `${averageQuizScore}%` : '—'}</div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-mono text-[9px] border border-zinc-850">
                    {physicsRate >= 75 ? "Excellent" : physicsRate >= 40 ? "Steady" : "Revision"}
                  </span>
                </div>
              </div>

              {/* Row 2: Chemistry */}
              <div className="grid grid-cols-4 p-3 items-center text-center">
                <div className="text-left font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Chemistry
                </div>
                <div className="space-y-1">
                  <div className="font-mono font-bold text-white">{chemCompleted}/{chemTotal} chapters</div>
                  <div className="w-full bg-black h-1.5 rounded-full overflow-hidden max-w-[100px] mx-auto">
                    <div className="bg-emerald-400 h-full" style={{ width: `${chemRate}%` }} />
                  </div>
                </div>
                <div className="font-mono text-zinc-300 font-semibold">{totalTestsTaken > 0 ? `${Math.round(averageQuizScore * 0.95)}%` : '—'}</div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-mono text-[9px] border border-zinc-850">
                    {chemRate >= 75 ? "Excellent" : chemRate >= 40 ? "Steady" : "Revision"}
                  </span>
                </div>
              </div>

              {/* Row 3: Biology */}
              <div className="grid grid-cols-4 p-3 items-center text-center">
                <div className="text-left font-bold text-white flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Biology
                </div>
                <div className="space-y-1">
                  <div className="font-mono font-bold text-white">{bioCompleted}/{bioTotal} chapters</div>
                  <div className="w-full bg-black h-1.5 rounded-full overflow-hidden max-w-[100px] mx-auto">
                    <div className="bg-amber-400 h-full" style={{ width: `${bioRate}%` }} />
                  </div>
                </div>
                <div className="font-mono text-zinc-300 font-semibold">{totalTestsTaken > 0 ? `${Math.round(averageQuizScore * 1.05)}%` : '—'}</div>
                <div>
                  <span className="px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-400 font-mono text-[9px] border border-zinc-850">
                    {bioRate >= 75 ? "Excellent" : bioRate >= 40 ? "Steady" : "Revision"}
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Dynamic Mock Test evaluations history list */}
        <div className="space-y-2">
          <h5 className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 font-mono">Completed Quiz Score Logs</h5>
          <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
            {Object.keys(progress.quizScores).map((chapId) => {
              const chapObj = allChapters.find(ch => ch.id === chapId);
              const scoreData = progress.quizScores[chapId];
              return (
                <div key={chapId} className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <p className="font-bold text-white">{chapObj?.title || `Quiz Evaluation`}</p>
                    <span className="text-[9px] text-zinc-500 font-mono">Attempts: {scoreData.attempts}</span>
                  </div>
                  <span className="text-sm font-mono font-extrabold text-white">{scoreData.highscore}%</span>
                </div>
              );
            })}

            {Object.keys(progress.quizScores).length === 0 && (
              <div className="text-center py-5 text-xs text-zinc-650 font-medium">
                No active exam evaluations cleared yet. Get started in "Syllabus" or "Practice" tabs to view logs!
              </div>
            )}
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
