import React, { useState } from 'react';
import { 
  Settings, 
  Layers, 
  Database, 
  Globe, 
  Eye, 
  EyeOff, 
  BookOpen, 
  Plus, 
  Trash2, 
  Youtube, 
  FileText, 
  Mail, 
  ArrowUp, 
  ArrowDown, 
  Save, 
  Check, 
  RotateCcw,
  Sliders,
  Type,
  Square,
  Sparkles,
  Lock,
  Search,
  Upload,
  Cloud,
  Link2
} from 'lucide-react';
import { Course, Chapter, ChapterSection, AppCustomization, Flashcard, QuizQuestion, StudentAnalysisRecord, OwnerProfile } from '../types';
import { playSound } from '../utils/audio';

interface AdminPortalProps {
  courses: Course[];
  onUpdateCourses: (newCourses: Course[]) => void;
  customization: AppCustomization;
  onUpdateCustomization: (newCustom: AppCustomization) => void;
  isLiveEditing: boolean;
  onToggleLiveEditing: () => void;
  onClose: () => void;
  studentAnalysisRecords?: StudentAnalysisRecord[];
  onUpdateStudentAnalysisRecords?: (records: StudentAnalysisRecord[]) => void;
  progress?: any;
  onUpdateProgress?: (updatedProgress: any) => void;
  ownerProfile?: OwnerProfile;
  onUpdateOwnerProfile?: (profile: OwnerProfile) => void;
}

