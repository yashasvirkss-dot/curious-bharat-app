import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Layers, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Brain, 
  HelpCircle,
  Sparkles,
  Check
} from 'lucide-react';
import { Chapter, Flashcard, UserProgress } from '../types';

interface FlashcardsViewProps {
  chapter: Chapter;
  progress: UserProgress;
  onBack: () => void;
  onRateCard: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  onOpenAI: (mode: string, context: string, customPrompt?: string) => void;
}

export default function FlashcardsView({ 
  chapter, 
  progress, 
  onBack, 
  onRateCard, 
  onOpenAI 
}: FlashcardsViewProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionRatings, setSessionRatings] = useState<Record<string, 'easy' | 'medium' | 'hard'>>({});
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const cards = chapter.flashcards;
  const currentCard = cards[currentIdx];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating: 'easy' | 'medium' | 'hard') => {
    onRateCard(currentCard.id, rating);
    setSessionRatings(prev => ({ ...prev, [currentCard.id]: rating }));

    setIsFlipped(false);
    setTimeout(() => {
      if (currentIdx + 1 < cards.length) {
        setCurrentIdx(prev => prev + 1);
      } else {
        setSessionCompleted(true);
      }
    }, 200);
  };

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev + 1) % cards.length);
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIdx(prev => (prev - 1 + cards.length) % cards.length);
    }, 150);
  };

  const handleRestart = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setSessionRatings({});
    setSessionCompleted(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-20 text-zinc-300 font-sans">
      {/* Navigation Header */}
      <div className="flex items-center justify-between bg-zinc-950 p-4 rounded-2xl border border-zinc-850">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition border border-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-[10px] uppercase tracking-wider font-extrabold text-zinc-500">Active Recall Deck</span>
            <h3 className="text-sm font-bold text-white line-clamp-1">{chapter.title}</h3>
          </div>
        </div>

        {!sessionCompleted && (
          <div className="text-xs bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl text-zinc-400 font-mono">
            Card: <span className="text-white font-bold">{currentIdx + 1}</span> / {cards.length}
          </div>
        )}
      </div>

      <p className="text-center text-xs text-zinc-500">
        Click on the card face to flip it. Rate your memory confidence below to save your study progression.
      </p>

      {/* 3D Flippable Flashcard Board */}
      <div className="flex flex-col items-center justify-center space-y-6 py-4">
        {!sessionCompleted ? (
          <>
            <div 
              onClick={handleFlip}
              className="w-full h-80 relative cursor-pointer"
              style={{ perspective: '1000px' }}
            >
              <div 
                className="w-full h-full duration-500 ease-in-out relative transform-gpu"
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* FRONT SIDE (Question) */}
                <div 
                  className="absolute inset-0 bg-zinc-950 border border-zinc-900 rounded-3xl p-8 flex flex-col justify-between shadow-2xl"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">Conceptual Question</span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-850 text-[10px]">{currentCard.category}</span>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center space-y-3 py-4">
                    <HelpCircle className="w-10 h-10 text-zinc-600 opacity-60" />
                    <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed tracking-tight select-none">
                      {currentCard.front}
                    </h2>
                  </div>

                  <div className="text-center text-[10px] text-zinc-500 font-medium">
                    Click Card Face to Reveal Answer ⟲
                  </div>
                </div>

                {/* BACK SIDE (Answer) */}
                <div 
                  className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-wider text-white font-mono">Logical Explanation</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAI('doubt', chapter.title, `Discuss this scientific flashcard concept: Question: "${currentCard.front}". Explanation: "${currentCard.back}". Please explain this with everyday real-world examples.`);
                      }}
                      className="px-2.5 py-1 bg-black hover:bg-zinc-950 text-[10px] text-white font-bold rounded border border-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Brain className="w-3.5 h-3.5" /> Explain with AI
                    </button>
                  </div>

                  <div className="flex flex-col items-center justify-center text-center space-y-2 py-4">
                    <Sparkles className="w-10 h-10 text-zinc-400 opacity-60 animate-pulse" />
                    <p className="text-xs sm:text-sm text-zinc-350 leading-relaxed font-sans max-w-md select-none">
                      {currentCard.back}
                    </p>
                  </div>

                  <div className="text-center text-[10px] text-zinc-500 font-medium">
                    Click Card Face to Flip Back ⟲
                  </div>
                </div>
              </div>
            </div>

            {/* Carousel Navigation */}
            <div className="flex items-center gap-4">
              <button 
                onClick={handlePrev}
                className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-xl text-zinc-400 cursor-pointer transition"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <span className="text-xs text-zinc-400 font-mono font-medium">
                Card {currentIdx + 1} of {cards.length}
              </span>

              <button 
                onClick={handleNext}
                className="p-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 hover:text-white rounded-xl text-zinc-400 cursor-pointer transition"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Confidence controls */}
            <div className="w-full bg-zinc-950/60 border border-zinc-900 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest text-center">
                Rate Your Memory Recall Accuracy
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRate('hard')}
                  className="py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 text-xs font-semibold rounded-xl cursor-pointer transition"
                >
                  Hard (Needs Study)
                </button>
                <button
                  onClick={() => handleRate('medium')}
                  className="py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-350 text-xs font-semibold rounded-xl cursor-pointer transition"
                >
                  Medium (Getting there)
                </button>
                <button
                  onClick={() => handleRate('easy')}
                  className="py-2 bg-white hover:bg-zinc-200 text-black text-xs font-bold rounded-xl cursor-pointer transition"
                >
                  Easy (Mastered)
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Finished Screen */
          <div className="w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-8 text-center space-y-5">
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="p-3 bg-zinc-900 text-white rounded-full border border-zinc-800">
                <Layers className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">All Flashcards Complete!</h3>
              <p className="text-zinc-500 text-xs max-w-sm">
                Excellent active recall session. Revisiting physical formulas and biological structures boosts long-term brain storage.
              </p>
            </div>

            <button
              onClick={handleRestart}
              className="px-6 py-2.5 bg-white text-black hover:bg-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 mx-auto"
            >
              <RotateCcw className="w-4 h-4" /> Restart Deck session
            </button>
          </div>
        )}

        <div className="flex justify-center pt-2">
          <button
            onClick={handleRestart}
            className="px-4 py-2 bg-zinc-950 hover:bg-zinc-900 text-zinc-500 hover:text-white border border-zinc-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restart Deck
          </button>
        </div>
      </div>
    </div>
  );
}
