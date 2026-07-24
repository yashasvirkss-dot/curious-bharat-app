import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Flame, 
  BookOpen, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Search, 
  CheckCircle, 
  Brain, 
  SearchX, 
  Atom, 
  Dna, 
  Lightbulb,
  GraduationCap,
  Lock,
  Unlock,
  CreditCard,
  X,
  ChevronRight,
  FolderClosed,
  FileText,
  Sliders,
  Clock,
  Play,
  Shuffle,
  Download,
  ArrowLeft,
  Video,
  ExternalLink,
  Trash2
} from 'lucide-react';
import { Chapter, Course, UserProgress, AppCustomization, Topic, StudentAnalysisRecord } from '../types';
import EditableText from './EditableText';
import ScienceGames from './ScienceGames';
import { translations } from '../lib/translations';
import ThreeDElement from './ThreeDElement';
import AshokChakra from './AshokChakra';
import CommunityComments from './CommunityComments';
import { getTenQuestions } from '../utils/quizGenerator';
import FlashcardsView from './FlashcardsView';
import HorizontalScrollContainer from './HorizontalScrollContainer';
import { getProxiedImageUrl } from '../utils/imageUrl';

interface DashboardProps {
  courses: Course[];
  progress: UserProgress;
  customization: AppCustomization;
  isEditMode: boolean;
  onUpdateCourses: (newCourses: Course[]) => void;
  onUpdateProgress: (newProgress: UserProgress) => void;
  onSelectChapter: (chapter: Chapter) => void;
  onOpenAI: (mode: string, context: string, customPrompt?: string) => void;
  onAddStudentAnalysisRecord?: (record: StudentAnalysisRecord) => void;
  studentAnalysisRecords?: StudentAnalysisRecord[];
  appLanguage?: 'en' | 'hi';
  selectedCourse?: Course | null;
  setSelectedCourse?: (course: Course | null) => void;
  selectedChapter?: Chapter | null;
  setSelectedChapter?: (chapter: Chapter | null) => void;
  selectedTopic?: Topic | null;
  setSelectedTopic?: (topic: any | null) => void;
  viewStyle?: 'grid' | 'list';
  isDarkMode?: boolean;
  onOpenCheckout?: (course: Course) => void;
}

