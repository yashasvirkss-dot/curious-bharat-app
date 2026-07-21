import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Check, 
  Zap, 
  BookOpen, 
  FileText, 
  User, 
  Sparkles,
  Search,
  Sliders,
  X,
  Lock,
  ArrowRight,
  ArrowLeft,
  Video,
  Play,
  Brain,
  Download,
  FolderClosed,
  ChevronRight
} from 'lucide-react';
import { Course, StudentAnalysisRecord, OwnerProfile, Chapter, Topic } from '../types';
import { dbService } from '../lib/firebase';
import { translations } from '../lib/translations';
import { playSound } from '../utils/audio';
import { getTenQuestions } from '../utils/quizGenerator';
import FlashcardsView from './FlashcardsView';
import ThreeDElement from './ThreeDElement';

interface BatchesTabProps {
  courses: Course[];
  progress: any;
  onUpdateProgress: (updated: any) => void;
  onSelectChapter: (chapter: any) => void;
  studentAnalysisRecords?: StudentAnalysisRecord[];
  onAddStudentAnalysisRecord?: (record: StudentAnalysisRecord) => void;
  appLanguage?: 'en' | 'hi';
  ownerProfile?: OwnerProfile;
  onOpenCheckout?: (course: Course) => void;
}

export default function BatchesTab({ 
  courses, 
  progress, 
  onUpdateProgress, 
  onSelectChapter,
  studentAnalysisRecords,
  onAddStudentAnalysisRecord,
  appLanguage = 'en',
  ownerProfile,
  onOpenCheckout
}: BatchesTabProps) {
  const t = translations[appLanguage];
  const [purchasedIds, setPurchasedIds] = useState<string[]>(progress.purchasedCourses || []);
  const [referralBalance, setReferralBalance] = useState(0);
  const [referrals, setReferrals] = useState<any[]>([]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterTopic, setFilterTopic] = useState<string>('all');
  const [filterPrice, setFilterPrice] = useState<string>('all');

  // Drilldown state (Enabling YouTube Playlist view of chapter folders inside BatchesTab)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedChapter, setSelectedChapterState] = useState<Chapter | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [activeTopicTab, setActiveTopicTab] = useState<'lecture' | 'notes' | 'quiz' | 'flashcards' | 'dpp'>('lecture');

  // Storage Permission and File Download state inside BatchesTab
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string>('');
  const [showDownloadAlert, setShowDownloadAlert] = useState<string | null>(null);

  const handleDownloadClick = (url: string, title: string) => {
    if (ownerProfile && ownerProfile.allowDownloads === false) {
      const institute = ownerProfile.instituteName || 'The Academy';
      const msg = appLanguage === 'hi'
        ? `${institute} ने सुरक्षा कारणों से अध्ययन सामग्री के सीधे डाउनलोड को अक्षम कर दिया है।`
        : `${institute} has restricted direct downloads of academic study material for safety and security.`;
      alert(msg);
      return;
    }
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

  // Load referral details
  useEffect(() => {
    const loadReferrals = async () => {
      const studentId = progress.studentName ? progress.studentName.replace(/\s+/g, '_').toLowerCase() : 'default_student';
      const status = await dbService.getReferralStatus(studentId);
      setReferralBalance(status.balance);
      setReferrals(status.referrals);
    };
    loadReferrals();
  }, [progress.studentName]);

  const handlePurchase = async (course: Course) => {
    if (onOpenCheckout) {
      onOpenCheckout(course);
      return;
    }

    const coursePriceNum = parseInt(course.price.replace(/[^0-9]/g, '')) || 0;
    
    let priceToPay = coursePriceNum;
    let newReferralBal = referralBalance;
    if (referralBalance > 0) {
      if (referralBalance >= priceToPay) {
        newReferralBal -= priceToPay;
        priceToPay = 0;
      } else {
        priceToPay -= referralBalance;
        newReferralBal = 0;
      }
    }

    if (priceToPay > 0) {
      const confirmMsg = appLanguage === 'hi'
        ? `"${course.title}" के लिए ₹${priceToPay} का भुगतान करें (₹${referralBalance - newReferralBal} छूट लागू की गई)?`
        : `Proceed to payment of ₹${priceToPay} (applied discount of ₹${referralBalance - newReferralBal}) for "${course.title}"?`;
      const confirmed = window.confirm(confirmMsg);
      if (!confirmed) return;
    } else {
      const successMsg = appLanguage === 'hi'
        ? `बधाई हो! आपके रेफ़रल वॉलेट का उपयोग करके पूरी तरह से बैच अनलॉक हो गया! शेष राशि: ₹${newReferralBal}`
        : `Hurray! Batch purchased completely using your Referral Wallet! Balance remaining: ₹${newReferralBal}`;
      alert(successMsg);
    }

    const updatedPurchased = [...purchasedIds, course.id];
    setPurchasedIds(updatedPurchased);

    const updatedProgress = {
      ...progress,
      purchasedCourses: updatedPurchased,
      totalXP: (progress.totalXP || 0) + 200
    };
    onUpdateProgress(updatedProgress);

    setReferralBalance(newReferralBal);
    const studentId = progress.studentName ? progress.studentName.replace(/\s+/g, '_').toLowerCase() : 'default_student';
    await dbService.saveReferralStatus(studentId, newReferralBal, referrals);
  };

  // Filter & Search computation
  const filteredCourses = courses.filter(course => {
    // If course/batch is marked hidden by the educator, hide it from students
    if (course.hidden) return false;

    // Search match
    const titleMatch = course.title.toLowerCase().includes(searchQuery.toLowerCase());
    const descMatch = course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const subjectMatch = course.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = titleMatch || descMatch || subjectMatch;

    if (!matchesSearch) return false;

    // Class match
    const hasChapters = course.chapters && course.chapters.length > 0;
    const classLevel = hasChapters ? String(course.chapters[0].classLevel) : '';
    if (filterClass !== 'all' && filterClass.trim() !== '' && !classLevel.toLowerCase().includes(filterClass.toLowerCase())) return false;

    // Subject/Topic match
    if (filterTopic !== 'all' && filterTopic.trim() !== '' && !course.subject.toLowerCase().includes(filterTopic.toLowerCase())) return false;

    // Price match
    if (filterPrice === 'free' && course.isPaid) return false;
    if (filterPrice === 'paid' && !course.isPaid) return false;

    return true;
  });

  const getChapterTopics = (chapter: Chapter): Topic[] => {
    let topicsList: Topic[] = [];
    if (chapter.topics && chapter.topics.length > 0) {
      topicsList = chapter.topics;
    } else {
      topicsList = [
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
    }
    // Filter out hidden topics for students
    return topicsList.filter(t => !t.hidden);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    try {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = url.match(regExp);
      if (match && match[2].length === 11) {
        return `https://www.youtube.com/embed/${match[2]}`;
      }
    } catch (e) {
      console.warn("Error parsing YouTube embed url", e);
    }
    return url;
  };

  // Local Quiz & Flashcards states
  const [topicQuizIndex, setTopicQuizIndex] = useState(0);
  const [topicQuizSelected, setTopicQuizSelected] = useState<number | null>(null);
  const [topicQuizAnswered, setTopicQuizAnswered] = useState(false);
  const [topicQuizScore, setTopicQuizScore] = useState(0);
  const [topicQuizFeedback, setTopicQuizFeedback] = useState('');

  const [topicFcIndex, setTopicFcIndex] = useState(0);
  const [topicFcFlipped, setTopicFcFlipped] = useState(false);

  return (
    <div className="space-y-6 pb-24 max-w-5xl mx-auto px-4 sm:px-6">
      
      {/* Toast Alert Notification */}
      {showDownloadAlert && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-black px-4 py-3 rounded-2xl shadow-2xl border border-emerald-400 font-bold flex items-center gap-2 animate-bounce">
          <span className="text-base">📥</span>
          <span className="text-xs">{showDownloadAlert}</span>
        </div>
      )}

      {/* Premium Storage Download Permission Modal */}
      {showStorageModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl animate-scaleUp">
            {/* Top Premium Decorative Stripe */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>

            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-indigo-500 text-2xl shadow-lg">
                💾
              </div>
              <h3 className="text-lg font-black text-white">
                {appLanguage === 'hi' ? 'भंडारण अनुमति आवश्यक है' : 'Storage Permission Required'}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-xs mx-auto">
                {appLanguage === 'hi' 
                  ? 'स्थानीय अध्ययन नोट्स (पीडीएफ) और दैनिक अभ्यास समस्याओं (डीपीपी) को सुरक्षित रूप से सहेजने और ऑफ़लाइन एक्सेस करने के लिए कृपया भंडारण की अनुमति दें।'
                  : 'To save local Study Notes (PDF) and Daily Practice Problems (DPP) securely for offline reference, please grant storage authorization.'}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setShowStorageModal(false)}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 border border-zinc-850 hover:text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  {appLanguage === 'hi' ? 'अस्वीकार करें' : 'Deny'}
                </button>
                <button
                  onClick={handleGrantPermission}
                  className="py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{appLanguage === 'hi' ? 'अनुमति दें' : 'Grant Permission'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTopic ? (
        // LEVEL 3: Active Topic Study Tabs inside Batches
        <div className="space-y-6 animate-fadeIn">
          {/* Breadcrumb controls */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => { playSound('click'); setSelectedTopic(null); }}
              className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to {selectedChapter.title}</span>
            </button>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 space-y-6">
            <div>
              <span className="text-[10px] bg-zinc-900 border border-zinc-850 text-amber-500 px-2.5 py-1 rounded-lg font-mono font-bold tracking-widest uppercase mb-1 inline-block">
                🇮🇳 BHARAT STUDY CHAMBER
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                {selectedTopic.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                {selectedTopic.description}
              </p>
            </div>

            {/* Study Tabs Selector */}
            <div className="flex flex-wrap gap-1.5 border-b border-zinc-900 pb-3">
              {[
                { id: 'lecture', label: appLanguage === 'hi' ? 'व्याख्यान' : 'Lecture Video' },
                { id: 'notes', label: appLanguage === 'hi' ? 'अध्ययन नोट्स' : 'Revision Notes' },
                { id: 'quiz', label: appLanguage === 'hi' ? 'अभ्यास प्रश्नोत्तरी' : 'MCQ Quiz' },
                { id: 'flashcards', label: appLanguage === 'hi' ? 'माइंड मैप' : 'Mind Map' },
                { id: 'dpp', label: appLanguage === 'hi' ? 'अभ्यास पत्रक (DPP)' : 'DPP Sheets' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => { playSound('click'); setActiveTopicTab(tab.id as any); }}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    activeTopicTab === tab.id 
                      ? 'bg-white text-black font-extrabold shadow-sm'
                      : 'bg-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab contents */}
            <div className="pt-2">
              {/* 1. LECTURE VIDEO */}
              {activeTopicTab === 'lecture' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {selectedTopic.lectureUrl ? (
                    <div className="space-y-4">
                      <div className="w-full aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-900 shadow-xl relative">
                        {getYouTubeEmbedUrl(selectedTopic.lectureUrl) ? (
                          <iframe
                            src={getYouTubeEmbedUrl(selectedTopic.lectureUrl)}
                            title={selectedTopic.title}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center">
                            <Video className="w-12 h-12 text-zinc-600 animate-pulse" />
                            <a 
                              href={selectedTopic.lectureUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-4 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                            >
                              <span>Open Video Link</span>
                              <ChevronRight className="w-4 h-4" />
                            </a>
                          </div>
                        )}
                      </div>
                      <div className="p-4 bg-zinc-900/35 border border-zinc-900 rounded-2xl flex items-center justify-between text-xs text-zinc-400">
                        <span className="font-mono">Progress status: Fully Synced</span>
                        <span className="text-emerald-500 font-bold">● Streaming Enabled</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      No video lectures synced for this topic yet. Instructors are reviewing content.
                    </div>
                  )}
                </div>
              )}

              {/* 2. REVISION NOTES */}
              {activeTopicTab === 'notes' && (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {selectedTopic.sections && selectedTopic.sections.length > 0 ? (
                    <div className="space-y-4">
                      {selectedTopic.sections.map((sec: any) => (
                        <div key={sec.id} className="bg-zinc-900/20 border border-zinc-900 p-5 rounded-2xl space-y-3">
                          <h4 className="text-sm font-bold text-white">{sec.title}</h4>
                          <p className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line">{sec.body}</p>
                          {sec.keyPoints && sec.keyPoints.length > 0 && (
                            <div className="pt-3 border-t border-zinc-900 space-y-1.5">
                              <span className="text-[10px] font-bold text-zinc-500 uppercase">Key Takeaways</span>
                              {sec.keyPoints.map((pt: string, idx: number) => (
                                <div key={idx} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                  <span className="text-emerald-500 font-bold mt-0.5">•</span>
                                  <span>{pt}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-zinc-500 text-xs">
                      Revision study notes are being prepared by the national educator.
                    </div>
                  )}
                </div>
              )}

              {/* 3. MCQ QUIZ */}
              {activeTopicTab === 'quiz' && (
                <div className="space-y-4 max-w-xl mx-auto bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl">
                  {selectedTopic.quiz && selectedTopic.quiz.length > 0 ? (
                    (() => {
                      const qList = getTenQuestions(selectedTopic.quiz, selectedTopic.id, selectedTopic.title, selectedTopic.subject || '');
                      const isFinished = topicQuizIndex >= qList.length;

                      if (isFinished) {
                        return (
                          <div className="text-center py-8 space-y-4">
                            <span className="text-4xl">🏆</span>
                            <div className="space-y-1">
                              <h4 className="text-base font-bold text-white uppercase tracking-tight">Practice Challenge Done!</h4>
                              <p className="text-xs text-zinc-400">
                                You scored <span className="font-mono text-white font-black">{topicQuizScore} / {qList.length}</span> correct answers!
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
                              className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition"
                            >
                              Retake Quiz
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
                          setTopicQuizFeedback('✓ Correct! Incredible understanding of core physics/science.');
                          onUpdateProgress({
                            ...progress,
                            totalXP: (progress.totalXP || 0) + 15
                          });
                        } else {
                          playSound('wrong');
                          setTopicQuizFeedback(`❌ Incorrect. Correct answer: ${activeQ.options[activeQ.correctAnswerIndex]}`);
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
                            <span>+15 XP Reward / Answer</span>
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
                            {activeQ.options.map((opt: string, idx: number) => {
                              let btnStyle = "bg-zinc-900 border-zinc-850 text-zinc-400 hover:text-white hover:border-zinc-700";
                              if (topicQuizSelected === idx) {
                                btnStyle = "bg-zinc-800 border-white text-white";
                              }
                              if (topicQuizAnswered) {
                                if (idx === activeQ.correctAnswerIndex) {
                                  btnStyle = "bg-emerald-950/45 border-emerald-500 text-emerald-400";
                                } else if (topicQuizSelected === idx) {
                                  btnStyle = "bg-rose-950/45 border-rose-500 text-rose-400";
                                } else {
                                  btnStyle = "bg-zinc-900/40 border-zinc-850/30 text-zinc-650";
                                }
                              }

                              return (
                                <button
                                  key={idx}
                                  disabled={topicQuizAnswered}
                                  onClick={() => { playSound('click'); setTopicQuizSelected(idx); }}
                                  className={`w-full p-3 rounded-xl border text-left text-xs font-semibold transition cursor-pointer flex items-center justify-between ${btnStyle}`}
                                >
                                  <span>{opt}</span>
                                  {topicQuizAnswered && idx === activeQ.correctAnswerIndex && (
                                    <span className="text-emerald-500 font-mono text-[9px] font-bold">CORRECT</span>
                                  )}
                                </button>
                              );
                            })}
                          </div>

                          {topicQuizFeedback && (
                            <p className="text-xs font-bold text-zinc-300 bg-zinc-900/60 p-3 rounded-xl border border-zinc-850 text-center">
                              {topicQuizFeedback}
                            </p>
                          )}

                          <div className="pt-2 flex justify-end">
                            {!topicQuizAnswered ? (
                              <button
                                onClick={checkAnswer}
                                disabled={topicQuizSelected === null}
                                className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition disabled:opacity-50 cursor-pointer"
                              >
                                Submit Answer
                              </button>
                            ) : (
                              <button
                                onClick={handleNext}
                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-bold text-xs rounded-xl transition cursor-pointer"
                              >
                                {topicQuizIndex === qList.length - 1 ? 'Finish Challenge' : 'Next Question →'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-8 text-zinc-500 text-xs">
                      Self evaluation MCQ challenges are being compiled for this topic.
                    </div>
                  )}
                </div>
              )}
              {activeTopicTab === 'flashcards' && (
                <div className="w-full">
                  <FlashcardsView
                    embedded={true}
                    chapter={{
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
                      const existingStatus = progress.flashcardStatus && progress.flashcardStatus[cardId];
                      onUpdateProgress({
                        ...progress,
                        totalXP: (progress.totalXP || 0) + (existingStatus ? 0 : 5),
                        flashcardStatus: {
                          ...(progress.flashcardStatus || {}),
                          [cardId]: rating
                        }
                      });
                    }}
                    onOpenAI={(mode, context, customPrompt) => {
                      alert(`Bharat AI: Analyzing concept context in detail... \n\nFocus Area: ${context}\n\nPrompt: ${customPrompt || 'Please explain.'}`);
                    }}
                  />
                </div>
              )}

              {/* 5. DPP SHEETS */}
              {activeTopicTab === 'dpp' && (
                <div className="space-y-4 max-w-md mx-auto bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl">
                  <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      Daily Practice Worksheets
                    </h3>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-white block">Syllabus Revision Notes PDF</span>
                        <span className="text-[10px] text-zinc-500 block">Class Revision Materials</span>
                      </div>
                      {selectedTopic.pdfUrl ? (
                        <button
                          onClick={() => handleDownloadClick(selectedTopic.pdfUrl || '', `${selectedTopic.title} Revision Notes`)}
                          className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1"
                        >
                          <Download className="w-3 h-3 text-emerald-400" />
                          <span>Download</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-600 font-mono">🔒 Unlinked</span>
                      )}
                    </div>

                    {selectedTopic.dppFiles && selectedTopic.dppFiles.length > 0 ? (
                      selectedTopic.dppFiles.map((file, idx) => (
                        <div key={file.id || idx} className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                          <div className="space-y-0.5 text-left">
                            <span className="text-xs font-bold text-white block">{file.name || `Practice Sheet Day #${idx + 1}`}</span>
                            <span className="text-[10px] text-zinc-500 block">Homework Sheet • Day Wise</span>
                          </div>
                          <button
                            onClick={() => handleDownloadClick(file.url || '', file.name || `Daily Practice DPP Sheet Day #${idx + 1}`)}
                            className="px-3 py-1.5 bg-cyan-950/40 border border-cyan-800/40 hover:bg-cyan-900/50 text-cyan-400 rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Download className="w-3 h-3 text-cyan-400" />
                            <span>Download</span>
                          </button>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-between p-3.5 bg-zinc-900/60 rounded-xl border border-zinc-850">
                        <div className="space-y-0.5 text-left">
                          <span className="text-xs font-bold text-white block">Daily Practice Problems (DPP)</span>
                          <span className="text-[10px] text-zinc-500 block">Homework Worksheet Challenge</span>
                        </div>
                        {selectedTopic.dppUrl ? (
                          <button
                            onClick={() => handleDownloadClick(selectedTopic.dppUrl || '', `${selectedTopic.title} DPP Sheet`)}
                            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-[10px] transition cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <Download className="w-3 h-3 text-sky-400" />
                            <span>Download</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-600 font-mono">🔒 Unlinked</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      ) : selectedChapter ? (
        // LEVEL 2: Chapter Folder Topics drilling inside Batches
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <button
              onClick={() => { playSound('click'); setSelectedChapterState(null); }}
              className="px-3 py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to chapters playlist</span>
            </button>
          </div>

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
                <div className="text-center py-10 rounded-2xl text-xs border bg-zinc-950 border-zinc-900 text-zinc-500">
                  {appLanguage === 'hi' ? 'इस अध्याय फ़ोल्डर के अंदर अभी कोई विषय नहीं है।' : 'No nested topics uploaded inside this chapter folder yet.'}
                </div>
              );
            }

            return (
              <div className="space-y-3 animate-fadeIn">
                {topicsList.map(topic => (
                  <div
                    key={topic.id}
                    onClick={() => { playSound('click'); setSelectedTopic(topic); }}
                    className="rounded-2xl p-4 flex items-center justify-between gap-4 cursor-pointer group relative transition border bg-zinc-950 border-zinc-900/85 hover:border-zinc-700"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border bg-zinc-900 border-zinc-855">
                        <FileText className="w-5 h-5 text-zinc-400 group-hover:text-white transition-colors" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-zinc-500">
                          {appLanguage === 'hi' ? 'सक्रिय फ़ोल्डर विषय' : 'Active Folder Topic'}
                        </span>
                        <h4 className="text-sm font-bold leading-tight text-white group-hover:text-zinc-200">
                          {topic.title}
                        </h4>
                        <p className="text-xs leading-normal line-clamp-1 text-zinc-500">
                          {topic.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-xs font-mono text-zinc-500">
                      <span className="hidden sm:inline">{appLanguage === 'hi' ? 'अध्ययन' : 'Study'}</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform text-zinc-400" />
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      ) : selectedCourse ? (
        // LEVEL 1: YouTube Playlist inside folder style view of Selected Batch
        <div className="space-y-6 animate-fadeIn">
          {/* Playlist Header Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => { playSound('click'); setSelectedCourse(null); }}
              className="px-3 py-2 rounded-xl border flex items-center justify-center transition hover:text-white bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-400 gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="text-xs font-bold font-sans">Back to Batches</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: YouTube Playlist Glass Metadata Card */}
            <div className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="border rounded-3xl p-6 space-y-5 relative overflow-hidden shadow-2xl bg-zinc-950/70 backdrop-blur-md border-zinc-900/80 text-white">
                {/* PREMIUM TOP BORDER STRIPE */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>

                {/* Large Playlist Thumbnail Image */}
                <div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-zinc-850 overflow-hidden relative shadow-md select-none">
                  {selectedCourse.thumbnailUrl ? (
                    <img 
                      src={selectedCourse.thumbnailUrl} 
                      alt={selectedCourse.title} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-tr from-orange-600/20 via-zinc-900 to-emerald-600/20 flex flex-col items-center justify-center p-4">
                      <Video className="w-8 h-8 text-zinc-400 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold tracking-widest text-zinc-500 uppercase mt-2">BHARAT GURUKUL</span>
                    </div>
                  )}
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

                <div className="border-t border-zinc-900/60 pt-4 space-y-2 text-xs font-medium">
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
                        setSelectedChapterState(selectedCourse.chapters[0]);
                      }
                    }}
                    className="w-full py-3 bg-white text-black hover:bg-zinc-200 transition font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <Play className="w-4 h-4 fill-black text-black" />
                    <span>Play All Syllabus</span>
                  </button>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Sequential Tracks Layout */}
            <div className="lg:col-span-8 space-y-3">
              {selectedCourse.chapters.filter(ch => !ch.hidden).length === 0 ? (
                <div className="text-center py-16 border rounded-3xl text-xs bg-zinc-950 border-zinc-900 text-zinc-500">
                  {appLanguage === 'hi' ? 'इस बैच के तहत अभी कोई अध्याय नामांकित नहीं है।' : 'No chapters enrolled under this batch track yet. Admins can sync modules.'}
                </div>
              ) : (
                selectedCourse.chapters.filter(ch => !ch.hidden).map((chapter, index) => (
                  <div
                    key={chapter.id}
                    className="rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all border group relative hover:-translate-y-0.5 duration-200 cursor-pointer bg-zinc-950 hover:bg-zinc-900/60 border-zinc-900 hover:border-zinc-700"
                    onClick={() => { playSound('click'); setSelectedChapterState(chapter); }}
                  >
                    {/* LEFT SIDE: Chapter Number, Thumbnail, details */}
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      {/* Sequence Track Number */}
                      <span className="text-sm font-mono font-bold w-6 text-center text-zinc-600 group-hover:text-white">
                        {String(index + 1).padStart(2, '0')}
                      </span>

                      {/* Small Chapter Video Preview layout */}
                      <div className="w-20 aspect-video rounded-lg flex items-center justify-center shrink-0 border relative overflow-hidden bg-zinc-900 border-zinc-800">
                        <FolderClosed className="w-5 h-5 transition-transform duration-300 group-hover:scale-110 text-zinc-500 group-hover:text-zinc-300" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                          <Play className="w-4 h-4 fill-white text-white scale-90 group-hover:scale-100 transition-all duration-300" />
                        </div>
                      </div>

                      {/* Title, tags and Desc */}
                      <div className="space-y-0.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] px-2 py-0.5 rounded font-mono font-bold bg-zinc-900 text-zinc-400">
                            {chapter.subject}
                          </span>
                          <span className="text-[9px] px-2 py-0.5 rounded font-mono font-semibold bg-zinc-900/60 text-zinc-400">
                            Class {chapter.classLevel}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold leading-tight truncate max-w-[280px] sm:max-w-md text-white group-hover:text-zinc-200">
                          {chapter.title}
                        </h4>
                        <p className="text-xs line-clamp-1 max-w-[280px] sm:max-w-md text-zinc-500 animate-pulse">
                          {chapter.description}
                        </p>
                      </div>
                    </div>

                    {/* RIGHT SIDE: Action details & direct pdf resources */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto sm:shrink-0 justify-end mt-2 sm:mt-0" onClick={(e) => e.stopPropagation()}>
                      {chapter.pdfUrl && (
                        <button
                          onClick={() => handleDownloadClick(chapter.pdfUrl || '', `${chapter.title} Study Notes`)}
                          className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 bg-zinc-900 hover:bg-zinc-880 border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white"
                          title="Download Class Reference Material PDF"
                        >
                          <Download className="w-3 h-3 text-emerald-400" /> Notes PDF
                        </button>
                      )}
                      {chapter.dppUrl && (
                        <button
                          onClick={() => handleDownloadClick(chapter.dppUrl || '', `${chapter.title} Practice DPP Sheet`)}
                          className="px-2.5 py-1.5 rounded-lg border text-[10px] font-bold flex items-center gap-1 cursor-pointer transition active:scale-95 bg-zinc-900 hover:bg-zinc-880 border-zinc-800 hover:border-zinc-600 text-zinc-300 hover:text-white"
                          title="Download Practice Worksheet (DPP)"
                        >
                          <Download className="w-3 h-3 text-sky-400" /> DPP Sheet
                        </button>
                      )}

                      <button
                        onClick={() => { playSound('click'); setSelectedChapterState(chapter); }}
                        className="p-1.5 rounded-lg border flex items-center justify-center cursor-pointer transition active:scale-95 bg-zinc-950 hover:bg-zinc-900 border-zinc-900 hover:border-zinc-700 text-zinc-400 hover:text-white"
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
      ) : (
        // LEVEL 0: Grid/List View of Batches (Now refactored into a super prominent visual grid with premium lines)
        <div className="space-y-6">
          
          {/* Batches Header with Premium theme */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>
            <div className="absolute top-4 right-4 w-32 h-32 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex-1 text-center md:text-left">
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2.5 py-1 rounded-full font-mono font-bold tracking-widest uppercase mb-2 inline-block">
                {appLanguage === 'hi' ? '🎓 शैक्षणिक राष्ट्रीय बैच' : '🎓 CURATED ACADEMIC BATCHES'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {appLanguage === 'hi' ? 'चयनित शैक्षणिक पाठ्यक्रम बैच' : 'Curated Academic Syllabi Batches'}
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 max-w-lg leading-relaxed">
                {appLanguage === 'hi' 
                  ? 'भारत के शीर्ष व्यवस्थित बैचों में दाखिला लें। पूर्ण सीबीएसई/एनसीईआरटी अध्याय, टेस्ट तैयारी, और आधिकारिक बोर्ड प्रश्न हल करें।'
                  : "Enroll in India's top structured, high-tier classes. Complete CBSE/NCERT chapters, test prep, DPPs, and official CBSE board PYQs."}
              </p>
            </div>

            <div className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 flex items-center justify-center bg-zinc-900/40 rounded-full border border-zinc-850 p-2">
              <ThreeDElement type="books_bundle_3d" className="w-full h-full" />
            </div>
          </div>

          {/* Embedded Search and Toggleable Filter Bar */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-4 space-y-3">
            <div className="flex gap-2">
              {/* Top Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder={t.search_placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 focus:border-zinc-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2 text-[10px] text-zinc-400 hover:text-white bg-zinc-800 px-2 py-1 rounded font-mono"
                  >
                    {appLanguage === 'hi' ? 'साफ़ करें' : 'Clear'}
                  </button>
                )}
              </div>

              {/* Collapsible Corner Filter Icon Button */}
              <button
                onClick={() => {
                  playSound('click');
                  setShowFilters(!showFilters);
                }}
                className={`px-4 py-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
                  showFilters || filterClass !== 'all' || filterTopic !== 'all' || filterPrice !== 'all'
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:bg-zinc-800'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span className="hidden sm:inline">{t.filter_btn}</span>
                {(filterClass !== 'all' || filterTopic !== 'all' || filterPrice !== 'all') && (
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                )}
              </button>
            </div>

            {/* Customization Options - Only visible when showFilters is true */}
            {showFilters && (
              <div className="p-4 bg-zinc-900/40 border border-zinc-900 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fadeIn">
                {/* 1. Class Level */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                    {appLanguage === 'hi' ? 'ग्रेड स्तर / कक्षा' : 'Class / Grade Level'}
                  </label>
                  <input
                    type="text"
                    placeholder={appLanguage === 'hi' ? 'उदा. 10, Kindergarten, Post Doc' : 'e.g. 10, Kindergarten, Post Doc'}
                    value={filterClass === 'all' ? '' : filterClass}
                    onChange={(e) => setFilterClass(e.target.value || 'all')}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 placeholder-zinc-700"
                  />
                </div>

                {/* 2. Topic / Subject */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                    {appLanguage === 'hi' ? 'विषय' : 'Subject'}
                  </label>
                  <input
                    type="text"
                    placeholder={appLanguage === 'hi' ? 'उदा. Physics, Botany, Maths' : 'e.g. Physics, Botany, Maths'}
                    value={filterTopic === 'all' ? '' : filterTopic}
                    onChange={(e) => setFilterTopic(e.target.value || 'all')}
                    className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-zinc-700 placeholder-zinc-700"
                  />
                </div>

                {/* 3. Price mode */}
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider block">
                    {t.filter_price}
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {['all', 'free', 'paid'].map(pm => (
                      <button
                        key={pm}
                        onClick={() => setFilterPrice(pm)}
                        className={`px-2.5 py-1 rounded text-[10px] font-semibold ${
                          filterPrice === pm
                            ? 'bg-white text-black'
                            : 'bg-zinc-950 text-zinc-400 border border-zinc-850 hover:bg-zinc-900'
                        }`}
                      >
                        {pm === 'all' ? t.all : pm === 'free' ? t.free : t.paid}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Course/Batch List Section in list view format */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
                {appLanguage === 'hi' ? 'नामांकित एवं उपलब्ध बैच' : 'Enrolled & Available Batches'} ({filteredCourses.length})
              </h4>
              <span className="text-[10px] text-zinc-500 font-mono">
                {appLanguage === 'hi' ? 'हिंग्लिश (हिंदी + अंग्रेजी) व्याख्यान' : 'Hinglish (Hindi + English) Lectures'}
              </span>
            </div>

            {filteredCourses.length === 0 ? (
              <div className="text-center py-12 bg-zinc-950 border border-zinc-900 rounded-2xl text-xs text-zinc-500">
                {appLanguage === 'hi' ? 'कोई बैच आपके खोज मापदंड से मेल नहीं खाता।' : 'No active batches matched your search query or filters.'}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                {filteredCourses.map((course) => {
                  const isCourseApproved = studentAnalysisRecords && studentAnalysisRecords.some(r => r.courseId === course.id && r.studentName === progress.studentName && r.status === 'approved');
                  const isCoursePending = studentAnalysisRecords && studentAnalysisRecords.some(r => r.courseId === course.id && r.studentName === progress.studentName && r.status === 'pending');
                  const isPurchased = !course.isPaid || isCourseApproved || (progress.purchasedCourses || []).includes(course.id);
                  const rawPrice = parseInt(course.price.replace(/[^0-9]/g, '')) || 0;
                  const hasChapters = course.chapters && course.chapters.length > 0;
                  const classLevelStr = hasChapters ? `Class ${course.chapters[0].classLevel}th` : 'All Class';

                  return (
                    <div 
                      key={course.id} 
                      className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 hover:border-zinc-700/80 hover:shadow-2xl transition relative overflow-hidden group flex flex-col justify-between h-full space-y-5"
                      id={`batch-row-${course.id}`}
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
                        <div className="w-full aspect-video rounded-2xl bg-zinc-900 border border-zinc-850 overflow-hidden relative select-none shadow-lg group-hover:scale-[1.01] transition-all duration-300 flex items-center justify-center">
                          {course.thumbnailUrl ? (
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title} 
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="w-20 h-20 relative mb-1 flex items-center justify-center">
                                <ThreeDElement 
                                  type={course.id.includes('biology') ? 'walkingGirl' : (course.id.includes('chemistry') ? 'shortsBoy' : 'backpackBoy')} 
                                  className="w-full h-full" 
                                />
                              </div>
                              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-zinc-500">Premium Study Batch</span>
                            </div>
                          )}

                          {/* Status overlay */}
                          <div className="absolute top-3 right-3 flex gap-1.5 z-10">
                            {isPurchased ? (
                              <span className="text-[9px] bg-emerald-500 text-black px-2.5 py-0.5 rounded-lg font-extrabold flex items-center gap-1 shadow-md">
                                <Check className="w-3 h-3" /> Unlocked
                              </span>
                            ) : isCoursePending ? (
                              <span className="text-[9px] bg-amber-500/20 text-amber-500 border border-amber-500/40 px-2.5 py-0.5 rounded-lg font-extrabold flex items-center gap-1.5 shadow-md animate-pulse">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                Under Verification
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
                            <span className="text-[9px] bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 rounded-lg text-zinc-400 font-extrabold font-mono tracking-wider">
                              {course.subject === 'Physics' && appLanguage === 'hi' ? 'भौतिकी' : course.subject === 'Chemistry' && appLanguage === 'hi' ? 'रसायन विज्ञान' : course.subject === 'Biology' && appLanguage === 'hi' ? 'जीव विज्ञान' : course.subject}
                            </span>
                            <span className="text-[9px] bg-zinc-900 border border-zinc-850 px-2.5 py-0.5 rounded-lg text-zinc-400 font-extrabold font-mono tracking-wider">
                              {classLevelStr}
                            </span>
                            {course.specialAIFeature && (
                              <span className="text-[9px] bg-indigo-500/10 border border-indigo-500/25 px-2.5 py-0.5 rounded-lg text-indigo-400 font-extrabold font-mono tracking-wider flex items-center gap-1 animate-pulse">
                                <Sparkles className="w-2.5 h-2.5" /> PREMIUM AI BATCH
                              </span>
                            )}
                          </div>

                          <h3 className="text-base font-extrabold text-white leading-snug group-hover:text-amber-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                            {course.description}
                          </p>

                          {/* Premium Features Generated by AI */}
                          {course.specialAIFeature && (
                            <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 text-xs space-y-2 text-left">
                              <span className="text-[9px] uppercase font-extrabold tracking-widest text-amber-500 flex items-center gap-1">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Premium Features Generated by AI
                              </span>
                              <div className="space-y-1">
                                {course.specialAIFeature.split('\n').map((pt: string, idx: number) => {
                                  const cleanPt = pt.trim().replace(/^[•\-\*]\s*/, '');
                                  if (!cleanPt) return null;
                                  return (
                                    <div key={idx} className="flex items-center gap-1.5 text-zinc-300 text-[11px]">
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

                      {/* Pricing and Action Trigger */}
                      <div className="border-t border-zinc-900 pt-4 flex items-center justify-between">
                        <div>
                          {course.isPaid ? (
                            <div>
                              <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 block font-mono">
                                {appLanguage === 'hi' ? 'नामांकन मूल्य' : 'SPECIAL PRICE'}
                              </span>
                              <div className="flex items-center gap-1.5">
                                <span className="text-zinc-650 line-through text-[10px] font-mono">₹{rawPrice + 1000}</span>
                                <span className="text-sm font-mono font-extrabold text-white">{course.price}</span>
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span className="text-[8px] uppercase font-bold tracking-widest text-zinc-500 block font-mono">
                                {appLanguage === 'hi' ? 'योजना' : 'PLAN'}
                              </span>
                              <span className="text-xs font-mono font-extrabold text-emerald-400 uppercase">
                                {appLanguage === 'hi' ? '100% छात्रवृत्ति' : 'FREE'}
                              </span>
                            </div>
                          )}
                        </div>

                        <div>
                          {isPurchased ? (
                            <button
                              onClick={() => {
                                playSound('click');
                                setSelectedCourse(course);
                              }}
                              className="px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-white rounded-xl text-xs font-bold border border-zinc-800 transition cursor-pointer flex items-center gap-1.5"
                            >
                              <span>{appLanguage === 'hi' ? 'बैच खोलें' : 'Open Batch'}</span>
                              <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                            </button>
                          ) : isCoursePending ? (
                            <button
                              disabled={true}
                              className="px-4 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-not-allowed opacity-85"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>{appLanguage === 'hi' ? 'सत्यापन जारी है' : 'Under Process of Verification'}</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handlePurchase(course)}
                              className="px-4 py-2 bg-white text-black hover:bg-zinc-200 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 shadow-sm"
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
            )}
          </div>
        </div>
      )}

    </div>
  );
}
