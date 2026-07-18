import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Brain, ArrowRight, User, School, BookOpen, GraduationCap, Volume2 } from 'lucide-react';
import { UserProgress } from '../types';
import { playSound } from '../utils/audio';
// @ts-ignore
import kaluAndBuddhuImg from '../assets/images/kalu_and_buddhu_1784268211413.jpg';

interface OnboardingWizardProps {
  onComplete: (newProgress: UserProgress) => void;
  isDarkMode?: boolean;
}

export default function OnboardingWizard({ onComplete, isDarkMode = true }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [school, setSchool] = useState('');
  const [grade, setGrade] = useState('Class 10th');
  const [subjectInterest, setSubjectInterest] = useState('All');
  const [mentorPref, setMentorPref] = useState<'kalu' | 'buddhu' | 'both'>('both');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationMessage, setOptimizationMessage] = useState('');

  const handleNextStep = () => {
    playSound('click');
    if (step === 2 && !name.trim()) {
      alert("Please enter your name to proceed, Curious Scientist!");
      return;
    }
    setStep(prev => prev + 1);
  };

  const handlePrevStep = () => {
    playSound('click');
    setStep(prev => Math.max(1, prev - 1));
  };

  const runSystemOptimization = () => {
    playSound('click');
    setIsOptimizing(true);
    
    const messages = [
      "Kalu is scanning the national CBSE curriculum... 🔍",
      "Buddhu is sketching daily science analogies... 🎨",
      "Drafting specialized MCQ & Descriptive test banks... 📝",
      "Calibrating your initial learning state to absolute zero... 🚀",
      "Personalized Gurukul profile built successfully! ✨"
    ];

    messages.forEach((msg, idx) => {
      setTimeout(() => {
        setOptimizationMessage(msg);
        if (idx === messages.length - 1) {
          setTimeout(() => {
            const finalProgress: UserProgress = {
              completedChapters: [],
              quizScores: {},
              flashcardStatus: {},
              streak: 1,
              lastActiveDate: new Date().toDateString(),
              totalXP: 0, // start with 0 progress
              aiDoubtsAsked: 0,
              purchasedCourses: [],
              studentName: name.trim() || 'Curious Scholar',
              studentGrade: grade,
              studentSchool: school.trim() || 'Indian Public School',
              onboarded: true,
              mentorPreference: mentorPref
            };
            playSound('victory');
            onComplete(finalProgress);
          }, 1200);
        }
      }, idx * 1000);
    });
  };

  const containerBg = isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl';
  const cardBg = isDarkMode ? 'bg-zinc-900 border-zinc-850' : 'bg-zinc-50 border-zinc-200';
  const inputBg = isDarkMode ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-300 text-zinc-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-2xl rounded-3xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${containerBg}`}>
        
        {/* Animated Background Highlights */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

        <AnimatePresence mode="wait">
          {!isOptimizing ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="uppercase tracking-wider font-bold">New Scholar Onboarding</span>
                <span>Step {step} of 4</span>
              </div>

              {/* Step 1: Greeting & Meet Kalu & Buddhu */}
              {step === 1 && (
                <div className="space-y-6 text-center">
                  <div className="relative w-full max-w-md mx-auto aspect-[4/3] rounded-2xl overflow-hidden border border-zinc-800/80 bg-black flex items-center justify-center">
                    <img 
                      src={kaluAndBuddhuImg} 
                      alt="Kalu and Buddhu Mentors" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-3 text-center">
                      <span className="text-white text-xs font-bold font-mono tracking-widest bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/40">
                        MEET YOUR MENTORS
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center justify-center gap-2">
                      Welcome to Bharat AI! 🇮🇳
                    </h2>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-lg mx-auto">
                      Let's set up your personalized scientific study desk. You will be guided by <strong>Kalu</strong> (the speed-runner who loves cheeky tips) and <strong>Buddhu</strong> (the slow-learner who loves gorgeous real-life analogies).
                    </p>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-zinc-200 transition shadow-lg hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Let's Begin the Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Name & School details */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-white/5 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                      <User className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-extrabold">Who is entering the Gurukul?</h3>
                    <p className="text-xs text-zinc-500">Provide your basic credentials to design your personalized report card.</p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto pt-2">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Your Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priyanshu Sharma"
                        className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition ${inputBg}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Your School / Institution</label>
                      <input
                        type="text"
                        value={school}
                        onChange={(e) => setSchool(e.target.value)}
                        placeholder="e.g. Kendriya Vidyalaya, Sector 4"
                        className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition ${inputBg}`}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between max-w-md mx-auto pt-6">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold hover:text-white transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-zinc-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Class level & Favorite Subjects */}
              {step === 3 && (
                <div className="space-y-5">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-white/5 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                      <GraduationCap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-extrabold">Select Your Academic Grade</h3>
                    <p className="text-xs text-zinc-500">We optimize the difficulty level and syllabus questions accordingly.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 max-w-md mx-auto pt-2">
                    {['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'].map((g) => (
                      <button
                        key={g}
                        onClick={() => { playSound('click'); setGrade(g); }}
                        className={`p-3.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-2 cursor-pointer ${
                          grade === g 
                            ? 'bg-white text-black border-white' 
                            : isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-700'
                        }`}
                      >
                        <BookOpen className={`w-5 h-5 ${grade === g ? 'text-black' : 'text-zinc-500'}`} />
                        <span>{g}</span>
                      </button>
                    ))}
                  </div>

                  <div className="space-y-2 max-w-md mx-auto pt-4">
                    <span className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block text-center">Favorite Subject</span>
                    <div className="flex justify-center gap-2">
                      {['All', 'Physics', 'Chemistry', 'Biology'].map((sub) => (
                        <button
                          key={sub}
                          onClick={() => { playSound('click'); setSubjectInterest(sub); }}
                          className={`px-3.5 py-1.5 rounded-xl border text-[11px] font-bold transition cursor-pointer ${
                            subjectInterest === sub
                              ? 'bg-yellow-400 text-black border-yellow-400'
                              : isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between max-w-md mx-auto pt-6">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold hover:text-white transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-zinc-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <span>Next Step</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Mentor Strategy Preference */}
              {step === 4 && (
                <div className="space-y-5">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-white/5 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                      <Brain className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-extrabold font-sans">Choose Your Study Partner</h3>
                    <p className="text-xs text-zinc-500">How do you prefer to have concepts explained to you?</p>
                  </div>

                  <div className="space-y-3 max-w-md mx-auto pt-2">
                    {[
                      {
                        id: 'kalu',
                        name: 'Kalu Sir (The Clever Hack)',
                        desc: 'Focus on short-cuts, quick bullet notes, speed formulas, exam tricks, and challenging rapid quiz questions.',
                        badge: 'Clever Fast'
                      },
                      {
                        id: 'buddhu',
                        name: 'Buddhu Sir (The Analogy Maker)',
                        desc: 'Focus on detailed storytelling, gorgeous everyday analogies (cricket, tea, railways), step-by-step math breakdowns, and visual maps.',
                        badge: 'Storyteller'
                      },
                      {
                        id: 'both',
                        name: 'Collaborative Duo (Balanced Spark)',
                        desc: 'Perfect blend. Kalu & Buddhu debate and team up to explain doubts, keeping explanations dynamic and highly interactive!',
                        badge: 'Recommended'
                      }
                    ].map((pref) => (
                      <button
                        key={pref.id}
                        onClick={() => { playSound('click'); setMentorPref(pref.id as any); }}
                        className={`w-full text-left p-4 rounded-2xl border transition relative cursor-pointer flex flex-col gap-1.5 ${
                          mentorPref === pref.id
                            ? 'bg-yellow-400/10 border-yellow-400 text-white'
                            : isDarkMode ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className={`text-xs font-extrabold ${mentorPref === pref.id ? 'text-yellow-400' : 'text-white'}`}>
                            {pref.name}
                          </span>
                          <span className="text-[9px] uppercase tracking-wider font-bold bg-white/5 border border-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">
                            {pref.badge}
                          </span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-zinc-400">
                          {pref.desc}
                        </p>
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-between max-w-md mx-auto pt-6">
                    <button
                      onClick={handlePrevStep}
                      className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-xl text-xs font-bold hover:text-white transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={runSystemOptimization}
                      className="px-5 py-2.5 bg-emerald-500 text-black font-extrabold rounded-xl text-xs hover:bg-emerald-400 transition flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <span>Optimize Study Desk</span>
                      <Sparkles className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          ) : (
            <motion.div
              key="optimizing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
              
              <div className="space-y-2">
                <h3 className="text-lg font-black text-white">Configuring Your Bharat AI Desk...</h3>
                <p className="text-xs text-zinc-400 font-mono tracking-wider h-6 animate-pulse">
                  {optimizationMessage || "Aligning quantum modules..."}
                </p>
              </div>

              <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Kalu and Buddhu are crafting custom study folders. Since this is your first session, we are initializing all diagnostics to zero for accurate trend analysis.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