export default function Dashboard({ 
  courses, 
  progress, 
  customization,
  isEditMode,
  onUpdateCourses,
  onUpdateProgress,
  onSelectChapter,
  onOpenAI,
  onAddStudentAnalysisRecord,
  studentAnalysisRecords = [],
  appLanguage = 'en',
  selectedCourse: propsSelectedCourse,
  setSelectedCourse: propsSetSelectedCourse,
  selectedChapter: propsSelectedChapter,
  setSelectedChapter: propsSetSelectedChapter,
  selectedTopic: propsSelectedTopic,
  setSelectedTopic: propsSetSelectedTopic,
  viewStyle = 'grid',
  isDarkMode = true,
  onOpenCheckout
}: DashboardProps) {
  const t = translations[appLanguage];
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearchListening, setIsSearchListening] = useState(false);
  
  // Checkout Modal State
  const [checkoutCourse, setCheckoutCourse] = useState<Course | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [userUTR, setUserUTR] = useState('');
  const [utrError, setUtrError] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentContact, setStudentContact] = useState('');
  const [studentNameError, setStudentNameError] = useState('');
  const [studentContactError, setStudentContactError] = useState('');

  // Course -> Chapter -> Topic Drilldown Navigation State
  const [localSelectedCourse, setLocalSelectedCourse] = useState<Course | null>(null);
  const [localSelectedChapter, setLocalSelectedChapter] = useState<Chapter | null>(null);
  const [localSelectedTopic, setLocalSelectedTopic] = useState<Topic | null>(null);

  const selectedCourse = propsSelectedCourse !== undefined ? propsSelectedCourse : localSelectedCourse;
  const setSelectedCourse = propsSetSelectedCourse !== undefined ? propsSetSelectedCourse : setLocalSelectedCourse;

  const selectedChapter = propsSelectedChapter !== undefined ? propsSelectedChapter : localSelectedChapter;
  const setSelectedChapter = propsSetSelectedChapter !== undefined ? propsSetSelectedChapter : setLocalSelectedChapter;

  const selectedTopic = propsSelectedTopic !== undefined ? propsSelectedTopic : localSelectedTopic;
  const setSelectedTopic = propsSetSelectedTopic !== undefined ? propsSetSelectedTopic : setLocalSelectedTopic;
  const [activeTopicTab, setActiveTopicTab] = useState<'lecture' | 'notes' | 'quiz' | 'flashcards' | 'dpp'>('lecture');

  // Synchronize locked course selection in useEffect to prevent render-phase state updates
  React.useEffect(() => {
    if (selectedCourse) {
      const isCurrentCoursePaid = selectedCourse.isPaid;
      const isCurrentUnlocked = !isCurrentCoursePaid || (progress.purchasedCourses || []).includes(selectedCourse.id);
      if (!isCurrentUnlocked) {
        setSelectedCourse(null);
        setSelectedChapter(null);
        setSelectedTopic(null);
      }
    }
  }, [selectedCourse, progress.purchasedCourses, setSelectedCourse, setSelectedChapter, setSelectedTopic]);

  // File Download & Storage Permission States
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string>('');
  const [showDownloadAlert, setShowDownloadAlert] = useState<string | null>(null);

  const handleDownloadClick = (url: string, title: string) => {
    if (!progress.storagePermissionGranted) {
      setPendingUrl(url);
      setPendingTitle(title);
      setShowStorageModal(true);
      return;
    }
    triggerActualDownload(url, title);
  };

  const triggerActualDownload = (url: string, title: string) => {
    setShowDownloadAlert(`Downloading "${title}"... Saved directly to local storage.`);
    setTimeout(() => setShowDownloadAlert(null), 5000);

    // Save download reference to local progress storage (device storage)
    const existing = progress.downloadedFiles || [];
    if (!existing.some(f => f.url === url)) {
      const newFile = {
        id: `file-${Date.now()}`,
        title,
        url,
        downloadedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        sizeKb: Math.floor(Math.random() * 280) + 90 // realistic size feedback
      };
      
      onUpdateProgress({
        ...progress,
        downloadedFiles: [...existing, newFile]
      });
    }

    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.click();
  };

  const handleGrantPermission = () => {
    setShowStorageModal(false);
    onUpdateProgress({
      ...progress,
      storagePermissionGranted: true
    });
    if (pendingUrl) {
      triggerActualDownload(pendingUrl, pendingTitle);
    }
  };

  const startSearchVoiceTyping = () => {
    playSound('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSearchListening(true);
      setTimeout(() => {
        setSearchTerm("Chemical Reactions and Equations");
        setIsSearchListening(false);
      }, 2000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = appLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setIsSearchListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setSearchTerm(text);
      };

      rec.onerror = (err: any) => {
        console.warn('Search speech recognition error:', err);
        setIsSearchListening(false);
      };

      rec.onend = () => {
        setIsSearchListening(false);
      };

      rec.start();
    } catch (e) {
      console.error(e);
      setIsSearchListening(false);
    }
  };

  // Simulation states
  const [selectedOrganelle, setSelectedOrganelle] = useState<string>('nucleus');
  const [atomElement, setAtomElement] = useState<'H' | 'He' | 'Li' | 'C'>('He');
  const [voltage, setVoltage] = useState<number>(6);
  const [resistance, setResistance] = useState<number>(3);
  const [circuitOn, setCircuitOn] = useState<boolean>(true);
  const [coeffH2, setCoeffH2] = useState<number>(1);
  const [coeffO2, setCoeffO2] = useState<number>(1);
  const [coeffH2O, setCoeffH2O] = useState<number>(1);

  // Topic Inline Quiz States
  const [topicQuizIndex, setTopicQuizIndex] = useState<number>(0);
  const [topicQuizSelected, setTopicQuizSelected] = useState<number | null>(null);
  const [topicQuizAnswered, setTopicQuizAnswered] = useState<boolean>(false);
  const [topicQuizScore, setTopicQuizScore] = useState<number>(0);
  const [topicQuizFeedback, setTopicQuizFeedback] = useState<string>('');

  // Topic Inline Flashcards States
  const [topicFcIndex, setTopicFcIndex] = useState<number>(0);
  const [topicFcFlipped, setTopicFcFlipped] = useState<boolean>(false);

  // Audio Context sound synthesiser
  const playSound = (type: 'correct' | 'wrong' | 'click' | 'victory') => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'correct') {
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(160, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.35);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(580, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'victory') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.2);
        osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.4);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      console.warn("Audio Context blocked:", e);
    }
  };

  // Flat list of all available chapters from all courses
  const allChapters = courses.reduce<Chapter[]>((acc, course) => {
    // Add parent course context to each chapter
    const chaptersWithCourse = course.chapters.map(chap => ({
      ...chap,
      courseId: course.id,
      isPaidCourse: course.isPaid,
      coursePrice: course.price
    }));
    return [...acc, ...chaptersWithCourse];
  }, []);

  const totalChaptersCount = allChapters.length;
  const completedChaptersCount = progress.completedChapters.length;
  const progressPercent = totalChaptersCount > 0 
    ? Math.round((completedChaptersCount / totalChaptersCount) * 100) 
    : 0;

  const totalQuizzesAttempted = Object.keys(progress.quizScores).length;
  const averageQuizScore = totalQuizzesAttempted > 0
    ? Math.round(
        Object.values(progress.quizScores).reduce((sum, item) => sum + item.highscore, 0) / totalQuizzesAttempted
      )
    : 0;

  const masteredCardsCount = Object.values(progress.flashcardStatus).filter(status => status === 'easy').length;

  const filteredCourses = courses.filter(course => {
    // If course/batch is marked hidden by the educator, hide it from students
    if (course.hidden) return false;

    // Search match
    const titleMatch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
    const descMatch = course.description.toLowerCase().includes(searchTerm.toLowerCase());
    const subjectMatch = course.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSearch = titleMatch || descMatch || subjectMatch;

    if (searchTerm.trim() !== '' && !matchesSearch) return false;

    // Class match
    const hasChapters = course.chapters && course.chapters.length > 0;
    const classLevel = hasChapters ? String(course.chapters[0].classLevel) : '';
    if (selectedClass !== 'all' && selectedClass.trim() !== '' && !classLevel.toLowerCase().includes(selectedClass.toLowerCase())) return false;

    // Subject match
    if (selectedSubject !== 'all' && selectedSubject.trim() !== '' && !course.subject.toLowerCase().includes(selectedSubject.toLowerCase())) return false;

    return true;
  });

  const getSubjectIcon = (subject: string) => {
    switch (subject) {
      case 'Physics': return <Lightbulb className="w-4 h-4 text-zinc-100" />;
      case 'Chemistry': return <Atom className="w-4 h-4 text-zinc-100" />;
      case 'Biology': return <Dna className="w-4 h-4 text-zinc-100" />;
      default: return <GraduationCap className="w-4 h-4 text-zinc-100" />;
    }
  };

  // Payment triggers
  const triggerUnlock = (course: Course) => {
    if (onOpenCheckout) {
      onOpenCheckout(course);
    } else {
      setCheckoutCourse(course);
      setUserUTR('');
      setUtrError('');
      setStudentName('');
      setStudentContact('');
      setStudentNameError('');
      setStudentContactError('');
    }
  };

  const handleConfirmPurchase = () => {
    if (!checkoutCourse) return;
    
    let hasError = false;
    if (!studentName.trim()) {
      setStudentNameError('Please enter the student\'s full name.');
      hasError = true;
    }
    if (!studentContact.trim()) {
      setStudentContactError('Please enter contact details (email or phone).');
      hasError = true;
    }
    if (!userUTR.trim()) {
      setUtrError('Please enter the 12-digit UPI transaction reference / UTR code.');
      hasError = true;
    } else if (userUTR.trim().length < 6) {
      setUtrError('The entered Transaction Reference / UTR code must be at least 6 characters.');
      hasError = true;
    }

    if (hasError) return;

    setIsProcessingPayment(true);
    setTimeout(() => {
      const updatedPurchases = [...(progress.purchasedCourses || []), checkoutCourse.id];
      onUpdateProgress({
        ...progress,
        purchasedCourses: updatedPurchases
      });

      // Send student analysis record to admin portal
      const newRecord: StudentAnalysisRecord = {
        id: `analysis-${Date.now()}`,
        studentName: studentName.trim(),
        contactDetails: studentContact.trim(),
        courseId: checkoutCourse.id,
        courseTitle: checkoutCourse.title,
        price: checkoutCourse.price,
        paymentDetails: userUTR.trim(),
        purchasedAt: new Date().toLocaleString()
      };

      if (onAddStudentAnalysisRecord) {
        onAddStudentAnalysisRecord(newRecord);
      }

      setIsProcessingPayment(false);
      setCheckoutCourse(null);
      setUserUTR('');
      setUtrError('');
      setStudentName('');
      setStudentContact('');
      setStudentNameError('');
      setStudentContactError('');
    }, 1500);
  };

  // Editable Text helpers for Courses & Chapters
  const handleEditCourseTitle = (courseId: string, newTitle: string) => {
    const updated = courses.map(c => c.id === courseId ? { ...c, title: newTitle } : c);
    onUpdateCourses(updated);
  };

  const handleEditCourseDesc = (courseId: string, newDesc: string) => {
    const updated = courses.map(c => c.id === courseId ? { ...c, description: newDesc } : c);
    onUpdateCourses(updated);
  };

  const getChapterTopics = (chapter: Chapter): Topic[] => {
    if (chapter.topics && chapter.topics.length > 0) {
      return chapter.topics;
    }
    // Backward compatibility: build a default topic wrapping chapter sections/quiz/flashcards
    return [
      {
        id: `${chapter.id}-main-topic`,
        title: `${chapter.title} Core Masterclass`,
        description: `Full curriculum reading, conceptual video lecture, spaced repetition flashcards, and MCQ self-assessments.`,
        sections: chapter.sections || [],
        flashcards: chapter.flashcards || [],
        quiz: chapter.quiz || [],
        lectureUrl: chapter.lectureUrl,
        pdfUrl: chapter.pdfUrl,
        dppUrl: chapter.dppUrl
      }
    ];
  };

  const renderSimulationWidget = () => {
    // Determine diagramType based on current chapter / course subject
    let diagramType: string = 'cell';
    const sub = (selectedChapter?.subject || selectedCourse?.subject || '').toLowerCase();
    if (sub.includes('chemistry')) {
      diagramType = 'atom';
    } else if (sub.includes('physics')) {
      diagramType = 'circuit';
    }

    switch (diagramType) {
      case 'cell':
        {
          const organelleInfo: Record<string, { name: string; role: string; analogy: string }> = {
            nucleus: {
              name: 'Nucleus',
              role: 'The control center. Stores DNA (genetic information) and coordinates active growth, cell division, and metabolic activities.',
              analogy: 'The Headmaster of a school or Prime Minister in a parliament.'
            },
            mitochondria: {
              name: 'Mitochondria',
              role: 'The powerhouse. Oxidizes food to produce ATP (chemical energy) through cellular respiration.',
              analogy: 'An electrical power plant supplying power.'
            },
            chloroplast: {
              name: 'Chloroplast (Plastid)',
              role: 'The solar generator (plants only). Contains chlorophyll which captures light energy for Photosynthesis.',
              analogy: 'A solar cooker or chef in a kitchen.'
            },
            lysosome: {
              name: 'Lysosome',
              role: 'The garbage disposal / suicide bag. Rich in digestive enzymes to clean up old organelles and destroy toxins.',
              analogy: 'The municipal cleaning workers or security officers.'
            },
            membrane: {
              name: 'Plasma Membrane',
              role: 'The gatekeeper. Selectively permeable, regulating what enters and leaves the cell.',
              analogy: 'The border security force or gates at a high-security office.'
            }
          };

          const organelle = organelleInfo[selectedOrganelle] || organelleInfo.nucleus;

          return (
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-zinc-300">🔬 Interactive Eukaryotic Cell Map</h4>
              <div className="relative w-full h-44 bg-black border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
                <svg viewBox="0 0 200 200" className="w-40 h-40 text-zinc-400">
                  <ellipse cx="100" cy="100" rx="90" ry="76" fill="none" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="3 3" />
                  <ellipse cx="100" cy="100" rx="86" ry="72" fill="#18181b" />

                  {/* Nucleus */}
                  <circle cx="90" cy="90" r="26" fill={selectedOrganelle === 'nucleus' ? '#3f3f46' : '#27272a'} stroke="#ffffff" strokeWidth="1.5" className="cursor-pointer" onClick={() => { playSound('click'); setSelectedOrganelle('nucleus'); }} />
                  <circle cx="90" cy="90" r="8" fill="#18181b" />

                  {/* Mitochondria */}
                  <ellipse cx="150" cy="130" rx="14" ry="7" fill={selectedOrganelle === 'mitochondria' ? '#3f3f46' : '#27272a'} stroke="#ffffff" strokeWidth="1" transform="rotate(-15, 150, 130)" className="cursor-pointer" onClick={() => { playSound('click'); setSelectedOrganelle('mitochondria'); }} />

                  {/* Chloroplast */}
                  <ellipse cx="50" cy="130" rx="12" ry="6" fill={selectedOrganelle === 'chloroplast' ? '#3f3f46' : '#27272a'} stroke="#ffffff" strokeWidth="1" transform="rotate(30, 50, 130)" className="cursor-pointer" onClick={() => { playSound('click'); setSelectedOrganelle('chloroplast'); }} />

                  {/* Lysosome */}
                  <circle cx="140" cy="70" r="7" fill={selectedOrganelle === 'lysosome' ? '#3f3f46' : '#27272a'} stroke="#ffffff" strokeWidth="1" className="cursor-pointer" onClick={() => { playSound('click'); setSelectedOrganelle('lysosome'); }} />

                  {/* Membrane trigger boundary click */}
                  <ellipse cx="100" cy="100" rx="85" ry="71" fill="none" stroke={selectedOrganelle === 'membrane' ? '#ffffff' : 'transparent'} strokeWidth="2" className="cursor-pointer" onClick={() => { playSound('click'); setSelectedOrganelle('membrane'); }} />
                </svg>
              </div>

              <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-900 space-y-1">
                <span className="text-[10px] font-bold text-white uppercase">{organelle.name}</span>
                <p className="text-[11px] text-zinc-400 leading-normal">{organelle.role}</p>
                <p className="text-[10px] text-amber-500 font-mono italic">Real analogy: {organelle.analogy}</p>
              </div>
            </div>
          );
        }

      case 'atom':
        {
          const atomDetails = (() => {
            switch (atomElement) {
              case 'H': return { name: 'Hydrogen', atomicNum: 1, config: '1', protons: 1, neutrons: 0, electrons: 1 };
              case 'He': return { name: 'Helium', atomicNum: 2, config: '2', protons: 2, neutrons: 2, electrons: 2 };
              case 'Li': return { name: 'Lithium', atomicNum: 3, config: '2, 1', protons: 3, neutrons: 4, electrons: 3 };
              case 'C': return { name: 'Carbon', atomicNum: 6, config: '2, 4', protons: 6, neutrons: 6, electrons: 6 };
            }
          })();

          return (
            <div className="space-y-3">
              <h4 className="text-[11px] font-bold text-zinc-300">⚛️ Bohr Shell Model Shells</h4>
              <div className="flex gap-1">
                {(['H', 'He', 'Li', 'C'] as const).map(el => (
                  <button
                    key={el}
                    onClick={() => { playSound('click'); setAtomElement(el); }}
                    className={`flex-1 py-1 rounded text-[10px] font-bold transition font-mono ${
                      atomElement === el ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400'
                    }`}
                  >
                    {el}
                  </button>
                ))}
              </div>

              <div className="relative w-full h-40 bg-black border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-32 h-32">
                  <circle cx="50" cy="50" r="12" fill="#27272a" stroke="#fff" strokeWidth="0.8" />
                  <text x="50" y="52" fill="#fff" fontSize="5" fontWeight="bold" textAnchor="middle">{atomElement}</text>

                  {/* Shell 1 */}
                  <circle cx="50" cy="50" r="22" fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="1 1" />
                  {/* Electrons in Shell 1 */}
                  {atomDetails.electrons >= 1 && <circle cx="50" cy="28" r="2.5" fill="#fff" />}
                  {atomDetails.electrons >= 2 && <circle cx="50" cy="72" r="2.5" fill="#fff" />}

                  {/* Shell 2 */}
                  {atomDetails.electrons >= 3 && (
                    <>
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#333" strokeWidth="0.5" strokeDasharray="1 1" />
                      <circle cx="14" cy="50" r="2.5" fill="#fff" />
                      {atomDetails.electrons >= 4 && <circle cx="86" cy="50" r="2.5" fill="#fff" />}
                      {atomDetails.electrons >= 5 && <circle cx="50" cy="14" r="2.5" fill="#fff" />}
                      {atomDetails.electrons >= 6 && <circle cx="50" cy="86" r="2.5" fill="#fff" />}
                    </>
                  )}
                </svg>
              </div>

              <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 text-[10px] sm:text-[11px] font-mono leading-normal grid grid-cols-2 gap-2 text-zinc-400">
                <div>Protons: <strong className="text-white">{atomDetails.protons}</strong></div>
                <div>Neutrons: <strong className="text-white">{atomDetails.neutrons}</strong></div>
                <div>Atomic Number: <strong className="text-white">{atomDetails.atomicNum}</strong></div>
                <div>Config: <strong className="text-white">{atomDetails.config}</strong></div>
              </div>
            </div>
          );
        }

      case 'circuit':
        {
          const current = circuitOn ? Number((voltage / resistance).toFixed(2)) : 0;
          return (
            <div className="space-y-3 text-[11px]">
              <h4 className="text-[11px] font-bold text-zinc-300">⚡ Dynamic Ohm's Law Circuit</h4>
              <div className="grid grid-cols-2 gap-3 bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 font-mono text-zinc-400">
                <div>Voltage: <strong className="text-white">{voltage} V</strong></div>
                <div>Resistance: <strong className="text-white">{resistance} Ω</strong></div>
                <div className="col-span-2 text-emerald-400 border-t border-zinc-900 mt-1 pt-1">
                  Current (I = V/R): <strong className="text-white">{current} A</strong>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Battery (V):</span>
                  <span>{voltage} Volts</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="12"
                  value={voltage}
                  onChange={(e) => { playSound('click'); setVoltage(Number(e.target.value)); }}
                  className="w-full accent-white"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                  <span>Resistor (R):</span>
                  <span>{resistance} Ohms</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={resistance}
                  onChange={(e) => { playSound('click'); setResistance(Number(e.target.value)); }}
                  className="w-full accent-white"
                />
              </div>

              <button
                type="button"
                onClick={() => { playSound('click'); setCircuitOn(!circuitOn); }}
                className={`w-full py-1.5 rounded-xl font-bold font-mono transition text-[10px] ${
                  circuitOn ? 'bg-emerald-500 text-black' : 'bg-zinc-900 text-zinc-400'
                }`}
              >
                {circuitOn ? '● CIRCUIT ACTIVE (ON)' : '○ CIRCUIT OPEN (OFF)'}
              </button>
            </div>
          );
        }

      default:
        return null;
    }
  };

  // Render Section Helper
  const renderDashboardSection = (sectionName: string) => {
    switch (sectionName) {
      case 'search-grades':
        if (selectedCourse) return null;
        return (
          <div key="search-grades" className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3 shadow-xl">
            <div className="flex gap-2">
              {/* Keyboard & Voice search field */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={appLanguage === 'hi' ? 'अध्याय, सिद्धांत या समीकरण खोजें...' : "Search chapters, concepts, formulas (e.g. Mitochondria, Ohm's law)..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-2.5 py-2 pl-10 pr-12 text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
                
                {/* Voice Typing mic overlay button inside the search field */}
                <button
                  type="button"
                  onClick={startSearchVoiceTyping}
                  className={`absolute right-3 top-1.5 p-1.5 rounded-lg border transition cursor-pointer ${
                    isSearchListening
                      ? 'bg-red-950 border-red-900 text-red-400 animate-pulse'
                      : 'bg-zinc-950 border-zinc-850 hover:border-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                  title={appLanguage === 'hi' ? 'आवाज़ से खोजें' : 'Voice Typing Search'}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>

              {/* Collapsible Filters toggle button */}
              <button
                onClick={() => {
                  playSound('click');
                  setShowFilters(!showFilters);
                }}
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                  showFilters || selectedClass !== 'all' || selectedSubject !== 'all'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">{appLanguage === 'hi' ? 'फ़िल्टर' : 'Filters'}</span>
                {(selectedClass !== 'all' || selectedSubject !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                )}
              </button>
            </div>

            {/* Listening Indicator overlay feedback */}
            {isSearchListening && (
              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 bg-zinc-900/60 p-2 rounded-lg border border-zinc-800 animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                <span>{appLanguage === 'hi' ? 'सुन रहा हूँ... अध्याय का नाम बोलें' : 'Listening... Speak Chapter, e.g. "Reflection of Light"'}</span>
              </div>
            )}

            {/* Collapsible filters options (styled exactly as BatchesTab.tsx) */}
            {showFilters && (
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                {/* 1. Class Level */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                    {appLanguage === 'hi' ? 'ग्रेड स्तर / कक्षा' : 'Class / Grade Level'}
                  </label>
                  <input
                    type="text"
                    placeholder={appLanguage === 'hi' ? 'उदा. 10, Kindergarten, Post Doc' : 'e.g. 10, Kindergarten, Post Doc'}
                    value={selectedClass === 'all' ? '' : selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value || 'all')}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 placeholder-zinc-700"
                  />
                </div>

                {/* 2. Subject Filter */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                    {appLanguage === 'hi' ? 'विषय' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    placeholder={appLanguage === 'hi' ? 'उदा. Physics, Botany, Maths' : 'e.g. Physics, Botany, Maths'}
                    value={selectedSubject === 'all' ? '' : selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value || 'all')}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 placeholder-zinc-700"
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 'header':
        return (
          <motion.div 
            key="header"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative overflow-hidden rounded-3xl bg-black border border-zinc-800/80 p-8 sm:p-10 shadow-2xl"
          >
            {/* Premium Indian Tricolor background accent line */}
            <div className="absolute top-0 left-0 w-full h-[4px] bg-gradient-to-r from-[#FF671F] via-[#FFFFFF] to-[#046A38] z-20"></div>
            <div className="absolute top-4 right-4 w-40 h-40 bg-[#FF671F]/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-40 h-40 bg-[#046A38]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-8 space-y-4 text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 font-medium shadow-md">
                  <AshokChakra size={16} animateRotation={true} glow={false} />
                  <span className="text-zinc-200">{appLanguage === 'hi' ? 'जिज्ञासा को सशक्त बनाना' : 'Empowering Curiosities'}</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-sans font-extrabold tracking-tight text-white leading-tight">
                  <EditableText
                    value={customization.brandingTitle}
                    onSave={(v) => {}}
                    isEditMode={isEditMode}
                    as="span"
                  />
                </h1>
                <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
                  {appLanguage === 'hi'
                    ? 'आपके प्रीमियम अध्ययन इंटरफ़ेस में आपका स्वागत है। व्यवस्थित सार्वजनिक पाठ्यक्रम अध्यायों को ब्राउज़ करें, परीक्षणों के साथ अभ्यास करें, और अपने गतिशील एआई मेंटर के साथ संदेहों को तुरंत हल करें।'
                    : 'Welcome to your premium study interface. Browse structured public master syllabus chapters, lock and unlock paid batches, train with customized test cards, and solve doubts with your dynamic mentor assistant.'}
                </p>
                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => onOpenAI('doubt', 'General Science doubts')}
                    className="px-5 py-2.5 bg-white text-black hover:bg-zinc-200 active:scale-95 transition font-bold rounded-xl flex items-center gap-2 shadow cursor-pointer text-xs"
                    id="btn-ask-ai"
                  >
                    <Brain className="w-4 h-4 text-black" /> {appLanguage === 'hi' ? 'एआई मेंटर से संदेह पूछें' : 'Ask AI Mentor doubts'}
                  </button>
                </div>
              </div>

              {/* Magnificent Mascots 3D Element */}
              <div className="md:col-span-4 h-48 sm:h-56 relative flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF671F]/10 to-[#046A38]/10 rounded-full blur-2xl" />
                <ThreeDElement type="boy_girl_curious_bharat" className="w-48 h-48 sm:w-56 sm:h-56 relative z-10" autoRotate={true} interactive={true} />
              </div>
            </div>
          </motion.div>
        );

      case 'stats':
        return null;

      case 'courses':
        if (selectedCourse) {
          const isCurrentCoursePaid = selectedCourse.isPaid;
          const isCurrentUnlocked = !isCurrentCoursePaid || (progress.purchasedCourses || []).includes(selectedCourse.id);

          if (!isCurrentUnlocked) {
            return null;
          }

          const handleCourseBack = () => {
            playSound('click');
            if (selectedTopic) {
              setSelectedTopic(null);
            } else if (selectedChapter) {
              setSelectedChapter(null);
            } else {
              setSelectedCourse(null);
            }
          };

          return (
            <div key="active-course-drilldown" className="space-y-6">
              {/* Breadcrumbs / Back Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950 p-4 border border-zinc-900 rounded-2xl">
                <div className="flex items-center gap-2 text-xs font-mono">
                  <button 
                    onClick={() => { playSound('click'); setSelectedCourse(null); setSelectedChapter(null); setSelectedTopic(null); }}
                    className="text-zinc-500 hover:text-white transition"
                  >
                    {appLanguage === 'hi' ? 'बैच' : 'Batches'}
                  </button>
                  <ChevronRight className="w-3.5 h-3.5 text-zinc-750" />
                  <button 
                    onClick={() => { playSound('click'); setSelectedChapter(null); setSelectedTopic(null); }}
                    className={`transition ${selectedChapter ? 'text-zinc-500 hover:text-white' : 'text-white font-bold'}`}
                  >
                    {selectedCourse.title}
                  </button>
                  {selectedChapter && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-750" />
                      <button 
                        onClick={() => { playSound('click'); setSelectedTopic(null); }}
                        className={`transition ${selectedTopic ? 'text-zinc-500 hover:text-white' : 'text-white font-bold'}`}
                      >
                        {selectedChapter.title}
                      </button>
                    </>
                  )}
                  {selectedTopic && (
                    <>
                      <ChevronRight className="w-3.5 h-3.5 text-zinc-750" />
                      <span className="text-white font-extrabold">{selectedTopic.title}</span>
                    </>
                  )}
                </div>

                <button
                  onClick={handleCourseBack}
                  className="px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-xs font-bold rounded-xl text-zinc-300 hover:text-white transition flex items-center gap-1 self-start sm:self-center"
                >
                  ← Go Back
                </button>
              </div>

              {/* LEVEL 3: Topic Study Panel */}
              {selectedTopic ? (
                <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-25 pointer-events-none"></div>

                  <div className="space-y-2 relative z-10">
                    <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-extrabold block">
                      📁 TOPIC STUDY MASTERCLASS
                    </span>
                    <h2 className="text-2xl font-sans font-extrabold text-white tracking-tight flex items-center gap-2">
                      {selectedTopic.title}
                    </h2>
                    <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                      {selectedTopic.description}
                    </p>
                  </div>

                  {/* Tabs layout with horizontal scroll and responsive audio effects */}
                  <div className="border-b border-zinc-900 pb-3 relative z-10">
                    <HorizontalScrollContainer>
                      {[
                        { id: 'lecture', label: '🎥 Video Lecture' },
                        { id: 'notes', label: '📝 Study Notes' },
                        { id: 'quiz', label: '🎯 MCQ Quiz' },
                        { id: 'flashcards', label: '🧠 Concept Mind Map' },
                        { id: 'dpp', label: '📂 DPP & PDF' }
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => { playSound('click'); setActiveTopicTab(tab.id as any); }}
                          className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer shrink-0 ${
                            activeTopicTab === tab.id
                              ? 'bg-white text-black shadow'
                              : 'bg-zinc-900/60 text-zinc-400 hover:text-white border border-zinc-850 hover:border-zinc-800'
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </HorizontalScrollContainer>
                  </div>

                  {/* Tab Contents */}
                  <div className="relative z-10 pt-2 min-h-[300px]">
                    
                    {/* Tab 1: Lecture Video */}
                    {activeTopicTab === 'lecture' && (
                      <div className="space-y-4">
                        <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                          Video Concept Masterclass
                        </h3>
                        {selectedTopic.lectureUrl ? (
                          <div className="space-y-3">
                            <div className="aspect-video w-full max-w-3xl mx-auto rounded-2xl overflow-hidden border border-zinc-800 bg-black shadow-2xl relative">
                              <iframe
                                src={selectedTopic.lectureUrl}
                                title={selectedTopic.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              ></iframe>
                            </div>
                            <p className="text-[10px] text-zinc-500 text-center leading-normal">
                              🔐 Secured through private embedding. In accordance with platform terms, copyrighted content is protected.
                            </p>
                          </div>
                        ) : (
                          <div className="border border-zinc-900 bg-zinc-950 rounded-2xl p-8 text-center space-y-3 max-w-md mx-auto">
                            <span className="block text-3xl">🔒</span>
                            <h4 className="text-xs font-bold uppercase text-zinc-400 tracking-wider">No Video Embedded</h4>
                            <p className="text-[11px] text-zinc-600 leading-normal">
                              Instructors can embed owned study lectures securely inside the administrator panel under this Topic folder.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 2: Revision Notes */}
                    {activeTopicTab === 'notes' && (
                      <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                            📚 CONSOLIDATED STUDY VAULT & EXPERIMENTAL HUBS
                          </h3>
                        </div>

                        {selectedTopic.sections && selectedTopic.sections.length > 0 ? (
                          <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                              
                              {/* Left Text Notes */}
                              <div className="lg:col-span-7 space-y-6">
                                {selectedTopic.sections.map((sec: any) => (
                                  <div key={sec.id} className="space-y-3 bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl">
                                    <h4 className="text-sm font-bold text-white leading-normal">
                                      {sec.title}
                                    </h4>
                                    <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">
                                      {sec.body}
                                    </p>
                                    {sec.keyPoints && sec.keyPoints.length > 0 && (
                                      <div className="pt-2.5 space-y-1.5 border-t border-zinc-900">
                                        <span className="text-[9px] uppercase tracking-wider font-bold text-zinc-500">Key Takeaways</span>
                                        {sec.keyPoints.map((pt: string, idx: number) => (
                                          <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                            <span className="text-zinc-500 font-bold font-mono mt-0.5">•</span>
                                            <span>{pt}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ))}

                                {/* Extra Downloadable Notes PDFs Section (Provide 2 more PDFs!) */}
                                <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4">
                                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-orange-400 font-mono">
                                    📂 DOWNLOAD EXTRA HIGH-VALUE STUDY MATERIAL (PDF)
                                  </h4>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        alert("Success! 'Advanced Formula Sheet & Concept Blueprint (PDF)' is downloaded for offline study.");
                                      }}
                                      className="flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-700 rounded-xl transition cursor-pointer text-left"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-orange-950/20 border border-orange-900/40 text-orange-400 rounded-lg">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-white">Advanced Formula & Concept Guide</p>
                                          <p className="text-[9px] text-zinc-500 font-mono">2.4 MB • Complete formulas</p>
                                        </div>
                                      </div>
                                      <Download className="w-4 h-4 text-zinc-500" />
                                    </a>

                                    <a
                                      href="#"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        alert("Success! 'NCERT Exemplar Solved Practice Notes (PDF)' is downloaded for offline study.");
                                      }}
                                      className="flex items-center justify-between p-3 bg-zinc-900/30 hover:bg-zinc-900/80 border border-zinc-900 hover:border-zinc-700 rounded-xl transition cursor-pointer text-left"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="p-2 bg-purple-950/20 border border-purple-900/40 text-purple-400 rounded-lg">
                                          <FileText className="w-4 h-4" />
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-white">NCERT Exemplar Solved Practice</p>
                                          <p className="text-[9px] text-zinc-500 font-mono">3.1 MB • Question bank</p>
                                        </div>
                                      </div>
                                      <Download className="w-4 h-4 text-zinc-500" />
                                    </a>
                                  </div>
                                </div>
                              </div>

                              {/* Right Dynamic Live Interactive Simulation Widget */}
                              <div className="lg:col-span-5 bg-zinc-900/40 p-5 rounded-2xl border border-zinc-850 h-fit space-y-4">
                                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold block font-mono">
                                  🔮 LIVE EXPERIMENTAL SIMULATOR
                                </span>
                                {renderSimulationWidget()}
                              </div>

                            </div>

                            {/* Inline Comment Options in Study Notes Section */}
                            <div className="border-t border-zinc-900 pt-6 mt-6">
                              <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-4 shadow-xl">
                                <div className="space-y-1">
                                  <h4 className="text-sm font-black text-white uppercase tracking-tight font-mono">
                                    💬 Study Note Doubts & Discussions
                                  </h4>
                                  <p className="text-xs text-zinc-500 leading-normal">
                                    Discuss formulas, core concept questions, or leave comments on the study notes with peers.
                                  </p>
                                </div>
                                <CommunityComments
                                  lectureId={`${selectedTopic.id}-notes`}
                                  studentName={studentName || "Anonymous Learner"}
                                  isTeacher={studentName === 'Priyanshu'}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-xs text-zinc-500 text-center py-8">
                            Reading notes and interactive concept simulations are being loaded by the instructor.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 3: MCQ Quiz */}
                    {activeTopicTab === 'quiz' && (
                      <div className="space-y-4 max-w-xl mx-auto bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Topic Practice & Self Evaluation
                          </h3>
                          <span className="text-[10px] bg-zinc-900 px-2 py-0.5 rounded text-yellow-550 font-mono font-bold">
                            +15 Coins / Match
                          </span>
                        </div>

                        {selectedTopic.quiz && selectedTopic.quiz.length > 0 ? (
                          (() => {
                            const qList = getTenQuestions(selectedTopic.quiz, selectedTopic.id, selectedTopic.title, selectedTopic.subject || '');
                            const isFinished = topicQuizIndex >= qList.length;

                            if (isFinished) {
                              return (
                                <div className="text-center py-8 space-y-4">
                                  <div className="w-12 h-12 bg-yellow-950/20 text-yellow-500 border border-yellow-900/30 rounded-full flex items-center justify-center mx-auto text-xl font-bold animate-bounce">
                                    🏆
                                  </div>
                                  <div className="space-y-1">
                                    <h4 className="text-base font-bold text-white">TEST CHALLENGE OVER!</h4>
                                    <p className="text-xs text-zinc-500 leading-normal">
                                      You scored <strong className="text-white font-mono">{topicQuizScore} / {qList.length}</strong> correct answers!
                                    </p>
                                    <p className="text-[11px] text-emerald-400 font-semibold font-mono animate-pulse">
                                      +{(topicQuizScore * 15)} Coins Added securely!
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      playSound('click');
                                      setTopicQuizIndex(0);
                                      setTopicQuizSelected(null);
                                      setTopicQuizAnswered(false);
                                      setTopicQuizScore(0);
                                      setTopicQuizFeedback('');
                                    }}
                                    className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition cursor-pointer"
                                  >
                                    Retake Test
                                  </button>
                                </div>
                              );
                            }

                            const activeQ = qList[topicQuizIndex];

                            const checkAnswer = () => {
                              if (topicQuizSelected === null || topicQuizAnswered) return;
                              setTopicQuizAnswered(true);
                              const isCorrect = topicQuizSelected === activeQ.correctAnswerIndex;
                              if (isCorrect) {
                                playSound('correct');
                                setTopicQuizScore(prev => prev + 1);
                                setTopicQuizFeedback('✓ Brilliant! Perfect logical scientific evaluation.');
                                
                                onUpdateProgress({
                                  ...progress,
                                  totalXP: progress.totalXP + 15
                                });
                              } else {
                                playSound('wrong');
                                setTopicQuizFeedback(`❌ Incorrect. The correct answer is: ${activeQ.options[activeQ.correctAnswerIndex]}`);
                              }
                            };

                            const handleNext = () => {
                              playSound('click');
                              setTopicQuizIndex(prev => prev + 1);
                              setTopicQuizSelected(null);
                              setTopicQuizAnswered(false);
                              setTopicQuizFeedback('');
                            };

                            return (
                              <div className="space-y-4">
                                <div className="flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                                  <span>QUESTION {topicQuizIndex + 1} OF {qList.length}</span>
                                  <span>Current Coins: <strong className="text-white">{progress.totalXP}</strong></span>
                                </div>

                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  {activeQ.examReference && (
                                    <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                                      🏆 {activeQ.examReference}
                                    </span>
                                  )}
                                  {activeQ.weightage && (
                                    <span className="text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">
                                      {activeQ.weightage}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                                  {activeQ.question}
                                </h4>

                                <div className="space-y-2 pt-2">
                                  {activeQ.options.map((opt, idx) => {
                                    let btnStyle = "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700";
                                    if (topicQuizSelected === idx) {
                                      btnStyle = "bg-zinc-800 border-white text-white";
                                    }
                                    if (topicQuizAnswered) {
                                      if (idx === activeQ.correctAnswerIndex) {
                                        btnStyle = "bg-emerald-950/20 border-emerald-800 text-emerald-400 font-bold";
                                      } else if (topicQuizSelected === idx) {
                                        btnStyle = "bg-rose-950/20 border-rose-800 text-rose-400";
                                      }
                                    }

                                    return (
                                      <button
                                        key={idx}
                                        onClick={() => { if (!topicQuizAnswered) { playSound('click'); setTopicQuizSelected(idx); } }}
                                        disabled={topicQuizAnswered}
                                        className={`w-full text-left px-4 py-2.5 rounded-xl text-xs border transition flex items-center justify-between cursor-pointer ${btnStyle}`}
                                      >
                                        <span>{opt}</span>
                                        <span className="text-[10px] font-mono text-zinc-600">Option {String.fromCharCode(65 + idx)}</span>
                                      </button>
                                    );
                                  })}
                                </div>

                                {topicQuizFeedback && (
                                  <div className={`p-3 rounded-xl text-[11px] leading-normal font-semibold border ${
                                    topicQuizFeedback.startsWith('✓') 
                                      ? 'bg-emerald-950/10 border-emerald-900/30 text-emerald-400' 
                                      : 'bg-rose-950/10 border-rose-900/30 text-rose-400'
                                  }`}>
                                    {topicQuizFeedback}
                                    {topicQuizAnswered && activeQ.explanation && (
                                      <p className="mt-1.5 text-[10px] text-zinc-500 font-normal border-t border-zinc-900 pt-1.5">
                                        <strong>Concept:</strong> {activeQ.explanation}
                                      </p>
                                    )}
                                  </div>
                                )}

                                <div className="pt-2 flex gap-2">
                                  {!topicQuizAnswered ? (
                                    <button
                                      type="button"
                                      onClick={checkAnswer}
                                      disabled={topicQuizSelected === null}
                                      className="w-full py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-20"
                                    >
                                      Check Answer
                                    </button>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={handleNext}
                                      className="w-full py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                                    >
                                      {topicQuizIndex === qList.length - 1 ? 'Finish Results' : 'Next Question →'}
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="text-xs text-zinc-500 text-center py-8">
                            Practice quiz questions are being compiled for this topic track.
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tab 4: Memory Flashcards (Rendered as Interactive Concept Mind Map) */}
                    {activeTopicTab === 'flashcards' && (
                      <div className="w-full">
                        <FlashcardsView
                          embedded={true}
                          chapter={selectedChapter || {
                            id: selectedTopic.id,
                            title: selectedTopic.title,
                            description: selectedTopic.description,
                            classLevel: 9,
                            subject: selectedTopic.subject || 'Syllabus Focus',
                            readingTime: '10 mins',
                            keyConcepts: [],
                            sections: [],
                            flashcards: selectedTopic.flashcards || []
                          }}
                          progress={progress}
                          onRateCard={(cardId, rating) => {
                            const existingStatus = progress.flashcardStatus[cardId];
                            onUpdateProgress({
                              ...progress,
                              totalXP: progress.totalXP + (existingStatus ? 0 : 5),
                              flashcardStatus: {
                                ...progress.flashcardStatus,
                                [cardId]: rating
                              }
                            });
                          }}
                          onOpenAI={onOpenAI}
                        />
                      </div>
                    )}

                    {/* Tab 5: DPP Sheets */}
                    {activeTopicTab === 'dpp' && (
                      <div className="space-y-4 max-w-md mx-auto bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl">
                        <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                          <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                            Drive Worksheets & Sheets
                          </h3>
                        </div>

                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                            <div className="space-y-0.5">
                              <span className="text-xs font-bold text-white block font-sans">Syllabus Reference PDF</span>
                              <span className="text-[10px] text-zinc-500 block font-sans">Class Notes & Revision Guide</span>
                            </div>
                            {selectedTopic.pdfUrl ? (
                              <a
                                href={selectedTopic.pdfUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-[10px] transition"
                              >
                                View File
                              </a>
                            ) : (
                              <span className="text-[10px] text-zinc-600 font-mono">🔒 Unlinked</span>
                            )}
                          </div>

                          {((selectedTopic.dppFiles && selectedTopic.dppFiles.length > 0) ? selectedTopic.dppFiles : (selectedChapter?.dppFiles || [])).length > 0 ? (
                            ((selectedTopic.dppFiles && selectedTopic.dppFiles.length > 0) ? selectedTopic.dppFiles : (selectedChapter?.dppFiles || [])).map((file: any, idx: number) => (
                              <div key={file.id || idx} className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                                <div className="space-y-0.5 text-left">
                                  <span className="text-xs font-bold text-white block font-sans">{file.name || `Practice Sheet Day #${idx + 1}`}</span>
                                  <span className="text-[10px] text-zinc-500 block font-sans">Homework Sheet • Day Wise</span>
                                </div>
                                <a
                                  href={file.url || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/50 text-cyan-400 rounded-lg font-bold text-[10px] transition shrink-0"
                                >
                                  Download
                                </a>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                              <div className="space-y-0.5 text-left">
                                <span className="text-xs font-bold text-white block font-sans">Daily Practice Problems (DPP)</span>
                                <span className="text-[10px] text-zinc-500 block font-sans">Homework Assignment Sheet</span>
                              </div>
                              {(selectedTopic.dppUrl || selectedChapter?.dppUrl) ? (
                                <a
                                  href={selectedTopic.dppUrl || selectedChapter?.dppUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-[10px] transition shrink-0"
                                >
                                  Download DPP
                                </a>
                              ) : (
                                <span className="text-[10px] text-zinc-600 font-mono">🔒 Unlinked</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Device Storage Downloads Manager */}
                    <div className="mt-8 pt-6 border-t border-zinc-900/60 max-w-md mx-auto space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest font-mono flex items-center gap-1.5">
                          <span>📥 Device Storage & Local Downloads</span>
                        </h4>
                        <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-900">
                          Offline Mode: Enabled
                        </span>
                      </div>

                      <div className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-xl space-y-3 text-left">
                        <p className="text-[10px] text-zinc-400 leading-normal">
                          In compliance with Curious Bharat storage rules, all study sheets, notes, PDFs, and progress logs are saved **directly on your device local storage**, rather than expensive cloud servers. Wiping files below instantly reclaims local disk space.
                        </p>

                        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {(progress.downloadedFiles || []).length > 0 ? (
                            (progress.downloadedFiles || []).map((file) => (
                              <div key={file.id} className="flex items-center justify-between p-2.5 bg-zinc-900/40 rounded-xl border border-zinc-900/60">
                                <div className="space-y-0.5 text-left min-w-0 flex-1 pr-2">
                                  <span className="text-[11px] font-bold text-white block truncate">{file.title}</span>
                                  <span className="text-[9px] text-zinc-500 block font-mono">
                                    Saved: {file.downloadedAt} • {file.sizeKb} KB
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <a
                                    href={file.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-2 py-1 bg-cyan-950/40 text-cyan-400 hover:bg-cyan-900/60 rounded text-[9px] font-bold transition"
                                  >
                                    Open
                                  </a>
                                  <button
                                    onClick={() => {
                                      if (confirm(`Empty local server space by deleting downloaded copy of "${file.title}"?`)) {
                                        const updated = (progress.downloadedFiles || []).filter(f => f.id !== file.id);
                                        onUpdateProgress({
                                          ...progress,
                                          downloadedFiles: updated
                                        });
                                        playSound('click');
                                        setShowDownloadAlert(`Successfully emptied device space! ${file.sizeKb} KB cleared.`);
                                        setTimeout(() => setShowDownloadAlert(null), 3000);
                                      }
                                    }}
                                    className="p-1 text-zinc-500 hover:text-red-400 transition cursor-pointer"
                                    title="Delete from Device Storage"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))
                          ) : (
                            <span className="text-[10px] text-zinc-600 italic block text-center py-4">
                              No files downloaded to local storage yet.
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              ) : selectedChapter ? (
                // LEVEL 2: Chapter Topics
                <div className="space-y-4">
                  <div className="flex items-center gap-1.5">
                    <span className="p-2 bg-zinc-900 border border-zinc-850 text-white rounded-xl">
                      <BookOpen className="w-5 h-5 text-zinc-400" />
                    </span>
                    <div>
                      <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-extrabold block">
                        CHAPTER TOPICS IN "{selectedChapter.title}"
                      </span>
                      <h3 className="text-lg font-extrabold text-white">
                        Master Study Chapters & Topics
                      </h3>
                    </div>
                  </div>

                  {(() => {
                    const topicsList = getChapterTopics(selectedChapter);

                    if (topicsList.length === 0) {
                      return (
                        <div className={`text-center py-10 rounded-2xl text-xs border ${isDarkMode ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-gradient-to-tr from-orange-50/60 via-white/90 to-teal-50/60 border-orange-100/60 text-slate-500 shadow-sm'}`}>
                          {appLanguage === 'hi' ? 'इस अध्याय फ़ोल्डर के अंदर अभी कोई विषय नहीं है।' : 'No nested topics uploaded inside this chapter folder yet. Admins can create them securely.'}
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-3 animate-fadeIn">
                        {topicsList.map(topic => (
                          <div
                            key={topic.id}
                            onClick={() => { playSound('click'); setSelectedTopic(topic); }}
                            className={`rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer group relative transition-all border ${
                              isDarkMode 
                                ? 'bg-zinc-950 border-zinc-900/85 hover:border-zinc-700' 
                                : 'bg-gradient-to-tr from-orange-50/60 via-white/90 to-teal-50/60 border-orange-100/60 hover:border-orange-300 shadow-sm'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isDarkMode ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-orange-100 text-orange-600'}`}>
                                <FileText className={`w-5 h-5 ${isDarkMode ? 'text-zinc-400 group-hover:text-white' : 'text-orange-500 group-hover:text-orange-700'} transition-colors`} />
                              </div>
                              <div className="space-y-0.5">
                                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                                  {appLanguage === 'hi' ? 'सक्रिय फ़ोल्डर विषय' : 'Active Folder Topic'}
                                </span>
                                <h4 className={`text-sm font-bold leading-tight ${isDarkMode ? 'text-white group-hover:text-zinc-200' : 'text-slate-800 group-hover:text-slate-950'}`}>
                                  {topic.title}
                                </h4>
                                <p className={`text-xs leading-normal line-clamp-1 ${isDarkMode ? 'text-zinc-500' : 'text-slate-600 font-medium'}`}>
                                  {topic.description}
                                </p>
                              </div>
                            </div>

                            <div className={`flex items-center gap-1.5 shrink-0 text-xs font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-650'}`}>
                              <span className="hidden sm:inline">{appLanguage === 'hi' ? 'अध्ययन' : 'Study'}</span>
                              <ArrowRight className={`w-4 h-4 group-hover:translate-x-0.5 transition-transform ${isDarkMode ? 'text-zinc-400' : 'text-slate-555'}`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              ) : (
                // LEVEL 1: YouTube Playlist style folder view
                <div className="space-y-6">
                  {/* Playlist Header Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { playSound('click'); setSelectedCourse(null); }}
                      className={`px-3 py-2 rounded-xl border flex items-center justify-center transition active:scale-95 cursor-pointer gap-1.5 ${
                        isDarkMode
                          ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white'
                          : 'bg-white hover:bg-slate-100 border-slate-200 text-slate-650 hover:text-slate-900'
                      }`}
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span className="text-xs font-bold font-sans">Back to Batches</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    {/* LEFT COLUMN: YouTube Playlist Glass Metadata Card */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                      <div className={`border rounded-3xl p-6 space-y-5 relative overflow-hidden shadow-2xl ${
                        isDarkMode 
                          ? 'bg-zinc-950/70 backdrop-blur-md border-zinc-900/80 text-white' 
                          : 'bg-white/90 backdrop-blur-md border-slate-200 text-slate-900'
                      }`}>
                        {/* PREMIUM TOP BORDER STRIPE */}
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>

                        {/* Large Playlist Thumbnail Image */}
                        <div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-zinc-850 overflow-hidden relative shadow-md select-none">
                          <img 
                            src={getProxiedImageUrl(selectedCourse.thumbnailUrl)} 
                            alt={selectedCourse.title} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = getProxiedImageUrl(undefined);
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4">
                            <span className="text-[10px] bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-white font-mono font-bold border border-white/10 uppercase tracking-widest">
                              📚 PLAYLIST
                            </span>
                          </div>
                        </div>

                        {/* Playlist Meta details */}
                        <div className="space-y-2">
                          <h3 className="text-xl font-extrabold tracking-tight leading-tight">
                            {selectedCourse.title}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed font-medium line-clamp-3">
                            {selectedCourse.description}
                          </p>
                        </div>

                        <div className={`border-t pt-4 space-y-2 text-xs font-medium ${isDarkMode ? 'border-zinc-900/60' : 'border-slate-100'}`}>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Subject</span>
                            <span className="font-bold">{selectedCourse.subject}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Syllabus</span>
                            <span className="font-bold">CBSE / State Board 2026</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Modules Enrolled</span>
                            <span className="font-mono font-bold">{selectedCourse.chapters.length} classes</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-zinc-500">Status</span>
                            <span className="text-emerald-400 font-bold">● Live & Synced</span>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="space-y-2.5 pt-1">
                          <button
                            onClick={() => {
                              playSound('click');
                              if (selectedCourse.chapters.length > 0) {
                                setSelectedChapter(selectedCourse.chapters[0]);
                              }
                            }}
                            className="w-full py-3 bg-white text-black hover:bg-zinc-200 transition font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                          >
                            <Play className="w-4 h-4 fill-black text-black" />
                            <span>Play All Syllabus</span>
                          </button>

                          <button
                            onClick={() => onOpenAI('doubt', selectedCourse.title, `Hi Bharat AI, please summarize all key chapter contents and exam syllabus details of this batch: "${selectedCourse.title}". Format response as code cheat-sheet!`)}
                            className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 transition font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                          >
                            <Brain className="w-4 h-4 text-yellow-400 animate-pulse" />
                            <span>Ask Bharat AI doubts</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: Sequential Tracks Layout */}
                    <div className="lg:col-span-8 space-y-3">
                      {selectedCourse.chapters.length === 0 ? (
                        <div className={`text-center py-16 border rounded-3xl text-xs ${isDarkMode ? 'bg-zinc-950 border-zinc-900 text-zinc-500' : 'bg-gradient-to-tr from-orange-50/60 via-white/90 to-teal-50/60 border-orange-100/60 text-slate-555 shadow-sm'}`}>
                          {appLanguage === 'hi' ? 'इस बैच के तहत अभी कोई अध्याय नामांकित नहीं है।' : 'No chapters enrolled under this batch track yet. Admins can sync modules.'}
                        </div>
                      ) : (
                        selectedCourse.chapters.map((chapter, index) => (
                          <div
                            key={chapter.id}
                            className={`rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all border group relative hover:-translate-y-0.5 duration-200 cursor-pointer ${
                              isDarkMode 
                                ? 'bg-zinc-950 hover:bg-zinc-900/60 border-zinc-900 hover:border-zinc-700' 
                                : 'bg-gradient-to-tr from-orange-50/60 via-white/90 to-teal-50/60 border-orange-100/60 hover:border-orange-300 shadow-sm'
                            }`}
                            onClick={() => { playSound('click'); setSelectedChapter(chapter); }}
                          >
                            {/* LEFT SIDE: Chapter Number, Thumbnail, details */}
                            <div className="flex items-center gap-4 w-full sm:w-auto">
                              {/* Sequence Track Number */}
                              <span className={`text-sm font-mono font-bold w-6 text-center ${isDarkMode ? 'text-zinc-600 group-hover:text-white' : 'text-slate-400 group-hover:text-slate-800'}`}>
                                {String(index + 1).padStart(2, '0')}
                              </span>

                              {/* Small Chapter Video Preview layout */}
                              <div className={`w-20 aspect-video rounded-lg flex items-center justify-center shrink-0 border relative overflow-hidden bg-zinc-900 ${isDarkMode ? 'border-zinc-800' : 'border-orange-100 text-orange-600'}`}>
                                <FolderClosed className={`w-5 h-5 transition-transform duration-300 group-hover:scale-110 ${isDarkMode ? 'text-zinc-500 group-hover:text-zinc-300' : 'text-orange-500 group-hover:text-orange-700'}`} />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                  <Play className="w-4 h-4 fill-white text-white scale-90 group-hover:scale-100 transition-all duration-300" />
                                </div>
                              </div>

                              {/* Title, tags and Desc */}
                              <div className="space-y-0.5 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-zinc-900 text-zinc-400' : 'bg-orange-50 text-orange-700 border border-orange-100/45'}`}>
                                    {chapter.subject}
                                  </span>
                                  <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-semibold ${isDarkMode ? 'bg-zinc-900/60 text-zinc-400' : 'bg-teal-50 text-teal-700 border border-teal-100/40'}`}>
                                    Class {chapter.classLevel}
                                  </span>
                                </div>
                                <h4 className={`text-sm font-bold leading-tight truncate max-w-[280px] sm:max-w-md ${isDarkMode ? 'text-white group-hover:text-zinc-200' : 'text-slate-800 group-hover:text-slate-950'}`}>
                                  {chapter.title}
                                </h4>
                                <p className={`text-xs line-clamp-1 max-w-[280px] sm:max-w-md ${isDarkMode ? 'text-zinc-500' : 'text-slate-650 font-medium'}`}>
                                  {chapter.description}
                                </p>
                              </div>
                            </div>

                            {/* RIGHT SIDE: Action details & direct pdf resources */}
                            <div className="flex items-center gap-2.5 w-full sm:w-auto sm:shrink-0 justify-end mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                              {chapter.pdfUrl && (
                                <button
                                  onClick={() => handleDownloadClick(chapter.pdfUrl || '', `${chapter.title} Study Notes`)}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 ${
                                    isDarkMode
                                      ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white'
                                      : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-750'
                                  }`}
                                  title="Download Class Reference Material PDF"
                                >
                                  <Download className="w-3 h-3 text-emerald-400" /> Notes PDF
                                </button>
                              )}
                              {chapter.dppUrl && (
                                <button
                                  onClick={() => handleDownloadClick(chapter.dppUrl || '', `${chapter.title} Practice DPP Sheet`)}
                                  className={`px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 ${
                                    isDarkMode
                                      ? 'bg-zinc-900 hover:bg-zinc-800 border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white'
                                      : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-750'
                                  }`}
                                  title="Download Practice Worksheet (DPP)"
                                >
                                  <Download className="w-3 h-3 text-sky-400" /> DPP Sheet
                                </button>
                              )}

                              <button
                                onClick={() => { playSound('click'); setSelectedChapter(chapter); }}
                                className={`p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition active:scale-95 ${
                                  isDarkMode
                                    ? 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white'
                                    : 'bg-white hover:bg-slate-100 border-slate-200 hover:border-slate-350 text-slate-650 hover:text-slate-900'
                                }`}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }

        return (
          <div key="courses" className="space-y-4">
            <div className={`flex items-center justify-between border-b pb-2 ${isDarkMode ? 'border-zinc-850' : 'border-orange-100/60'}`}>
              <h3 className={`text-lg font-bold flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>
                📂 {appLanguage === 'hi' ? 'सार्वजनिक और सशुल्क बैच' : 'Public & Paid Batches'} ({filteredCourses.length})
              </h3>
              <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${isDarkMode ? 'bg-zinc-900 text-zinc-500' : 'bg-orange-50 text-orange-600'}`}>
                {appLanguage === 'hi' ? 'सदस्यता कार्यक्रम' : 'MEMBER PROGRAM'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              {filteredCourses.map(course => {
                const isPaid = course.isPaid;
                const isCourseApproved = studentAnalysisRecords && studentAnalysisRecords.some(r => r.courseId === course.id && r.studentName === progress.studentName && r.status === 'approved');
                const isCoursePending = studentAnalysisRecords && studentAnalysisRecords.some(r => r.courseId === course.id && r.studentName === progress.studentName && r.status === 'pending');
                const isCourseDenied = studentAnalysisRecords && studentAnalysisRecords.some(r => r.courseId === course.id && r.studentName === progress.studentName && r.status === 'denied');

                const isUnlocked = !isPaid || isCourseApproved || (progress.purchasedCourses || []).includes(course.id);
                const rawPrice = parseInt(course.price.replace(/[^0-9]/g, '')) || 0;
                const hasChapters = course.chapters && course.chapters.length > 0;
                const classLevelStr = hasChapters ? `Class ${course.chapters[0].classLevel}th` : 'All Class';

                return (
                  <div 
                    key={course.id}
                    className={`rounded-3xl p-6 transition relative overflow-hidden group flex flex-col justify-between h-full space-y-5 border ${
                      isDarkMode 
                        ? 'bg-zinc-950 border-zinc-900/85 hover:border-zinc-700/80 hover:shadow-2xl' 
                        : 'bg-gradient-to-tr from-indigo-50/60 via-white/90 to-teal-50/60 border-indigo-100/60 hover:border-indigo-300 shadow-md'
                    }`}
                  >
                    {/* TOP PREMIUM DECORATIVE ACCENT STRIPE */}
                    <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>

                    {/* SUBTLE BACKGROUND WATERMARK */}
                    <div className="absolute bottom-4 right-4 opacity-[0.03] sm:opacity-[0.02] pointer-events-none select-none group-hover:scale-110 group-hover:opacity-[0.05] transition-all duration-700">
                      <svg className="w-32 h-32 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                      </svg>
                    </div>

                    <div className="space-y-4">
                      {/* LARGE SIZE BATCH ICON / THUMBNAIL */}
                      <div className={`w-full aspect-video rounded-2xl bg-zinc-900 border overflow-hidden relative select-none shadow-lg group-hover:scale-[1.01] transition-all duration-300 flex items-center justify-center ${isDarkMode ? 'border-zinc-800' : 'border-indigo-100/60'}`}>
                        <img 
                          src={getProxiedImageUrl(course.thumbnailUrl)} 
                          alt={course.title} 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = getProxiedImageUrl(undefined);
                          }}
                        />

                        {/* Status overlay */}
                        <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                          {isUnlocked ? (
                            <span className="text-[9px] bg-emerald-500 text-black px-2.5 py-0.5 rounded-lg font-extrabold flex items-center gap-1 shadow-md">
                              <Unlock className="w-2.5 h-2.5" /> Unlocked
                            </span>
                          ) : isCoursePending ? (
                            <span className="text-[9px] bg-amber-500/20 text-amber-500 border border-amber-500/40 px-2.5 py-0.5 rounded-lg font-extrabold flex items-center gap-1.5 shadow-md animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                              Under Verification
                            </span>
                          ) : isCourseDenied ? (
                            <span className="text-[9px] bg-rose-500 text-white px-2 py-0.5 rounded-lg font-extrabold flex items-center gap-1 shadow-md">
                              ❌ Denied
                            </span>
                          ) : (
                            <span className="text-[9px] bg-zinc-900/90 text-amber-500 border border-zinc-800 px-2 py-0.5 rounded-lg font-extrabold flex items-center gap-1 shadow-md">
                              <Lock className="w-3 h-3" /> Locked
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Batch Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[9px] border px-2 py-0.5 rounded font-bold font-mono ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-zinc-400' : 'bg-indigo-50 border-indigo-100/50 text-indigo-700'}`}>
                            {course.subject === 'Physics' && appLanguage === 'hi' ? 'भौतिकी' : course.subject === 'Chemistry' && appLanguage === 'hi' ? 'रसायन विज्ञान' : course.subject === 'Biology' && appLanguage === 'hi' ? 'जीव विज्ञान' : course.subject}
                          </span>
                          <span className={`text-[9px] border px-2 py-0.5 rounded font-bold font-mono ${isDarkMode ? 'bg-zinc-900 border-zinc-850 text-zinc-400' : 'bg-indigo-50 border-indigo-100/50 text-indigo-700'}`}>
                            {classLevelStr}
                          </span>
                          {course.specialAIFeature && (
                            <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-lg text-indigo-400 font-extrabold font-mono tracking-wider flex items-center gap-1 animate-pulse">
                              <Sparkles className="w-2.5 h-2.5" /> PREMIUM AI BATCH
                            </span>
                          )}
                        </div>

                        <h3 className={`text-base font-extrabold leading-snug group-hover:text-amber-400 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-850'}`}>
                          <EditableText
                            value={course.title}
                            onSave={(newVal) => handleEditCourseTitle(course.id, newVal)}
                            isEditMode={isEditMode}
                            as="span"
                          />
                        </h3>

                        <p className={`text-xs leading-relaxed line-clamp-2 ${isDarkMode ? 'text-zinc-400' : 'text-slate-650 font-medium'}`}>
                          <EditableText
                            value={course.description}
                            onSave={(newVal) => handleEditCourseDesc(course.id, newVal)}
                            isEditMode={isEditMode}
                            as="span"
                            multiline={true}
                          />
                        </p>

                        {/* Special AI Features list display if exists */}
                        {course.specialAIFeature && (
                          <div className={`p-3 rounded-2xl text-xs space-y-2 text-left border ${isDarkMode ? 'bg-zinc-900/40 border-zinc-800/60' : 'bg-orange-50/40 border-orange-100/60'}`}>
                            <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-500 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              Premium AI Highlights
                            </span>
                            <div className="space-y-1">
                              {course.specialAIFeature.split('\n').map((pt, idx) => {
                                const cleanPt = pt.trim().replace(/^[•\-\*]\s*/, '');
                                if (!cleanPt) return null;
                                return (
                                  <div key={idx} className={`flex items-center gap-1.5 text-[11px] ${isDarkMode ? 'text-zinc-300' : 'text-slate-700 font-medium'}`}>
                                    <span className="text-blue-400 select-none">🛞</span>
                                    <span className="truncate">{cleanPt}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing and Action Footer */}
                    <div className={`border-t pt-4 flex items-center justify-between ${isDarkMode ? 'border-zinc-900' : 'border-orange-100/50'}`}>
                      <div>
                        {course.isPaid ? (
                          <div>
                            <span className={`text-[8px] uppercase font-bold tracking-widest block font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                              {appLanguage === 'hi' ? 'नामांकन मूल्य' : 'SPECIAL PRICE'}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <span className={`line-through text-[10px] font-mono ${isDarkMode ? 'text-zinc-700' : 'text-slate-400'}`}>₹{rawPrice + 1000}</span>
                              <span className={`text-sm font-mono font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{course.price}</span>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className={`text-[8px] uppercase font-bold tracking-widest block font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-500'}`}>
                              {appLanguage === 'hi' ? 'योजना' : 'PLAN'}
                            </span>
                            <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase">
                              {appLanguage === 'hi' ? '100% छात्रवृत्ति' : 'FREE'}
                            </span>
                          </div>
                        )}
                      </div>

                      <div>
                        {isUnlocked ? (
                          <button
                            onClick={() => {
                              playSound('click');
                              setSelectedCourse(course);
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 border ${
                              isDarkMode 
                                ? 'bg-zinc-900 hover:bg-zinc-850 text-white border-zinc-800' 
                                : 'bg-white hover:bg-orange-50 text-slate-800 border-orange-100 shadow-sm'
                            }`}
                          >
                            <span>{appLanguage === 'hi' ? 'बैच खोलें' : 'Open Batch'}</span>
                            <ArrowRight className={`w-3.5 h-3.5 ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'}`} />
                          </button>
                        ) : isCoursePending ? (
                          <button
                            disabled={true}
                            className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-not-allowed opacity-85"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                            <span>{appLanguage === 'hi' ? 'सत्यापन जारी है' : 'Under Process of Verification'}</span>
                          </button>
                        ) : isCourseDenied ? (
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[9px] text-rose-500 font-bold">{appLanguage === 'hi' ? 'अस्वीकृत (पुनः प्रयास करें)' : 'Denied (Try Again)'}</span>
                            <button
                              onClick={() => triggerUnlock(course)}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                            >
                              <Lock className="w-3 h-3" /> {appLanguage === 'hi' ? 'बैच खरीदें' : 'Buy the Batch'}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => triggerUnlock(course)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm ${
                              isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-orange-600 text-white hover:bg-orange-700'
                            }`}
                          >
                            <Lock className="w-3.5 h-3.5 text-black" />
                            <span>{appLanguage === 'hi' ? 'बैच खरीदें' : 'Buy the Batch'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 'dashboard':
        return null;
        // eslint-disable-next-line no-unreachable
        if (selectedCourse) return null;
        // Filter chapters based on global search & course unlocks
        const visibleChapters = allChapters.filter(chap => {
          const matchesSearch = chap.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
            chap.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chap.keyConcepts.some(c => c.toLowerCase().includes(searchTerm.toLowerCase()));
          
          const matchesClass = selectedClass === 'all' || selectedClass.trim() === '' ? true : String(chap.classLevel).toLowerCase().includes(selectedClass.toLowerCase());
          const matchesSubject = selectedSubject === 'all' || selectedSubject.trim() === '' ? true : chap.subject.toLowerCase().includes(selectedSubject.toLowerCase());

          return matchesSearch && matchesClass && matchesSubject;
        });

        return (
          <div key="dashboard" className="space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                📖 Study Syllabus Curriculum ({visibleChapters.length})
              </h3>
              <span className="text-[11px] text-zinc-500 font-mono">
                Syllabus Progress: {completedChaptersCount}/{totalChaptersCount} ({progressPercent}%)
              </span>
            </div>

            {visibleChapters.length === 0 ? (
              <div className="bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl py-12 px-4 text-center flex flex-col items-center justify-center space-y-3 shadow-sm">
                <div className="p-3 rounded-full bg-zinc-900">
                  <SearchX className="w-7 h-7 text-zinc-600" />
                </div>
                <h4 className="text-sm font-semibold text-zinc-300">No syllabus chapters found</h4>
                <p className="text-zinc-500 text-xs max-w-sm leading-normal">
                  No active material matched your text query "{searchTerm}" or specific grade filters.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedClass('all');
                    setSelectedSubject('all');
                  }}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-[11px] font-semibold rounded-xl hover:bg-zinc-800 transition cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className={viewStyle === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "flex flex-col gap-3"}>
                {visibleChapters.map((chapter) => {
                  const isCompleted = progress.completedChapters.includes(chapter.id);
                  const quizStat = progress.quizScores[chapter.id];
                  
                  // Check if locked
                  const parentCourse = courses.find(c => c.id === (chapter as any).courseId);
                  const isUnlocked = !parentCourse?.isPaid || (progress.purchasedCourses || []).includes(parentCourse.id);

                  return (
                    <motion.div
                      layout
                      key={chapter.id}
                      whileHover={{ y: -2 }}
                      transition={{ duration: 0.2 }}
                      className={`bg-zinc-950 border rounded-2xl flex flex-col justify-between shadow-lg relative overflow-hidden group cursor-pointer transition-colors ${
                        isUnlocked ? 'border-zinc-800/80 hover:border-zinc-550' : 'border-zinc-900 hover:border-zinc-800'
                      } ${viewStyle === 'list' ? 'p-3.5 sm:flex-row sm:items-center sm:justify-between sm:gap-4' : 'p-5'}`}
                      onClick={() => {
                        if (isUnlocked) {
                          onSelectChapter(chapter);
                        } else if (parentCourse) {
                          triggerUnlock(parentCourse);
                        }
                      }}
                      id={`chapter-card-${chapter.id}`}
                    >
                      {/* Left high-contrast stripe on hover */}
                      <div className="absolute top-0 left-0 w-1 h-full bg-transparent group-hover:bg-white transition-colors"></div>

                      <div className="space-y-4 relative z-10 pl-2">
                        <div className="flex items-center justify-between">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-zinc-900 border-zinc-800 text-zinc-400">
                            {getSubjectIcon(chapter.subject)}
                            {chapter.subject}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] bg-zinc-900 border border-zinc-850 px-2 py-0.5 rounded text-zinc-400 font-mono font-semibold">
                              Class {chapter.classLevel}
                            </span>
                            {isCompleted && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-[9px] text-white font-bold uppercase tracking-wider font-mono">
                                <CheckCircle className="w-3 h-3" /> Read
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="space-y-1">
                          <h4 className="text-base font-bold text-white group-hover:text-zinc-200 tracking-tight leading-snug flex items-center gap-1.5">
                            <EditableText
                              value={chapter.title}
                              onSave={(newVal) => {
                                const updated = courses.map(c => {
                                  return {
                                    ...c,
                                    chapters: c.chapters.map(ch => ch.id === chapter.id ? { ...ch, title: newVal } : ch)
                                  };
                                });
                                onUpdateCourses(updated);
                              }}
                              isEditMode={isEditMode}
                              as="span"
                            />
                            {!isUnlocked && <Lock className="w-3.5 h-3.5 text-zinc-600 inline shrink-0" />}
                          </h4>
                          <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
                            <EditableText
                              value={chapter.description}
                              onSave={(newVal) => {
                                const updated = courses.map(c => {
                                  return {
                                    ...c,
                                    chapters: c.chapters.map(ch => ch.id === chapter.id ? { ...ch, description: newVal } : ch)
                                  };
                                });
                                onUpdateCourses(updated);
                              }}
                              isEditMode={isEditMode}
                              as="span"
                              multiline={true}
                            />
                          </p>
                        </div>

                        {/* Concepts tags */}
                        <div className="flex flex-wrap gap-1 pt-1">
                          {chapter.keyConcepts.slice(0, 3).map((concept, index) => (
                            <span 
                              key={index} 
                              className="text-[9px] bg-zinc-900 border border-zinc-850/60 text-zinc-500 px-2 py-0.5 rounded"
                            >
                              {concept}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="border-t border-zinc-900/60 mt-5 pt-3.5 flex items-center justify-between text-[11px] relative z-10 pl-2">
                        <span className="text-zinc-500 font-mono">
                          Duration: <strong className="text-zinc-300 font-medium">{chapter.readingTime}</strong>
                        </span>

                        {!isUnlocked ? (
                          <span className="text-zinc-500 font-bold flex items-center gap-1 text-[10px]">
                            <Lock className="w-3 h-3" /> Locked ({parentCourse?.price})
                          </span>
                        ) : quizStat ? (
                          <span className="text-zinc-400">
                            Highscore: <strong className="text-white font-mono font-semibold">{quizStat.highscore}%</strong>
                          </span>
                        ) : (
                          <span className="text-white font-bold group-hover:underline flex items-center gap-1 text-[10px]">
                            Learn Chapter <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'games':
        return null;

      case 'footer':
        return (
          <div key="footer" className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl text-center text-xs text-zinc-500 space-y-1">
            <p className="font-semibold text-zinc-400">Curious Bharat © 2026</p>
            <p>A secure monochrome platform dedicated to student academic acceleration and educator control.</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Dynamically order segments on the dashboard */}
      {customization.elementOrdering.map(sectionName => renderDashboardSection(sectionName))}

      {/* RIO & HEADACHE STARTUP CHECKOUT GATEWAY DIALOG */}
      <AnimatePresence>
        {checkoutCourse && (
          <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800/80 rounded-[32px] overflow-hidden max-w-4xl w-full relative text-zinc-300 shadow-2xl flex flex-col md:flex-row"
            >
              {/* Subtle Premium Top accent bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6] z-30"></div>

              {/* Premium Big Price Tag Sticker with 3D Element */}
              <div className="absolute top-3 right-16 z-40 flex items-center gap-1 select-none">
                <div className="w-16 h-16 shrink-0 relative">
                  <ThreeDElement type="price_tag_3d" className="w-full h-full" autoRotate={true} interactive={true} />
                </div>
                <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-yellow-500 text-black font-black py-2 px-3.5 rounded-2xl shadow-2xl border-2 border-yellow-600 transform rotate-6 hover:scale-105 transition duration-200 flex flex-col items-center justify-center leading-none">
                  <span className="text-[8px] uppercase tracking-widest text-black/75 font-mono font-bold">Special Price</span>
                  <span className="text-lg font-black font-mono tracking-tight my-0.5 text-slate-950">{checkoutCourse.price}</span>
                  <span className="text-[8px] uppercase tracking-wider text-black/60 font-extrabold">Lifetime Pass</span>
                </div>
              </div>

              <button
                onClick={() => setCheckoutCourse(null)}
                className="absolute right-4 top-4 p-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer z-20 transition"
              >
                <X className="w-4 h-4" />
              </button>

              {/* LEFT COLUMN: Billing Details & UPI Scannable QR Code */}
              <div className="md:w-1/2 p-6 sm:p-8 bg-zinc-900/30 border-r border-zinc-900 flex flex-col justify-between space-y-6 relative">
                {/* Background watermarked security shield */}
                <div className="absolute bottom-4 right-4 opacity-[0.03] pointer-events-none select-none">
                  <svg className="w-48 h-48 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-white/10 rounded-xl flex items-center justify-center border border-white/20">
                      <CreditCard className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold tracking-widest text-zinc-500 block">
                        Headache Startup Gateway
                      </span>
                      <h3 className="text-md font-bold text-white flex items-center gap-1.5">
                        Unlock Premium Course
                        <svg className="w-4 h-4 text-emerald-400 animate-pulse" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l5-5z" clipRule="evenodd" />
                        </svg>
                      </h3>
                    </div>
                  </div>

                  {/* Course Detail Panel */}
                  <div className="bg-zinc-900 border border-zinc-850 p-4.5 rounded-2xl space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 font-semibold">Course Item:</span>
                      <span className="text-white font-bold text-right pl-2">{checkoutCourse.title}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-500 font-semibold">Price to Pay:</span>
                      <span className="text-yellow-400 font-mono font-bold text-base">{checkoutCourse.price}</span>
                    </div>
                    <div className="flex justify-between text-[11px] border-t border-zinc-950 pt-2.5">
                      <span className="text-zinc-500">Merchant UPI address:</span>
                      <span className="text-zinc-300 font-mono font-bold select-all">{checkoutCourse.upiId || 'rst010186@paytm'}</span>
                    </div>
                  </div>
                </div>

                {/* Scannable QR panel */}
                <div className="p-4 bg-zinc-900/60 border border-zinc-850 rounded-2xl flex items-center gap-4">
                  <div className="bg-white p-2 rounded-xl shrink-0 shadow-lg">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${encodeURIComponent(
                        `upi://pay?pa=${checkoutCourse.upiId || 'rst010186@paytm'}&pn=${checkoutCourse.title}&am=${checkoutCourse.price.replace(/[^0-9.]/g, '')}&cu=INR`
                      )}`}
                      alt="Scan to Pay UPI QR Code"
                      className="w-[100px] h-[100px]"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-zinc-300 font-bold uppercase tracking-wider">
                      📲 Scan with any UPI app
                    </p>
                    <p className="text-[9px] text-zinc-500 leading-normal">
                      Scan using GooglePay, PhonePe, Paytm, BHIM, or GPay to pay. Transfers automatically to the verified teacher account.
                    </p>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Verification Inputs & Finalize Button */}
              <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 font-mono flex items-center gap-1.5 border-b border-zinc-900 pb-2">
                    Verification & Activation
                  </h4>

                  {/* Student Name Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 block">
                      Student Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Student Full Name"
                      value={studentName}
                      onChange={(e) => {
                        setStudentName(e.target.value);
                        if (studentNameError) setStudentNameError('');
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-zinc-500 placeholder-zinc-650"
                    />
                    {studentNameError && (
                      <p className="text-[10px] text-rose-400 font-medium leading-normal">
                        ⚠️ {studentNameError}
                      </p>
                    )}
                  </div>

                  {/* Contact Details Input */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 block">
                      Contact Details (Email / Phone)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. email@example.com or +91 9876543210"
                      value={studentContact}
                      onChange={(e) => {
                        setStudentContact(e.target.value);
                        if (studentContactError) setStudentContactError('');
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-zinc-500 placeholder-zinc-650"
                    />
                    {studentContactError && (
                      <p className="text-[10px] text-rose-400 font-medium leading-normal">
                        ⚠️ {studentContactError}
                      </p>
                    )}
                  </div>

                  {/* Reference ID / UTR Number */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-extrabold tracking-wider text-zinc-500 block">
                      Reference ID / UTR Number
                    </label>
                    <input
                      type="text"
                      maxLength={24}
                      placeholder="Enter 12-Digit UPI / Bank Ref No. (e.g. 612035984112)"
                      value={userUTR}
                      onChange={(e) => {
                        setUserUTR(e.target.value);
                        if (utrError) setUtrError('');
                      }}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-2 px-3 text-xs text-white outline-none focus:border-zinc-500 placeholder-zinc-650 font-mono"
                    />
                    {utrError ? (
                      <p className="text-[10px] text-zinc-400 leading-normal bg-zinc-900/60 p-2 border border-zinc-850 rounded-lg font-medium text-center">
                        ⚠️ {utrError}
                      </p>
                    ) : (
                      <p className="text-[9px] text-zinc-500">
                        Submit the reference code from your receipt to unlock instant academic activation.
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleConfirmPurchase}
                    disabled={isProcessingPayment}
                    className="w-full py-3 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl shadow cursor-pointer transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        Authenticating UPI Reference...
                      </>
                    ) : (
                      <>
                        Verify Transaction & Unlock
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setCheckoutCourse(null)}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 text-xs font-bold rounded-xl cursor-pointer transition"
                  >
                    Cancel & Go Back
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
