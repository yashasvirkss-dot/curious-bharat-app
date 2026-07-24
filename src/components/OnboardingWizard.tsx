import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, User, Phone, BookOpen, GraduationCap } from 'lucide-react';
import { UserProgress } from '../types';
import { playSound } from '../utils/audio';

interface OnboardingWizardProps {
  onComplete: (newProgress: UserProgress) => void;
  isDarkMode?: boolean;
}

export default function OnboardingWizard({ onComplete, isDarkMode = true }: OnboardingWizardProps) {
  const [name, setName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [grade, setGrade] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationMessage, setOptimizationMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name to proceed!");
      return;
    }
    if (!contactNumber.trim()) {
      alert("Please enter your contact number!");
      return;
    }
    if (!grade.trim()) {
      alert("Please enter your class / grade!");
      return;
    }
    runSystemOptimization();
  };

  const runSystemOptimization = () => {
    playSound('click');
    setIsOptimizing(true);
    
    const messages = [
      "AI is scanning the national CBSE curriculum... 🔍",
      "Drafting daily science analogies tailored for your grade... 🎨",
      "Assembling practice test MCQs and customized study sheets... 📝",
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
              studentName: name.trim(),
              studentGrade: grade.trim(),
              contactNumber: contactNumber.trim(),
              profilePic: "bg-indigo-600|🎓", // default avatar styling
              onboarded: true,
              mentorPreference: 'both'
            };
            playSound('victory');
            onComplete(finalProgress);
          }, 1000);
        }
      }, idx * 850);
    });
  };

  const containerBg = isDarkMode ? 'bg-zinc-950 border-zinc-900 text-white' : 'bg-white border-zinc-200 text-zinc-900 shadow-xl';
  const inputBg = isDarkMode ? 'bg-black border-zinc-850 text-white placeholder-zinc-600' : 'bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className={`w-full max-w-md rounded-3xl border p-6 sm:p-8 relative overflow-hidden transition-all duration-300 ${containerBg}`}>
        
        {/* Animated Background Highlights */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

        <AnimatePresence mode="wait">
          {!isOptimizing ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Header */}
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto">
                  <GraduationCap className="w-6 h-6 text-yellow-400 animate-bounce" />
                </div>
                <h3 className="text-xl font-black">Welcome to Curious Bharat! 🇮🇳</h3>
                <p className="text-xs text-zinc-400">Please provide your details to configure your personalized study portal.</p>
              </div>

              {/* Typeable Format Form */}
              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-yellow-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priyanshu Sharma"
                    className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition ${inputBg}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-yellow-400" /> Contact Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition ${inputBg}`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-yellow-400" /> Class / Grade
                  </label>
                  <input
                    type="text"
                    required
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    placeholder="e.g. Class 10th (Sankalp Batch)"
                    className={`w-full p-3 text-xs rounded-xl border focus:outline-none focus:ring-1 focus:ring-yellow-500 transition ${inputBg}`}
                  />
                </div>

                <div className="pt-4 flex justify-center">
                  <button
                    type="submit"
                    className="w-full py-3 bg-yellow-400 text-black font-extrabold rounded-xl text-xs hover:bg-yellow-300 transition shadow-lg hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Configure Study Desk</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>
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
                  {optimizationMessage || "Aligning academic metrics..."}
                </p>
              </div>

              <p className="text-[10px] text-zinc-500 max-w-sm mx-auto leading-relaxed">
                Assembling curriculum guidelines, interactive mind maps, and doubt solving AI modules.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