export default function AdminPortal({
  courses,
  onUpdateCourses,
  customization,
  onUpdateCustomization,
  isLiveEditing,
  onToggleLiveEditing,
  onClose,
  studentAnalysisRecords = [],
  onUpdateStudentAnalysisRecords,
  progress,
  onUpdateProgress,
  ownerProfile,
  onUpdateOwnerProfile
}: AdminPortalProps) {
  const [activeSubTab, setActiveSubTab] = useState<'layout' | 'courses' | 'connections' | 'raw-json' | 'apk-releases' | 'student-analysis' | 'owner-profile'>('layout');
  
  const handleStatusChange = (recordId: string, status: 'approved' | 'denied' | 'pending') => {
    playSound('click');
    if (onUpdateStudentAnalysisRecords) {
      const updated = studentAnalysisRecords.map(r => r.id === recordId ? { ...r, status } : r);
      onUpdateStudentAnalysisRecords(updated);
    }
  };
  
  // APK Releases State
  const [apkVersion, setApkVersion] = useState('v2.1.0');
  const [apkSize, setApkSize] = useState(48);
  const [apkNotes, setApkNotes] = useState('Includes Class 11-12 Advanced Kinematics, Organic Chemistry synthesis cards, offline video caching, and optimized referral engine.');
  const [apkUrl, setApkUrl] = useState('https://github.com/curiousbharat/android/releases/download/v2.1.0/CuriousBharat_v2.1.0.apk');
  const [releases, setReleases] = useState([
    { version: 'v2.0.0', size: 72, notes: 'Master Class 9-10 science board games, real-time community chat forums, and local offline cache storage.', date: '2026-06-15', url: 'https://github.com/curiousbharat/android/releases/download/v2.0.0/CuriousBharat_v2.0.0.apk' },
    { version: 'v1.5.0', size: 32, notes: 'Added voice-to-text NCERT descriptive answers checker and local streak counter updates.', date: '2026-04-10', url: 'https://github.com/curiousbharat/android/releases/download/v1.5.0/CuriousBharat_v1.5.0.apk' }
  ]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(courses[0]?.id || '');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCoursePrice, setNewCoursePrice] = useState('₹499');
  const [newCourseIsPaid, setNewCourseIsPaid] = useState(false);
  const [newCourseUpiId, setNewCourseUpiId] = useState('rst010186@paytm');
  const [newCourseSubject, setNewCourseSubject] = useState<string>('General Science');
  const [newCourseThumbnail, setNewCourseThumbnail] = useState('');
  const [newCourseSpecialFeature, setNewCourseSpecialFeature] = useState('');
  const [aiFeatureGoal, setAiFeatureGoal] = useState('');
  const [isGeneratingFeature, setIsGeneratingFeature] = useState(false);

  // New chapter inputs
  const [newChapTitle, setNewChapTitle] = useState('');
  const [newChapDesc, setNewChapDesc] = useState('');
  const [newChapKeyConcepts, setNewChapKeyConcepts] = useState('Core Theory, Key Fact');
  const [newChapClass, setNewChapClass] = useState<string | number>(10);
  const [newChapSubj, setNewChapSubj] = useState<string>('Physics');
  const [newChapLecture, setNewChapLecture] = useState('');
  const [newChapPdf, setNewChapPdf] = useState('');
  const [newChapDpp, setNewChapDpp] = useState('');

  // New topic inputs
  const [newTopicChapterId, setNewTopicChapterId] = useState('');
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newTopicLecture, setNewTopicLecture] = useState('');
  const [newTopicPdf, setNewTopicPdf] = useState('');
  const [newTopicDpp, setNewTopicDpp] = useState('');

  // Service Linking simulation states
  const [youtubeApiKey, setYoutubeApiKey] = useState('');
  const [driveClientId, setDriveClientId] = useState('');
  const [emailSmtp, setEmailSmtp] = useState('');
  const [isDriveLinked, setIsDriveLinked] = useState(false);
  const [isYoutubeLinked, setIsYoutubeLinked] = useState(false);
  const [isEmailLinked, setIsEmailLinked] = useState(false);

  // Success notifications
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [uploadProgressPercent, setUploadProgressPercent] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');

  const simulateImageUpload = (file: File, callback: (url: string) => void) => {
    setIsUploadingThumbnail(true);
    setUploadProgressPercent(10);
    const destination = ownerProfile?.storageDestination === 'google-drive' ? 'Google Storage Sync' : 'Local Sandbox Storage';
    const email = ownerProfile?.googleStorageEmail || 'rst010186@gmail.com';
    const folder = ownerProfile?.googleDriveFolderId || 'bharat-ai-vault-101';
    
    setUploadStatusText(`Preparing handshake with ${destination}...`);
    
    setTimeout(() => {
      setUploadProgressPercent(35);
      if (ownerProfile?.storageDestination === 'google-drive') {
        setUploadStatusText(`Connecting to Gmail auth node for ${email}...`);
      } else {
        setUploadStatusText(`Allocating disk sectors on local virtual host...`);
      }
    }, 600);

    setTimeout(() => {
      setUploadProgressPercent(65);
      if (ownerProfile?.storageDestination === 'google-drive') {
        setUploadStatusText(`Syncing folder '${folder}' inside Google Drive space...`);
      } else {
        setUploadStatusText(`Compacting binary asset streams...`);
      }
    }, 1300);

    setTimeout(() => {
      setUploadProgressPercent(90);
      setUploadStatusText(`Finalizing secure metadata and caching CDN link...`);
    }, 2000);

    setTimeout(() => {
      setUploadProgressPercent(100);
      setIsUploadingThumbnail(false);
      setUploadStatusText('');
      
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          callback(reader.result);
          playSound('success');
          showSuccess(`Uploaded & synced to ${ownerProfile?.storageDestination === 'google-drive' ? 'Google Drive' : 'Local Storage'} successfully!`);
        }
      };
      reader.readAsDataURL(file);
    }, 2700);
  };

  // 1. Layout Adjustments
  const handleBrandingChange = (key: keyof AppCustomization, val: any) => {
    onUpdateCustomization({
      ...customization,
      [key]: val
    });
    showSuccess(`Updated ${key} successfully!`);
  };

  const reorderElement = (idx: number, direction: 'up' | 'down') => {
    const arr = [...customization.elementOrdering];
    if (direction === 'up' && idx > 0) {
      const temp = arr[idx];
      arr[idx] = arr[idx - 1];
      arr[idx - 1] = temp;
    } else if (direction === 'down' && idx < arr.length - 1) {
      const temp = arr[idx];
      arr[idx] = arr[idx + 1];
      arr[idx + 1] = temp;
    }
    onUpdateCustomization({
      ...customization,
      elementOrdering: arr
    });
    showSuccess('Reordered layout components!');
  };

  // 2. Course Creation
  const handleAddCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: newCourseTitle,
      description: `Custom courses tailored for advanced scientific study. Join our virtual classroom now.`,
      isPaid: newCourseIsPaid,
      price: newCourseIsPaid ? newCoursePrice : '0',
      upiId: newCourseIsPaid ? newCourseUpiId : undefined,
      subject: newCourseSubject,
      thumbnailUrl: newCourseThumbnail || undefined,
      specialAIFeature: newCourseSpecialFeature || undefined,
      chapters: []
    };

    onUpdateCourses([...courses, newCourse]);
    setSelectedCourseId(newCourse.id);
    setNewCourseTitle('');
    setNewCourseIsPaid(false);
    setNewCourseUpiId('rst010186@paytm');
    setNewCourseThumbnail('');
    setNewCourseSpecialFeature('');
    setAiFeatureGoal('');
    showSuccess(`Created Course: "${newCourse.title}"`);
  };

  const handleGenerateSpecialFeature = async () => {
    if (!newCourseTitle.trim()) {
      alert('Please fill in the Course Title first to help the AI contextualize.');
      return;
    }
    setIsGeneratingFeature(true);
    try {
      const response = await fetch('/api/generate-batch-features', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newCourseTitle,
          subject: newCourseSubject,
          promptGoal: aiFeatureGoal
        })
      });
      const data = await response.json();
      setNewCourseSpecialFeature(data.text || '');
      showSuccess('AI special features generated!');
    } catch (err) {
      console.error(err);
      setNewCourseSpecialFeature(
        `• ⚡ Kalu Sir's 10-Second Speed Formulas\n• 🎮 Interactive NCERT Board Game Challenges\n• 🏆 Weekly Academic Leaderboard & Rank list`
      );
    } finally {
      setIsGeneratingFeature(false);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    if (window.confirm('Delete this entire course and all its chapters?')) {
      const remaining = courses.filter(c => c.id !== courseId);
      onUpdateCourses(remaining);
      if (selectedCourseId === courseId && remaining.length > 0) {
        setSelectedCourseId(remaining[0].id);
      }
      showSuccess('Course removed successfully');
    }
  };

  // 3. Chapter Addition
  const handleAddChapter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChapTitle.trim()) return;

    const selectedCourse = courses.find(c => c.id === selectedCourseId);
    if (!selectedCourse) return;

    const newChapter: Chapter = {
      id: `chap-${Date.now()}`,
      title: newChapTitle,
      description: newChapDesc || 'A newly created chapter section loaded with visual aids and test guides.',
      classLevel: newChapClass,
      subject: newChapSubj,
      readingTime: '10 mins',
      keyConcepts: newChapKeyConcepts.split(',').map(s => s.trim()).filter(Boolean),
      sections: [
        {
          id: `sec-${Date.now()}-1`,
          title: '1. Primary Chapter Foundation',
          body: 'This is the body text of your new master section. You can customize this by clicking on it directly in Live Edit mode, or using JSON editing options.',
          keyPoints: ['Core fact 1', 'Core fact 2']
        }
      ],
      flashcards: [
        {
          id: `fc-${Date.now()}-1`,
          front: 'What is the primary formula for this scientific concept?',
          back: 'This is the verified solution and breakdown.',
          category: newChapSubj
        }
      ],
      quiz: [
        {
          id: `qz-${Date.now()}-1`,
          question: 'Which statement accurately describes the main mechanism of this chapter?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          correctAnswerIndex: 0,
          explanation: 'This is the conceptual explanation and logical reason.'
        }
      ],
      lectureUrl: newChapLecture || undefined,
      pdfUrl: newChapPdf || undefined,
      dppUrl: newChapDpp || undefined
    };

    const updatedCourses = courses.map(c => {
      if (c.id === selectedCourseId) {
        return {
          ...c,
          chapters: [...c.chapters, newChapter]
        };
      }
      return c;
    });

    onUpdateCourses(updatedCourses);
    setNewChapTitle('');
    setNewChapDesc('');
    setNewChapKeyConcepts('Core Theory, Key Fact');
    setNewChapLecture('');
    setNewChapPdf('');
    setNewChapDpp('');
    showSuccess(`Chapter "${newChapter.title}" added successfully!`);
  };

  const handleAddTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicTitle.trim() || !newTopicChapterId) {
      alert('Please specify a Topic Title and select a Chapter.');
      return;
    }

    const newTopic = {
      id: `topic-${Date.now()}`,
      title: newTopicTitle,
      description: newTopicDesc || 'A topic study guide with active learning materials.',
      sections: [
        {
          id: `sec-t-${Date.now()}-1`,
          title: '1. Topic Fundamentals',
          body: 'This is the body of your topic material. In accordance with the requested scope, practice tests and lectures are specific to this topic!',
          keyPoints: ['Topic key fact 1', 'Topic key fact 2']
        }
      ],
      flashcards: [
        {
          id: `fc-t-${Date.now()}-1`,
          front: 'What is a core question on this topic?',
          back: 'This is the verified topic answer.',
          category: 'Revision'
        }
      ],
      quiz: [
        {
          id: `qz-t-${Date.now()}-1`,
          question: 'What is the correct definition or model for this topic?',
          options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
          correctAnswerIndex: 0,
          explanation: 'Step-by-step topic proof explanation.'
        }
      ],
      lectureUrl: newTopicLecture || undefined,
      pdfUrl: newTopicPdf || undefined,
      dppUrl: newTopicDpp || undefined
    };

    const updatedCourses = courses.map(c => {
      return {
        ...c,
        chapters: c.chapters.map(ch => {
          if (ch.id === newTopicChapterId) {
            const currentTopics = ch.topics || [];
            return {
              ...ch,
              topics: [...currentTopics, newTopic]
            };
          }
          return ch;
        })
      };
    });

    onUpdateCourses(updatedCourses);
    setNewTopicTitle('');
    setNewTopicDesc('');
    setNewTopicLecture('');
    setNewTopicPdf('');
    setNewTopicDpp('');
    showSuccess(`Topic "${newTopic.title}" added to selected chapter!`);
  };

  const selectedCourseObj = courses.find(c => c.id === selectedCourseId);

  return (
    <div className="bg-black border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[720px] max-w-6xl mx-auto font-sans text-zinc-300">
      
      {/* LEFT COLUMN: Google AI Studio Styled Control Column */}
      <div className="w-full md:w-[320px] bg-zinc-950 border-r border-zinc-800 p-5 flex flex-col justify-between shrink-0 h-full overflow-y-auto no-scrollbar">
        <div className="space-y-6">
          {/* Admin Header */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-zinc-500" /> Super Admin Portal
            </span>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              Bharat Control Room
            </h2>
            <p className="text-xs text-zinc-500 leading-normal">
              Empower your EdTech startup. Control shapes, courses, and custom layouts in real-time.
            </p>
          </div>

          {/* Quick Stats of Custom Objects */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Total Courses</span>
              <span className="text-lg font-bold text-white font-mono">{courses.length}</span>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800 p-3 rounded-xl">
              <span className="block text-[9px] uppercase tracking-wider text-zinc-500 font-bold">Lectures Link</span>
              <span className="text-lg font-bold text-white font-mono">
                {courses.reduce((acc, c) => acc + c.chapters.filter(ch => ch.lectureUrl).length, 0)}
              </span>
            </div>
          </div>

          {/* Sub Tab Navigation */}
          <div className="space-y-1.5 pt-2">
            <button
              onClick={() => setActiveSubTab('layout')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'layout' ? 'bg-zinc-850 text-white border border-zinc-700' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <Sliders className="w-4 h-4 text-zinc-400" /> UI Layout & Page Editor
            </button>
            <button
              onClick={() => setActiveSubTab('courses')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'courses' ? 'bg-zinc-850 text-white border border-zinc-700' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <Database className="w-4 h-4 text-zinc-400" /> Manage Courses & Chapters
            </button>
            <button
              onClick={() => setActiveSubTab('student-analysis')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'student-analysis' ? 'bg-zinc-850 text-white border border-zinc-700' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <Search className="w-4 h-4 text-zinc-400" /> Student Analysis & Purchases
            </button>
            <button
              onClick={() => setActiveSubTab('owner-profile')}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeSubTab === 'owner-profile' ? 'bg-zinc-850 text-white border border-zinc-700' : 'hover:bg-zinc-900 text-zinc-400'
              }`}
            >
              <Settings className="w-4 h-4 text-zinc-400" /> Owner Profile & Ecosystem
            </button>
          </div>

          {/* Live Interactive Edit Mode Toggle */}
          <div className="bg-zinc-900/40 p-4 border border-zinc-850 rounded-2xl space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-zinc-400" /> Live Inline Editor
            </h4>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              Enable this to click directly on student page titles, descriptions, and paragraphs to edit them with your keyboard.
            </p>
            <button
              onClick={onToggleLiveEditing}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                isLiveEditing 
                  ? 'bg-zinc-100 text-black hover:bg-white shadow' 
                  : 'bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800'
              }`}
            >
              {isLiveEditing ? (
                <>
                  <Check className="w-3.5 h-3.5" /> Live Editing ACTIVE
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5" /> Enable Live Editing
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-zinc-900">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-xl text-xs font-semibold transition cursor-pointer border border-zinc-800"
          >
            ← Back to Student View
          </button>
        </div>
      </div>

      {/* RIGHT COLUMN: Interactive Customizer Panel */}
      <div className="flex-1 bg-black p-6 sm:p-8 overflow-y-auto h-full space-y-6 relative no-scrollbar">
        {successMsg && (
          <div className="absolute top-4 right-4 z-50 bg-white text-black text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-1.5 animate-bounce">
            <Check className="w-4 h-4" /> {successMsg}
          </div>
        )}

        {/* ======================= TAB 1: LAYOUT & THEME CUSTOMIZER ======================= */}
        {activeSubTab === 'layout' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-bold text-white">Visual Layout Customizer</h3>
              <p className="text-xs text-zinc-500 mt-1">Fine-tune the design details: shapes, element order, branding, and font sizes.</p>
            </div>

            {/* Typography and Sizes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                  <Type className="w-3.5 h-3.5" /> Typography Font
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['sans', 'mono', 'serif'] as const).map(font => (
                    <button
                      key={font}
                      onClick={() => handleBrandingChange('fontStyle', font)}
                      className={`py-1.5 rounded text-[10px] font-bold capitalize transition border ${
                        customization.fontStyle === font 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-850'
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                  <Square className="w-3.5 h-3.5" /> Element Shapes
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['none', 'md', 'xl'] as const).map(shape => (
                    <button
                      key={shape}
                      onClick={() => handleBrandingChange('borderRadius', shape === 'none' ? 'none' : shape === 'md' ? 'md' : 'xl')}
                      className={`py-1.5 rounded text-[10px] font-bold capitalize transition border ${
                        customization.borderRadius === (shape === 'none' ? 'none' : shape === 'md' ? 'md' : 'xl') 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-850'
                      }`}
                    >
                      {shape === 'none' ? 'Sharp' : shape === 'md' ? 'Curved' : 'Round'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-2">
                <label className="text-[11px] font-bold uppercase text-zinc-400 flex items-center gap-1">
                  <Sliders className="w-3.5 h-3.5" /> Scale Base Size
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(['small', 'normal', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => handleBrandingChange('fontSize', size)}
                      className={`py-1.5 rounded text-[10px] font-bold capitalize transition border ${
                        customization.fontSize === size 
                          ? 'bg-white text-black border-white' 
                          : 'bg-zinc-900 text-zinc-400 border-transparent hover:bg-zinc-850'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Branding Inputs */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Branding & Hero Text Configuration</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">App Title Name</label>
                  <input
                    type="text"
                    value={customization.brandingTitle}
                    onChange={(e) => handleBrandingChange('brandingTitle', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Slogan Subtitle</label>
                  <input
                    type="text"
                    value={customization.brandingSubtitle}
                    onChange={(e) => handleBrandingChange('brandingSubtitle', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">App Logo Text (Characters e.g. "CB")</label>
                  <input
                    type="text"
                    maxLength={4}
                    value={customization.appLogoText || ''}
                    placeholder="e.g. CB"
                    onChange={(e) => handleBrandingChange('appLogoText', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold text-zinc-500 uppercase">Above Icon Symbol</label>
                  <select
                    value={customization.appLogoIcon || 'graduation-cap'}
                    onChange={(e) => handleBrandingChange('appLogoIcon', e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 cursor-pointer"
                  >
                    <option value="graduation-cap">Graduation Cap</option>
                    <option value="atom">Atom</option>
                    <option value="brain">Brain</option>
                    <option value="sparkles">Sparkles (Animated)</option>
                    <option value="lightbulb">Lightbulb</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Ordering of dashboard elements */}
            <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                  <Layers className="w-4 h-4 text-zinc-500" /> UI Page Section Ordering
                </h4>
                <p className="text-[10px] text-zinc-500 leading-normal mt-1">
                  Reorder exactly how the student-facing dashboard loads. Click Up/Down arrows to shift.
                </p>
              </div>

              <div className="space-y-2">
                {customization.elementOrdering.map((sectionName, idx) => (
                  <div 
                    key={sectionName}
                    className="bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-xl flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-zinc-600 font-mono text-[10px]">#{idx + 1}</span>
                      <span className="font-semibold text-white capitalize">{sectionName.replace('-', ' ')}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => reorderElement(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 hover:bg-zinc-850 rounded text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer transition"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => reorderElement(idx, 'down')}
                        disabled={idx === customization.elementOrdering.length - 1}
                        className="p-1.5 hover:bg-zinc-850 rounded text-zinc-500 hover:text-white disabled:opacity-30 cursor-pointer transition"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ======================= TAB 2: COURSE & CHAPTER MANAGER ======================= */}
        {activeSubTab === 'courses' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-bold text-white">Course Database Control Room</h3>
              <p className="text-xs text-zinc-500 mt-1">Design and publish public Free/Paid courses, link videos, and insert student reading chapters.</p>
            </div>

            {/* Course Builder Forms */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form 1: Add/Select Courses */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                  <Database className="w-4 h-4 text-zinc-500" /> Create / Delete Course
                </h4>
                
                <form onSubmit={handleAddCourse} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Course Title Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Rio General Science Series"
                      value={newCourseTitle}
                      onChange={(e) => setNewCourseTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Syllabus Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. SST, Hindi, Math, Physics"
                        value={newCourseSubject}
                        onChange={(e) => setNewCourseSubject(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-medium"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Monetization</label>
                      <select
                        value={newCourseIsPaid ? 'paid' : 'free'}
                        onChange={(e) => setNewCourseIsPaid(e.target.value === 'paid')}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      >
                        <option value="free">Free Course (Public)</option>
                        <option value="paid">Paid Course (Premium)</option>
                      </select>
                    </div>
                  </div>

                  {newCourseIsPaid && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Premium Price Tag</label>
                        <input
                          type="text"
                          placeholder="e.g. ₹499"
                          value={newCoursePrice}
                          onChange={(e) => setNewCoursePrice(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-zinc-500 uppercase">Custom UPI ID</label>
                        <input
                          type="text"
                          placeholder="e.g. rst010186@paytm"
                          value={newCourseUpiId}
                          onChange={(e) => setNewCourseUpiId(e.target.value)}
                          className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2 bg-zinc-900/40 p-4 border border-zinc-850 rounded-xl">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">
                      🖼️ Course Thumbnail (Google Drive / Local Storage)
                    </label>
                    
                    {/* Drag and Drop Container */}
                    <div 
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const file = e.dataTransfer.files[0];
                        if (file && file.type.startsWith('image/')) {
                          simulateImageUpload(file, (url) => setNewCourseThumbnail(url));
                        }
                      }}
                      className="border border-dashed border-zinc-800 rounded-lg p-5 flex flex-col items-center justify-center text-center hover:border-zinc-700 transition relative overflow-hidden bg-zinc-950/40"
                    >
                      {newCourseThumbnail ? (
                        <div className="space-y-2.5 w-full">
                          <img 
                            src={newCourseThumbnail} 
                            alt="Uploaded Thumbnail Preview" 
                            className="h-28 mx-auto object-cover rounded-lg border border-zinc-800 shadow" 
                          />
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-[9px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-mono font-bold uppercase">
                              {ownerProfile?.storageDestination === 'google-drive' ? '☁️ Google Drive Sync' : '💾 Local Synced'}
                            </span>
                            <button
                              type="button"
                              onClick={() => setNewCourseThumbnail('')}
                              className="text-[9px] text-zinc-500 hover:text-rose-400 underline cursor-pointer"
                            >
                              Reset image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-6 h-6 text-zinc-500 mx-auto animate-bounce" />
                          <div>
                            <p className="text-[11px] font-bold text-zinc-300">Drag & drop your thumbnail image, or click to upload</p>
                            <p className="text-[9px] text-zinc-500 mt-0.5">JPEG, PNG, or WEBP up to 5MB</p>
                          </div>
                          
                          <label className="inline-block px-3 py-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-300 hover:text-white cursor-pointer transition">
                            Browse Local Files
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  simulateImageUpload(file, (url) => setNewCourseThumbnail(url));
                                }
                              }}
                            />
                          </label>
                        </div>
                      )}

                      {/* Loading & Synchronization state bar overlay */}
                      {isUploadingThumbnail && (
                        <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 space-y-3">
                          <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center animate-spin border-t-emerald-400">
                            <Cloud className="w-5 h-5 text-zinc-400" />
                          </div>
                          <div className="text-center space-y-1 w-full max-w-xs">
                            <p className="text-[11px] font-bold text-white tracking-wide">{uploadStatusText}</p>
                            <div className="w-full bg-zinc-900 h-1 rounded-full overflow-hidden border border-zinc-850">
                              <div 
                                className="bg-gradient-to-r from-teal-400 to-emerald-500 h-full rounded-full transition-all duration-300"
                                style={{ width: `${uploadProgressPercent}%` }}
                              />
                            </div>
                            <span className="text-[9px] font-mono font-bold text-emerald-400">{uploadProgressPercent}% synced</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] text-zinc-500 block uppercase font-mono">Thumbnail Direct URL (Optional fallback)</span>
                      <input
                        type="text"
                        placeholder="e.g. https://images.unsplash.com/photo-..."
                        value={newCourseThumbnail}
                        onChange={(e) => setNewCourseThumbnail(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                      />
                    </div>
                  </div>

                  {/* AI BATCH SPECIAL FEATURES GENERATOR */}
                  <div className="bg-zinc-900/60 border border-zinc-800 p-4 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-400 animate-pulse" />
                        AI Batch Feature Generator
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-medium text-zinc-500 uppercase">What's the goal or style of this batch?</label>
                      <input
                        type="text"
                        placeholder="e.g. focus on practical games, daily voice chat tasks"
                        value={aiFeatureGoal}
                        onChange={(e) => setAiFeatureGoal(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-[11px] text-white outline-none focus:border-zinc-650"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleGenerateSpecialFeature}
                      disabled={isGeneratingFeature || !newCourseTitle.trim()}
                      className="w-full py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-[11px] font-bold rounded-lg border border-yellow-500/20 transition cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-40"
                    >
                      {isGeneratingFeature ? (
                        <>
                          <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                          Architecting Features...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3 h-3 text-yellow-400" />
                          Generate Custom AI Features
                        </>
                      )}
                    </button>

                    <div className="space-y-1.5">
                      <label className="text-[9px] font-medium text-zinc-500 uppercase">Special Features (Editable)</label>
                      <textarea
                        rows={3}
                        placeholder="• ⚡ Kalu Sir's 10-Second Speed Formulas&#10;• 🎮 Interactive NCERT Board Game Challenges"
                        value={newCourseSpecialFeature}
                        onChange={(e) => setNewCourseSpecialFeature(e.target.value)}
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-[11px] text-zinc-300 outline-none focus:border-zinc-650 font-mono resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Course Listing
                  </button>
                </form>

                {/* Course List */}
                <div className="border-t border-zinc-900 pt-4 space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase block">Active Course List</label>
                  <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1 no-scrollbar">
                    {courses.map(c => (
                      <div 
                        key={c.id} 
                        onClick={() => setSelectedCourseId(c.id)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition ${
                          selectedCourseId === c.id 
                            ? 'bg-zinc-900 border-zinc-700 text-white font-semibold' 
                            : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-850/80 text-zinc-400'
                        }`}
                      >
                        <span className="truncate max-w-[180px]">{c.title} ({c.isPaid ? 'Paid' : 'Free'})</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCourse(c.id);
                          }}
                          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Selected Course Customizer Panel */}
                {selectedCourseObj && (
                  <div className="border-t border-zinc-900 pt-4 space-y-3">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase block">⚙️ Course Settings Editor</label>
                    <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-3 space-y-2 text-xs">
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-zinc-500 font-bold">Course Title</label>
                        <input
                          type="text"
                          value={selectedCourseObj.title}
                          onChange={(e) => {
                            const updated = courses.map(c => c.id === selectedCourseObj.id ? { ...c, title: e.target.value } : c);
                            onUpdateCourses(updated);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-zinc-500"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-zinc-500 font-bold">Price</label>
                          <input
                            type="text"
                            value={selectedCourseObj.price}
                            onChange={(e) => {
                              const updated = courses.map(c => c.id === selectedCourseObj.id ? { ...c, price: e.target.value } : c);
                              onUpdateCourses(updated);
                            }}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] uppercase text-zinc-500 font-bold">UPI ID</label>
                          <input
                            type="text"
                            value={selectedCourseObj.upiId || ''}
                            placeholder="e.g. rst010186@paytm"
                            onChange={(e) => {
                              const updated = courses.map(c => c.id === selectedCourseObj.id ? { ...c, upiId: e.target.value } : c);
                              onUpdateCourses(updated);
                            }}
                            className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] uppercase text-zinc-500 font-bold">Course Thumbnail Image URL</label>
                        <input
                          type="text"
                          value={selectedCourseObj.thumbnailUrl || ''}
                          placeholder="https://images.unsplash.com/..."
                          onChange={(e) => {
                            const updated = courses.map(c => c.id === selectedCourseObj.id ? { ...c, thumbnailUrl: e.target.value } : c);
                            onUpdateCourses(updated);
                          }}
                          className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                        />
                      </div>
                    </div>

                    {/* Nested Subfolders (Chapters & Topics) Explorer */}
                    <div className="space-y-1.5 pt-2">
                      <label className="text-[10px] font-bold text-zinc-400 uppercase block flex items-center gap-1">
                        <span>📁</span> Subfolders (Chapters & Topics) Explorer
                      </label>
                      <div className="bg-zinc-900/40 border border-zinc-850 rounded-xl p-2.5 space-y-2 max-h-[220px] overflow-y-auto no-scrollbar">
                        {selectedCourseObj.chapters.length === 0 ? (
                          <p className="text-[10px] text-zinc-600 italic">No chapters in this course yet.</p>
                        ) : (
                          selectedCourseObj.chapters.map(ch => (
                            <div key={ch.id} className="space-y-1 bg-zinc-950/60 p-2 rounded-lg border border-zinc-900">
                              {/* Chapter header */}
                              <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-300">
                                <span className="truncate max-w-[170px]">📂 {ch.title}</span>
                                <button
                                  onClick={() => {
                                    playSound('click');
                                    const updated = courses.map(c => {
                                      if (c.id === selectedCourseObj.id) {
                                        return {
                                          ...c,
                                          chapters: c.chapters.filter(chap => chap.id !== ch.id)
                                        };
                                      }
                                      return c;
                                    });
                                    onUpdateCourses(updated);
                                  }}
                                  className="text-[9px] text-zinc-600 hover:text-red-400 font-bold transition px-1 py-0.5 rounded cursor-pointer"
                                  title="Delete Chapter Folder"
                                >
                                  Delete
                                </button>
                              </div>
                              
                              {/* Topic child list */}
                              <div className="pl-3.5 space-y-1 border-l border-zinc-850/50">
                                {(!ch.topics || ch.topics.length === 0) ? (
                                  <p className="text-[9px] text-zinc-600 italic">No topic subfolders yet.</p>
                                ) : (
                                  ch.topics.map(tp => (
                                    <div key={tp.id} className="flex items-center justify-between text-[10px] text-zinc-500 hover:text-zinc-400">
                                      <span className="truncate max-w-[150px]">📄 {tp.title}</span>
                                      <button
                                        onClick={() => {
                                          playSound('click');
                                          const updated = courses.map(c => {
                                            if (c.id === selectedCourseObj.id) {
                                              return {
                                                ...c,
                                                chapters: c.chapters.map(chap => {
                                                  if (chap.id === ch.id) {
                                                    return {
                                                      ...chap,
                                                      topics: (chap.topics || []).filter(topic => topic.id !== tp.id)
                                                    };
                                                  }
                                                  return chap;
                                                })
                                              };
                                            }
                                            return c;
                                          });
                                          onUpdateCourses(updated);
                                        }}
                                        className="text-[8px] text-zinc-600 hover:text-red-400 transition cursor-pointer p-0.5"
                                        title="Delete Topic Subfolder"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Form 2: Add Chapters to Selected Course */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <BookOpen className="w-4 h-4 text-zinc-500" /> Add Chapter to "{selectedCourseObj?.title || 'Selected Course'}"
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Inject master study syllabus directly into this course track.</p>
                </div>

                <form onSubmit={handleAddChapter} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Chapter Title Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Life Processes"
                      value={newChapTitle}
                      onChange={(e) => setNewChapTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Chapter Description / Synopsis</label>
                    <textarea
                      placeholder="e.g. Detailed study of biological actions like digestion, circulation, and excretion."
                      value={newChapDesc}
                      onChange={(e) => setNewChapDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Key Concepts (Comma separated)</label>
                    <input
                      type="text"
                      placeholder="e.g. Nutrition, Enzymes, Metabolism"
                      value={newChapKeyConcepts}
                      onChange={(e) => setNewChapKeyConcepts(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Syllabus Subject</label>
                      <input
                        type="text"
                        placeholder="e.g. Geography, Chemistry, English"
                        value={newChapSubj}
                        onChange={(e) => setNewChapSubj(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Grade Level</label>
                      <input
                        type="text"
                        placeholder="e.g. 9, 10, 11, 12, NEET"
                        value={newChapClass}
                        onChange={(e) => setNewChapClass(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1 bg-zinc-950/80 p-3 rounded-xl border border-zinc-900">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                      🔒 My Owned Lecture Embed URL (No Public Copyright Material)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. https://www.youtube.com/embed/your_private_video or your_hosted_video_url"
                      value={newChapLecture}
                      onChange={(e) => setNewChapLecture(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-500 font-mono mt-1"
                    />
                    <p className="text-[9px] text-zinc-500 leading-normal mt-1">
                      <strong>Copyright Guard Policy:</strong> Enter private embed links or video uploads you own. In accordance with Curious Bharat rules, public third-party copyrighted channels are blocked from being embedded here.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Drive Study PDF Link</label>
                      <input
                        type="text"
                        placeholder="Google Drive URL"
                        value={newChapPdf}
                        onChange={(e) => setNewChapPdf(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Drive DPP practice Sheet</label>
                      <input
                        type="text"
                        placeholder="DPP File URL"
                        value={newChapDpp}
                        onChange={(e) => setNewChapDpp(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Chapter to Course
                  </button>
                </form>
              </div>

              {/* Form 3: Add Topics to Selected Chapter */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Sliders className="w-4 h-4 text-zinc-500" /> Add Topic to Chapter
                  </h4>
                  <p className="text-[10px] text-zinc-500 leading-normal mt-0.5">Inject nested topic folders containing custom lectures, notes, and topic-specific practice.</p>
                </div>

                <form onSubmit={handleAddTopic} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Select Target Chapter</label>
                    <select
                      value={newTopicChapterId}
                      onChange={(e) => setNewTopicChapterId(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      required
                    >
                      <option value="">-- Choose Chapter --</option>
                      {selectedCourseObj?.chapters.map(ch => (
                        <option key={ch.id} value={ch.id}>{ch.title}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Topic Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Aerobic Respiration"
                      value={newTopicTitle}
                      onChange={(e) => setNewTopicTitle(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Topic Description</label>
                    <textarea
                      placeholder="e.g. Detailed pathway of oxygen-dependent ATP production in mitochondria."
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      rows={2}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 resize-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                      🔒 Topic Lecture Embed URL (Owned Portal Content)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. YouTube embed link or video URL"
                      value={newTopicLecture}
                      onChange={(e) => setNewTopicLecture(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-zinc-500 font-mono mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Topic Notes PDF Link</label>
                      <input
                        type="text"
                        placeholder="Google Drive PDF URL"
                        value={newTopicPdf}
                        onChange={(e) => setNewTopicPdf(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Topic DPP Sheet Link</label>
                      <input
                        type="text"
                        placeholder="DPP practice file URL"
                        value={newTopicDpp}
                        onChange={(e) => setNewTopicDpp(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" /> Add Topic to Chapter
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* ======================= TAB 3: CLOUD SERVICES CONNECTIONS ======================= */}
        {activeSubTab === 'connections' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-bold text-white">System Integrations & Linking Hub</h3>
              <p className="text-xs text-zinc-500 mt-1">Configure live API synchronization for video embedding, PDF uploads, student emailing, and others.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* YouTube Api card */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-[280px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-red-950/20 text-red-500 border border-red-900/30">
                      <Youtube className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isYoutubeLinked ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {isYoutubeLinked ? '● Connected' : '○ Offline'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">YouTube Integration</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Sync playlists, pull lecture search metrics, and import embedded student sessions directly.
                  </p>
                  
                  <input
                    type="password"
                    placeholder="Enter YouTube V3 API Key"
                    value={youtubeApiKey}
                    onChange={(e) => setYoutubeApiKey(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (youtubeApiKey.trim()) {
                      setIsYoutubeLinked(true);
                      showSuccess('YouTube API connected securely!');
                    }
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-lg border border-zinc-800 transition cursor-pointer"
                >
                  Link YouTube Engine
                </button>
              </div>

              {/* Google Drive card */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-[280px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-blue-950/20 text-blue-400 border border-blue-900/30">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isDriveLinked ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {isDriveLinked ? '● Connected' : '○ Offline'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Google Drive Hub</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Synchronize drive PDFs, upload assignments, and query Class study materials in real-time.
                  </p>
                  
                  <input
                    type="text"
                    placeholder="Enter Drive Client ID"
                    value={driveClientId}
                    onChange={(e) => setDriveClientId(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (driveClientId.trim()) {
                      setIsDriveLinked(true);
                      showSuccess('Google Drive API synchronized!');
                    }
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-lg border border-zinc-800 transition cursor-pointer"
                >
                  Link Drive Storage
                </button>
              </div>

              {/* Email system card */}
              <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl flex flex-col justify-between h-[280px]">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-zinc-900 text-zinc-400 border border-zinc-800">
                      <Mail className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      isEmailLinked ? 'bg-zinc-800 text-white border border-zinc-700' : 'bg-zinc-900 text-zinc-500'
                    }`}>
                      {isEmailLinked ? '● Connected' : '○ Offline'}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Student Email Alerts</h4>
                  <p className="text-[11px] text-zinc-500 leading-normal">
                    Notify students when you upload premium test solutions, mark review reports, or launch fresh courses.
                  </p>
                  
                  <input
                    type="text"
                    placeholder="SMTP server configuration"
                    value={emailSmtp}
                    onChange={(e) => setEmailSmtp(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1.5 text-[10px] text-white outline-none focus:border-zinc-500 font-mono"
                  />
                </div>

                <button
                  onClick={() => {
                    if (emailSmtp.trim()) {
                      setIsEmailLinked(true);
                      showSuccess('SMTP notification engine connected!');
                    }
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-semibold rounded-lg border border-zinc-800 transition cursor-pointer"
                >
                  Link Email Alert System
                </button>
              </div>

            </div>

            {/* Quick API instructions */}
            <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl text-xs space-y-1 text-zinc-400 leading-relaxed">
              <p className="font-bold text-white">💡 Link options for future syllabus expansion</p>
              <p>As you scale your Bharat education startup, you can link standard system nodes directly. All inputs are securely held in local state variables and synchronized with your personal administrator control logs.</p>
            </div>
          </div>
        )}

        {/* ======================= TAB 4: STUDENT ANALYSIS & PURCHASES ======================= */}
        {activeSubTab === ('student-analysis' as any) && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-bold text-white font-sans">Student Purchases & Analysis</h3>
              <p className="text-xs text-zinc-500 mt-1">Review live student registration logs, contact data, and validated payment receipts.</p>
            </div>

            {(!studentAnalysisRecords || studentAnalysisRecords.length === 0) ? (
              <div className="text-center py-20 bg-zinc-950 border border-zinc-900 rounded-2xl text-sm text-zinc-500 font-sans">
                No course purchase logs recorded yet. Active student checkout activations will appear here in real-time.
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studentAnalysisRecords.map((record) => (
                    <div 
                      key={record.id} 
                      className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-4 relative overflow-hidden shadow-lg hover:border-zinc-700 transition"
                    >
                      <div className={`absolute top-0 left-0 w-1.5 h-full ${
                        record.status === 'approved' 
                          ? 'bg-emerald-500' 
                          : record.status === 'denied' 
                            ? 'bg-rose-500' 
                            : 'bg-amber-500'
                      }`}></div>
                      <div className="space-y-1 pl-2">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] text-zinc-500 font-mono block font-bold">
                            🕒 {record.purchasedAt}
                          </span>
                          <span className={`text-[8px] uppercase font-mono font-bold px-1.5 py-0.5 rounded ${
                            record.status === 'approved'
                              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-900'
                              : record.status === 'denied'
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-900'
                                : 'bg-amber-950/80 text-amber-400 border border-amber-900'
                          }`}>
                            {record.status || 'pending'}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white truncate pt-1">
                          {record.studentName}
                        </h4>
                        <p className="text-xs text-zinc-400 truncate">
                          📞 {record.contactDetails}
                        </p>
                      </div>

                      <div className="border-t border-zinc-900 pt-3 space-y-2 text-xs pl-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-500 font-medium">Course:</span>
                          <span className="text-zinc-300 font-bold truncate max-w-[150px]">{record.courseTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500 font-medium">Price Paid:</span>
                          <span className="text-emerald-400 font-mono font-bold">{record.price}</span>
                        </div>
                        <div className="flex justify-between pt-1 border-t border-zinc-900">
                          <span className="text-zinc-500 font-medium">UTR Ref:</span>
                          <span className="text-white font-mono bg-zinc-900 px-1.5 py-0.5 rounded text-[10px]">{record.paymentDetails}</span>
                        </div>

                        {/* Verification Actions */}
                        {(!record.status || record.status === 'pending') ? (
                          <div className="flex gap-2 pt-2 border-t border-zinc-900">
                            <button
                              onClick={() => handleStatusChange(record.id, 'approved')}
                              className="flex-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(record.id, 'denied')}
                              className="flex-1 bg-rose-950 hover:bg-rose-900 text-rose-400 border border-rose-900 py-1 rounded text-[10px] font-bold transition cursor-pointer"
                            >
                              Deny
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-2 pt-2 border-t border-zinc-900">
                            <button
                              onClick={() => handleStatusChange(record.id, 'pending')}
                              className="w-full bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-800 py-1 rounded text-[10px] font-bold transition cursor-pointer text-center"
                            >
                              Reset to Pending
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Analytical breakdown */}
                <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4">
                  <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    📈 Enrollment Diagnostics Overview
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                      <span className="text-xs text-zinc-500 font-medium block">Total Registrations</span>
                      <strong className="text-xl font-bold text-white font-mono">{studentAnalysisRecords.length}</strong>
                    </div>
                    <div className="bg-zinc-900/40 p-4 rounded-xl border border-zinc-900">
                      <span className="text-xs text-zinc-500 font-medium block">Gross Revenue Generated</span>
                      <strong className="text-xl font-bold text-emerald-400 font-mono">
                        ₹{studentAnalysisRecords.reduce((sum, rec) => {
                          const num = parseInt(rec.price.replace(/[^0-9]/g, ''), 10) || 0;
                          return sum + num;
                        }, 0)}
                      </strong>
                    </div>
                    <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-900 flex items-center justify-center">
                      <p className="text-[10px] text-zinc-500 text-left leading-normal">
                        Records are securely retained locally in your secure administrator environment context.
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {/* ======================= TAB 5: APK RELEASES & VERSION CONTROL ======================= */}
        {activeSubTab === 'apk-releases' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3">
              <h3 className="text-xl font-bold text-white">Android APK Releases & Version Control</h3>
              <p className="text-xs text-zinc-500 mt-1">Configure live APK files, specify download links, release notes, and simulate update notifications.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to publish a new APK */}
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl space-y-4 lg:col-span-2">
                <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-400">Publish New Version release</h4>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">Version Code Name</label>
                      <input
                        type="text"
                        placeholder="e.g. v2.1.0"
                        value={apkVersion}
                        onChange={(e) => setApkVersion(e.target.value)}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-semibold text-zinc-500 uppercase">APK Size (Megabytes)</label>
                      <input
                        type="number"
                        placeholder="e.g. 48"
                        value={apkSize}
                        onChange={(e) => setApkSize(Number(e.target.value))}
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">APK Download URL Link</label>
                    <input
                      type="text"
                      placeholder="e.g. https://github.com/..."
                      value={apkUrl}
                      onChange={(e) => setApkUrl(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-semibold text-zinc-500 uppercase">Release Notes & Technical Changelog</label>
                    <textarea
                      placeholder="Describe core updates..."
                      value={apkNotes}
                      onChange={(e) => setApkNotes(e.target.value)}
                      rows={3}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-500 resize-none"
                    />
                  </div>

                  {/* Dynamic update behavior classification */}
                  <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-xl space-y-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-400">Automatic Release Logic Analyzer</span>
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${apkSize < 60 ? 'bg-yellow-400 animate-pulse' : 'bg-rose-400 animate-bounce'}`}></div>
                      <span className="text-xs font-bold text-white">
                        {apkSize < 60 ? 'Silent Background Update Triggered' : 'Polished Alert User Prompt Triggered'}
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      {apkSize < 60 
                        ? `Because the compiled release file size is ${apkSize}MB (below 60MB), the Android OS background services will fetch and install this package silently to prevent any educational flow interruption.`
                        : `Because the compiled release file size is ${apkSize}MB (above 60MB), students will see a polished, full-screen interactive alert asking for confirmation prior to starting the download.`
                      }
                    </p>
                  </div>

                  {/* Local Storage & State Preservation Warning */}
                  <div className="flex items-start gap-3 bg-zinc-950/80 p-3 border border-zinc-900 rounded-xl text-xs text-zinc-400">
                    <input 
                      type="checkbox" 
                      checked 
                      disabled 
                      className="mt-1 accent-zinc-100" 
                    />
                    <div>
                      <strong className="text-white">Student State & Wallet Preservation</strong>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Auto-retains local user progress states, XP levels, referrals, diagnostic scores, bookmarks, and completed chapter logs across update cycles.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (!apkVersion || !apkUrl) return;
                      const newRel = {
                        version: apkVersion,
                        size: apkSize,
                        notes: apkNotes,
                        date: new Date().toISOString().split('T')[0],
                        url: apkUrl
                      };
                      setReleases([newRel, ...releases]);
                      showSuccess(`Published ${apkVersion} update with ${apkSize < 60 ? 'silent background download' : 'user warning prompt'}!`);
                    }}
                    className="w-full py-2.5 bg-white text-black hover:bg-zinc-200 font-extrabold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Upload className="w-4 h-4 text-black" /> Publish Release & Signal Devices
                  </button>
                </div>
              </div>

              {/* Release history feed */}
              <div className="space-y-4">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-zinc-500 block">Release Logs & History</span>
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 no-scrollbar">
                  {releases.map((rel, i) => (
                    <div key={i} className="bg-zinc-950 border border-zinc-850 p-4 rounded-xl space-y-2 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-bold text-white bg-zinc-900 px-2 py-0.5 border border-zinc-800 rounded">
                            {rel.version}
                          </span>
                          <span className="text-[10px] text-zinc-600 font-mono block mt-1.5">
                            📅 {rel.date}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                          {rel.size} MB
                        </span>
                      </div>
                      
                      <p className="text-[11px] text-zinc-400 leading-relaxed font-sans">
                        {rel.notes}
                      </p>

                      <div className="pt-2 border-t border-zinc-900 text-[10px] text-zinc-500">
                        Update mode: <span className="font-bold text-zinc-400">{rel.size < 60 ? 'Silent Automatic' : 'User Prompt Warning'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ======================= TAB 6: OWNER PROFILE & ECOSYSTEM REGULATOR ======================= */}
        {activeSubTab === 'owner-profile' && (
          <div className="space-y-6">
            <div className="border-b border-zinc-800 pb-3 flex justify-between items-center flex-wrap gap-4">
              <div>
                <h3 className="text-xl font-bold text-white">Super Owner Profile & Regulator</h3>
                <p className="text-xs text-zinc-500 mt-1">Manage super-administrator credentials, configure Google storage integrations, and regulate student privileges.</p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Ecosystem Online
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Side: Owner Profile Card (matches student profile style but in Super Admin Gold) */}
              <div className="space-y-6 text-left">
                <div className="bg-zinc-950 border border-zinc-850 rounded-2xl p-6 relative overflow-hidden">
                  {/* Decorative Premium strip */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>
                  
                  <div className="flex flex-col items-center text-center space-y-4 pt-2">
                    <div className="relative group">
                      <img 
                        src={ownerProfile?.avatarUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"} 
                        alt="Owner Avatar" 
                        className="w-24 h-24 rounded-full border-2 border-amber-500 shadow-xl object-cover"
                      />
                    </div>

                    <div>
                      <h4 className="text-base font-extrabold text-white flex items-center justify-center gap-1.5">
                        {ownerProfile?.name || 'Alok Roy Sir'}
                        <span className="text-[9px] uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono font-bold">SUPER OWNER</span>
                      </h4>
                      <p className="text-xs text-zinc-400">{ownerProfile?.instituteName || 'Bharat Science Academy'}</p>
                    </div>

                    <div className="w-full border-t border-zinc-900 pt-4 space-y-3.5 text-left text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Super Admin ID:</span>
                        <span className="text-zinc-300 font-mono text-[11px] font-semibold">{ownerProfile?.email || 'rst010186@gmail.com'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Primary Contact:</span>
                        <span className="text-zinc-300 font-mono text-[11px] font-semibold">{ownerProfile?.contact || '+91 98765 43210'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Global UPI ID:</span>
                        <span className="text-zinc-300 font-mono text-[11px] font-semibold text-amber-400">{ownerProfile?.upiId || 'rst010186@paytm'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-500">Storage Target:</span>
                        <span className="text-emerald-400 font-mono text-[11px] font-bold uppercase">{ownerProfile?.storageDestination === 'google-drive' ? 'Google Drive' : 'Local Storage'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storage Usage Status */}
                <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-500" /> Google Email Storage Capacity
                  </h4>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-zinc-400">rst010186@gmail.com</span>
                      <span className="text-zinc-300 font-bold">12.8 GB / 15.0 GB</span>
                    </div>
                    <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-850">
                      <div className="bg-emerald-500 h-full rounded-full" style={{ width: '85.3%' }}></div>
                    </div>
                    <p className="text-[10px] text-zinc-500 leading-normal">
                      Thumbnails, lecture boards, and DPP notes uploaded by the Super Admin sync instantly with your connected Google Storage space.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Side: Configuration Forms */}
              <div className="lg:col-span-2 space-y-6 text-left">
                
                {/* Section 1: Profile & Academy Credentials */}
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    if (onUpdateOwnerProfile && ownerProfile) {
                      onUpdateOwnerProfile({
                        ...ownerProfile,
                        name: formData.get('name') as string,
                        email: formData.get('email') as string,
                        contact: formData.get('contact') as string,
                        upiId: formData.get('upiId') as string,
                        instituteName: formData.get('instituteName') as string,
                        avatarUrl: formData.get('avatarUrl') as string,
                      });
                      playSound('success');
                      alert("Super Owner Credentials saved successfully!");
                    }
                  }}
                  className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4 text-left"
                >
                  <h4 className="text-xs font-bold uppercase tracking-widest text-amber-400">Edit Admin Profile Settings</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Full Name</label>
                      <input 
                        type="text" 
                        name="name"
                        defaultValue={ownerProfile?.name || 'Alok Roy Sir'} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Super Admin Email ID</label>
                      <input 
                        type="email" 
                        name="email"
                        defaultValue={ownerProfile?.email || 'rst010186@gmail.com'} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Contact Number</label>
                      <input 
                        type="text" 
                        name="contact"
                        defaultValue={ownerProfile?.contact || '+91 98765 43210'} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Payment UPI ID (Global)</label>
                      <input 
                        type="text" 
                        name="upiId"
                        defaultValue={ownerProfile?.upiId || 'rst010186@paytm'} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Institute Name</label>
                      <input 
                        type="text" 
                        name="instituteName"
                        defaultValue={ownerProfile?.instituteName || 'Bharat Science Academy'} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500"
                        required
                      />
                    </div>
                    <div className="space-y-1.5 text-left md:col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Owner Avatar Photo URL</label>
                      <input 
                        type="text" 
                        name="avatarUrl"
                        defaultValue={ownerProfile?.avatarUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'} 
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-amber-500 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button 
                      type="submit"
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer transition"
                    >
                      <Save className="w-4 h-4" /> Save Super Admin Profile
                    </button>
                  </div>
                </form>

                {/* Section 2: Storage Destinations & Google integration */}
                <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Ecosystem Storage regulator</h4>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Default Storage Destination</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateOwnerProfile && ownerProfile) {
                              onUpdateOwnerProfile({ ...ownerProfile, storageDestination: 'local' });
                              playSound('click');
                            }
                          }}
                          className={`p-3.5 rounded-xl border text-left space-y-1 transition ${
                            ownerProfile?.storageDestination === 'local'
                              ? 'bg-zinc-900 border-zinc-750 text-white'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="block text-xs font-extrabold">💾 Local Isolated Storage</span>
                          <span className="block text-[10px] opacity-80 leading-normal">Save notes and boards directly to the application container local disk cache.</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            if (onUpdateOwnerProfile && ownerProfile) {
                              onUpdateOwnerProfile({ ...ownerProfile, storageDestination: 'google-drive' });
                              playSound('click');
                            }
                          }}
                          className={`p-3.5 rounded-xl border text-left space-y-1 transition ${
                            ownerProfile?.storageDestination === 'google-drive'
                              ? 'bg-zinc-900 border-emerald-500/40 text-white ring-1 ring-emerald-500/20'
                              : 'bg-zinc-950/40 border-zinc-900 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          <span className="block text-xs font-extrabold text-emerald-400">☁️ Google Email Storage Integration</span>
                          <span className="block text-[10px] opacity-80 leading-normal">Use Alok Roy Sir's personal Google Email (Drive space) to host thumbnails, notes, and avatars.</span>
                        </button>
                      </div>
                    </div>

                    {ownerProfile?.storageDestination === 'google-drive' && (
                      <div className="bg-zinc-900/60 border border-zinc-850 p-4 rounded-xl space-y-3.5">
                        <h5 className="text-[11px] font-bold uppercase text-emerald-400 tracking-wider">Connected Google Space details</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-bold text-zinc-500 block uppercase">Connected Gmail Address</span>
                            <input 
                              type="text" 
                              value={ownerProfile?.googleStorageEmail || 'rst010186@gmail.com'}
                              onChange={(e) => {
                                if (onUpdateOwnerProfile && ownerProfile) {
                                  onUpdateOwnerProfile({ ...ownerProfile, googleStorageEmail: e.target.value });
                                }
                              }}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                          <div className="space-y-1 text-left">
                            <span className="text-[10px] font-bold text-zinc-500 block uppercase">Google Drive Folder ID</span>
                            <input 
                              type="text" 
                              value={ownerProfile?.googleDriveFolderId || 'bharat-ai-vault-101'}
                              onChange={(e) => {
                                if (onUpdateOwnerProfile && ownerProfile) {
                                  onUpdateOwnerProfile({ ...ownerProfile, googleDriveFolderId: e.target.value });
                                }
                              }}
                              className="w-full bg-black border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Global Privileges Permissions Regulator */}
                <div className="bg-zinc-950 border border-zinc-850 p-6 rounded-2xl space-y-4 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-orange-400">Student Privilege Regulator</h4>
                  
                  <div className="flex items-center justify-between p-4 bg-zinc-900/40 rounded-xl border border-zinc-850 gap-4">
                    <div className="space-y-1 pr-4 text-left">
                      <span className="block text-xs font-extrabold text-white">📥 Student Lecture PDF Download option</span>
                      <span className="block text-[10px] text-zinc-500 leading-normal">
                        Allow students to trigger downloads for syllabus PDFs, lecture notes, and board mockups inside the batch screen (student must authorize storage access first).
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onUpdateOwnerProfile && ownerProfile) {
                          onUpdateOwnerProfile({ ...ownerProfile, allowDownloads: !ownerProfile.allowDownloads });
                          playSound('click');
                        }
                      }}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer shrink-0 ${
                        ownerProfile?.allowDownloads ? 'bg-emerald-500' : 'bg-zinc-800'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          ownerProfile?.allowDownloads ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>

              </div>

            </div>
          </div>
        )}

      </div>

    </div>
  );
}
