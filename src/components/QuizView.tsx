import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  CheckCircle, 
  XCircle, 
  Award, 
  HelpCircle, 
  ArrowRight, 
  RotateCcw, 
  Brain, 
  Sparkles 
} from 'lucide-react';
import { Chapter, QuizQuestion } from '../types';
import ThreeDElement from './ThreeDElement';

interface QuizViewProps {
  chapter: Chapter;
  onBack: () => void;
  onCompleteQuiz: (score: number) => void;
  onOpenAI: (mode: string, context: string, customPrompt?: string) => void;
}

export default function QuizView({ chapter, onBack, onCompleteQuiz, onOpenAI }: QuizViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  const questions = chapter.quiz;
  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (idx: number) => {
    if (isAnswered) return;
    setSelectedIdx(idx);
    setIsAnswered(true);

    if (idx === currentQuestion.correctAnswerIndex) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(prev => prev + 1);
      setSelectedIdx(null);
      setIsAnswered(false);
    } else {
      setQuizFinished(true);
      const finalScorePct = Math.round((score / questions.length) * 100);
      onCompleteQuiz(finalScorePct);
    }
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setSelectedIdx(null);
    setIsAnswered(false);
    setScore(0);
    setQuizFinished(false);
  };

  const scorePct = Math.round((score / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 text-zinc-300 font-sans">
      {/* Quiz Header Navigation */}
      <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition border border-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Practice Assessment</span>
            <h3 className="text-sm font-bold text-white line-clamp-1">{chapter.title}</h3>
          </div>
        </div>

        {!quizFinished && (
          <div className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-400 font-mono">
            Q: <span className="text-white font-bold">{currentIdx + 1}</span> / {questions.length}
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!quizFinished ? (
          <motion.div
            key={currentIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            {/* Visual indicator bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-900">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>

            {/* Question */}
            <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
              <div className="space-y-3 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-white bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-800">
                    <HelpCircle className="w-3.5 h-3.5" /> Core Assessment Query
                  </span>
                  {currentQuestion.examReference && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-lg">
                      🏆 {currentQuestion.examReference}
                    </span>
                  )}
                  {currentQuestion.weightage && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold text-cyan-400 bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 rounded-lg">
                      {currentQuestion.weightage}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Dynamic educational cutout image block */}
              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 hidden sm:flex items-center justify-center bg-zinc-900/30 rounded-2xl border border-zinc-900 p-1 self-center">
                <ThreeDElement 
                  type={
                    chapter.title.toLowerCase().includes('physics') || currentQuestion.question.toLowerCase().includes('physics') || currentQuestion.question.toLowerCase().includes('velocity') || currentQuestion.question.toLowerCase().includes('speed') || currentQuestion.question.toLowerCase().includes('car') || currentQuestion.question.toLowerCase().includes('motion') || currentQuestion.question.toLowerCase().includes('motorcycle')
                      ? (currentQuestion.question.toLowerCase().includes('motorcycle') || currentQuestion.question.toLowerCase().includes('bike') ? 'motorcycle' : 'car')
                      : (chapter.title.toLowerCase().includes('biology') || chapter.title.toLowerCase().includes('botany') || chapter.title.toLowerCase().includes('tree') || currentQuestion.question.toLowerCase().includes('cell') || currentQuestion.question.toLowerCase().includes('plant') || currentQuestion.question.toLowerCase().includes('leaf')
                          ? 'tree' 
                          : 'questionMark')
                  }
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Answer Options */}
            <div className="grid grid-cols-1 gap-3 pt-2">
              {currentQuestion.options.map((option, idx) => {
                let optionStyle = 'bg-zinc-900/40 hover:bg-zinc-900 border-zinc-850 text-zinc-300';
                let icon = null;

                if (isAnswered) {
                  if (idx === currentQuestion.correctAnswerIndex) {
                    optionStyle = 'bg-zinc-900 border-zinc-700 text-white font-bold';
                    icon = <CheckCircle className="w-5 h-5 text-white shrink-0" />;
                  } else if (idx === selectedIdx) {
                    optionStyle = 'bg-zinc-950 border-zinc-850 text-zinc-600';
                    icon = <XCircle className="w-5 h-5 text-zinc-500 shrink-0" />;
                  } else {
                    optionStyle = 'bg-zinc-950/20 border-zinc-900 text-zinc-600 opacity-40';
                  }
                }

                return (
                  <button
                    key={idx}
                    disabled={isAnswered}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left px-5 py-4 border rounded-xl transition flex items-center justify-between text-xs leading-relaxed ${optionStyle} ${!isAnswered ? 'cursor-pointer' : ''}`}
                    id={`quiz-option-${idx}`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Logical Explanation */}
            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-zinc-900 border border-zinc-850 rounded-2xl p-4 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between text-white font-bold uppercase tracking-wider">
                    <span>💡 Rational Analysis</span>
                    <button
                      onClick={() => onOpenAI('doubt', chapter.title, `Discuss this concept: Question: "${currentQuestion.question}". Correct Option: "${currentQuestion.options[currentQuestion.correctAnswerIndex]}". Explanation: "${currentQuestion.explanation}"`)}
                      className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
                    >
                      <Brain className="w-3 h-3" /> Discuss with AI
                    </button>
                  </div>
                  <p className="text-zinc-400 leading-relaxed font-sans">
                    {currentQuestion.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Next buttons */}
            {isAnswered && (
              <div className="flex justify-end pt-2 border-t border-zinc-900">
                <button
                  onClick={handleNext}
                  className="px-6 py-3 bg-white text-black hover:bg-zinc-200 transition font-bold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow"
                >
                  {currentIdx + 1 === questions.length ? 'Complete Assessment' : 'Next Question'}{' '}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        ) : (
          /* Finished Screen */
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-8 text-center space-y-6 shadow-2xl relative"
          >
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="p-4 rounded-full bg-zinc-900 text-white border border-zinc-800 shadow">
                <Award className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-sans font-extrabold text-white">Evaluation Complete!</h2>
              <p className="text-zinc-500 text-xs max-w-sm">
                Focus leads to mastery. Retaining structural scientific definitions requires precision. Check your final score below:
              </p>
            </div>

            {/* Circular score display */}
            <div className="py-6 flex flex-col items-center justify-center">
              <div className="relative w-32 h-32 rounded-full border-4 border-zinc-900 flex flex-col items-center justify-center shadow-inner">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="60"
                    fill="transparent"
                    stroke="#ffffff"
                    strokeWidth="4"
                    strokeDasharray={2 * Math.PI * 60}
                    strokeDashoffset={2 * Math.PI * 60 * (1 - scorePct / 100)}
                    className="transition-all duration-1000"
                  />
                </svg>

                <span className="text-2xl font-bold font-mono text-white">{scorePct}%</span>
                <span className="text-[9px] text-zinc-500 font-semibold uppercase tracking-wider mt-1">
                  {score} / {questions.length} Correct
                </span>
              </div>
            </div>

            {/* Performance */}
            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-2xl max-w-md mx-auto space-y-1 text-xs text-zinc-400">
              {scorePct >= 80 ? (
                <div className="text-white font-extrabold text-xs flex items-center justify-center gap-1">
                  <Sparkles className="w-4 h-4 text-white" /> Complete Subject Mastery!
                </div>
              ) : (
                <div className="text-white font-bold text-xs">Keep learning. Attempt this evaluation again to score 100%!</div>
              )}
              <div>Awarded <strong className="text-white">+{scorePct} XP</strong> score points.</div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto pt-4">
              <button
                onClick={handleRestart}
                className="flex-1 py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                id="btn-restart-quiz"
              >
                <RotateCcw className="w-4 h-4" /> Try Again
              </button>
              <button
                onClick={() => onOpenAI('doubt', chapter.title, `I scored ${scorePct}% on the practice test of "${chapter.title}". Let's discuss my wrong answers, review concepts I found difficult, and give me a custom remedial question.`)}
                className="flex-1 py-3 bg-white text-black hover:bg-zinc-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow cursor-pointer transition-colors"
                id="btn-quiz-remedy-ai"
              >
                <Brain className="w-4 h-4 text-black" /> Get AI Remedial doubts Help
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
