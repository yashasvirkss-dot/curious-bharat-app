import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, User, BookOpen, GraduationCap, Check } from 'lucide-react';
import { UserProgress } from '../types';
import { playSound } from '../utils/audio';

interface OnboardingWizardProps {
  onComplete: (newProgress: UserProgress) => void;
  isDarkMode?: boolean;
}

const AVATAR_OPTIONS = [
  { id: 'physics', emoji: '⚛️', name: 'Physics Wiz', color: 'bg-indigo-600' },
  { id: 'biology', emoji: '🧬', name: 'Bio Scholar', color: 'bg-teal-600' },
  { id: 'chemistry', emoji: '🧪', name: 'Chem Expert', color: 'bg-emerald-600' },
  { id: 'ai', emoji: '🧠', name: 'AI Explorer', color: 'bg-amber-600' },
  { id: 'space', emoji: '🚀', name: 'Space Ranger', color: 'bg-rose-600' },
  { id: 'math', emoji: '📐', name: 'Math Master', color: 'bg-violet-600' },
];

export default function OnboardingWizard({ onComplete, isDarkMode = true }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('Class 10th');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationMessage, setOptimizationMessage] = useState('');

  const handleNextStep = () => {
    playSound('click');
    if (step === 1) {
      if (!name.trim()) {
        alert("Please enter your name to proceed, Curious Scholar!");
        return;
      }
      setStep(2);
    }
  };

  const handlePrevStep = () => {
    playSound('click');
    setStep(1);
  };

  const runSystemOptimization = () => {
    playSound('click');
    setIsOptimizing(true);
    
    const messages = [
      "AI is scanning the national CBSE curriculum... 🔍",
      "Drafting daily intuitive science analogies... 🎨",
      "Drafting specialized MCQ & Mindmap test banks... 📝",
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
              totalXP: 0,
              aiDoubtsAsked: 0,
              purchasedCourses: [],
              studentName: name.trim() || 'Curious Scholar',
              studentGrade: grade,
              profilePic: `${selectedAvatar.color}|${selectedAvatar.emoji}`,
              onboarded: true,
              mentorPreference: 'both'
            };
            playSound('victory');
            onComplete(finalProgress);
          }, 1000);
        }
      }, idx * 800);
    });
  };

  const containerBg = isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl';
  const inputBg = isDarkMode ? 'bg-black border-zinc-800 text-white' : 'bg-white border-zinc-300 text-zinc-900';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-xl rounded-3xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${containerBg}`}>
        
        {/* Animated Background Highlights */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

        <AnimatePresence mode="wait">
          {!isOptimizing ? (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs font-mono text-zinc-500">
                <span className="uppercase tracking-wider font-bold">New Scholar Onboarding</span>
                <span>Step {step} of 2</span>
              </div>

              {/* Step 1: Personal Details */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-white/5 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                      <User className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-extrabold">Welcome to Curious Bharat! 🇮🇳</h3>
                    <p className="text-xs text-zinc-500">Let's create your scholar desk in just two simple clicks.</p>
                  </div>

                  <div className="space-y-4 max-w-md mx-auto">
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Your Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Priyanshu Sharma"
                        className={`w-full p-3.5 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition ${inputBg}`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-mono font-bold text-zinc-400 uppercase tracking-wider block">Select Your Academic Grade</label>
                      <div className="grid grid-cols-2 gap-2.5">
                        {['Class 9th', 'Class 10th', 'Class 11th', 'Class 12th'].map((g) => (
                          <button
                            key={g}
                            type="button"
                            onClick={() => { playSound('click'); setGrade(g); }}
                            className={`p-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                              grade === g 
                                ? 'bg-white text-black border-white' 
                                : isDarkMode ? 'bg-zinc-900 border-zinc-850 hover:border-zinc-800 text-zinc-400' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-350 text-zinc-700'
                            }`}
                          >
                            <BookOpen className="w-4 h-4 shrink-0" />
                            <span>{g}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleNextStep}
                      className="px-6 py-3 bg-white text-black font-extrabold rounded-xl text-xs hover:bg-zinc-200 transition shadow-lg hover:scale-[1.02] flex items-center gap-2 cursor-pointer"
                    >
                      <span>Choose Avatar Profile</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Profile Picture Selection */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2 text-center">
                    <div className="w-12 h-12 bg-white/5 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto">
                      <GraduationCap className="w-6 h-6 text-yellow-400" />
                    </div>
                    <h3 className="text-xl font-extrabold">Select Your Scholar Avatar</h3>
                    <p className="text-xs text-zinc-500">Pick a profile theme to display on your dashboard badges and progress lists.</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 max-w-md mx-auto pt-2">
                    {AVATAR_OPTIONS.map((av) => {
                      const isSelected = selectedAvatar.id === av.id;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => { playSound('click'); setSelectedAvatar(av); }}
                          className={`p-4 rounded-2xl border transition flex flex-col items-center gap-2 cursor-pointer relative ${
                            isSelected 
                              ? 'border-yellow-400 ring-1 ring-yellow-400 bg-zinc-900' 
                              : isDarkMode ? 'bg-zinc-900 border-zinc-850 hover:border-zinc-800' : 'bg-zinc-50 border-zinc-200 hover:border-zinc-350'
                          }`}
                        >
                          <div className={`w-12 h-12 rounded-full ${av.color} flex items-center justify-center text-2xl shadow-md`}>
                            {av.emoji}
                          </div>
                          <span className={`text-[10px] font-bold ${isSelected ? 'text-yellow-400 font-extrabold' : 'text-zinc-500'}`}>
                            {av.name}
                          </span>
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-yellow-400 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-black stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
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
                      <Sparkles className="w-4 h-4 animate-pulse" />
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
                <h3 className="text-lg font-black text-white">Configuring Your Curious Bharat Desk...</h3>
                <p className="text-xs text-zinc-400 font-mono tracking-wider h-6 animate-pulse">
                  {optimizationMessage || "Aligning quantum modules..."}
                </p>
              </div>

              <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                We are custom assembling your science syllabus under owner-verified diagnostic parameters.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
