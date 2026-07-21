import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Layers, 
  RotateCcw, 
  Brain, 
  HelpCircle,
  Sparkles,
  Check,
  Plus,
  Mic,
  Volume2,
  BookOpen,
  Info,
  Lightbulb,
  Workflow
} from 'lucide-react';
import { Chapter, Flashcard, UserProgress } from '../types';
import { playSound } from '../utils/audio';

interface FlashcardsViewProps {
  chapter: Chapter;
  progress: UserProgress;
  onBack?: () => void;
  onRateCard: (cardId: string, rating: 'easy' | 'medium' | 'hard') => void;
  onOpenAI: (mode: string, context: string, customPrompt?: string) => void;
  embedded?: boolean;
}

export default function FlashcardsView({ 
  chapter, 
  progress, 
  onBack, 
  onRateCard, 
  onOpenAI,
  embedded = false
}: FlashcardsViewProps) {
  // We'll treat our dynamic list of points as editable nodes of the mind map!
  const [nodes, setNodes] = useState<Flashcard[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Custom Node Addition State
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [isVoiceTypingFront, setIsVoiceTypingFront] = useState(false);
  const [isVoiceTypingBack, setIsVoiceTypingBack] = useState(false);

  // Audio readout state
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Initialize nodes from chapter flashcards
  useEffect(() => {
    if (chapter && chapter.flashcards) {
      setNodes(chapter.flashcards);
      if (chapter.flashcards.length > 0) {
        setSelectedNodeId(chapter.flashcards[0].id);
      }
    }
  }, [chapter]);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  // Helper to speech-synthesize the explanation text
  const speakConcept = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isSpeaking) {
        setIsSpeaking(false);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported on this device.");
    }
  };

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Voice Typing for new node creator
  const startVoiceTypingForNode = (target: 'front' | 'back') => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      if (target === 'front') {
        setIsVoiceTypingFront(true);
        setTimeout(() => {
          setNewFront("What is the main role of Mitochondria in eukaryotic cells?");
          setIsVoiceTypingFront(false);
        }, 2000);
      } else {
        setIsVoiceTypingBack(true);
        setTimeout(() => {
          setNewBack("It acts as the powerhouse of the cell, synthesizing ATP through standard cellular respiration.");
          setIsVoiceTypingBack(false);
        }, 2000);
      }
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN';

      rec.onstart = () => {
        if (target === 'front') setIsVoiceTypingFront(true);
        else setIsVoiceTypingBack(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        if (target === 'front') setNewFront(text);
        else setNewBack(text);
      };

      rec.onerror = () => {
        if (target === 'front') setIsVoiceTypingFront(false);
        else setIsVoiceTypingBack(false);
      };

      rec.onend = () => {
        if (target === 'front') setIsVoiceTypingFront(false);
        else setIsVoiceTypingBack(false);
      };

      rec.start();
    } catch (err) {
      setIsVoiceTypingFront(false);
      setIsVoiceTypingBack(false);
    }
  };

  // Add custom branch to the mind map
  const handleAddNode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    const newNode: Flashcard = {
      id: `custom-node-${Math.random()}`,
      front: newFront,
      back: newBack,
      category: chapter.subject || 'Syllabus Focus'
    };

    playSound('success');
    setNodes(prev => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
    setNewFront('');
    setNewBack('');
    setIsAddingNode(false);
  };

  // Retrieve rating for color-coding each concept branch
  const getNodeRating = (nodeId: string) => {
    return progress.flashcardStatus[nodeId] || 'unseen';
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'easy': return 'bg-emerald-500 border-emerald-400 text-emerald-950';
      case 'medium': return 'bg-amber-500 border-amber-400 text-amber-950';
      case 'hard': return 'bg-rose-500 border-rose-400 text-rose-950';
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-300';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 text-zinc-300 font-sans">
      
      {/* Mind Map Header */}
      <div className="flex items-center justify-between bg-zinc-950 p-4.5 rounded-2xl border border-zinc-900 shadow-xl">
        <div className="flex items-center gap-3">
          {!embedded && onBack && (
            <button
              onClick={() => {
                playSound('click');
                onBack();
              }}
              className="p-2.5 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-white rounded-xl cursor-pointer transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div className="text-left">
            <span className="text-[10px] uppercase tracking-widest font-black text-blue-400 flex items-center gap-1">
              <Workflow className="w-3 h-3 text-blue-400 animate-pulse" />
              Interactive Mind Map Hub
            </span>
            <h3 className="text-sm font-bold text-white line-clamp-1">{chapter.title}</h3>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('click');
            setIsAddingNode(true);
          }}
          className="px-3 py-1.5 bg-blue-900 hover:bg-blue-800 text-blue-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition border border-blue-800"
        >
          <Plus className="w-4 h-4" />
          <span>Add Concept Branch</span>
        </button>
      </div>

      {/* SVG Mind Map Canvas Row */}
      <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-5 shadow-2xl relative overflow-hidden min-h-[460px] flex flex-col justify-between">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-35" />
        
        {/* SVG connection lines overlay */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <svg className="w-full h-full min-h-[380px]">
            {/* Draw bezier connection curves from center (x: 50%, y: 50%) to nodes */}
            {nodes.map((node, idx) => {
              const total = nodes.length;
              const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
              const distance = 145; // radius distance
              
              // Define start and end coords relative to responsive parent
              const xStart = "50%";
              const yStart = "180";
              const isSelected = node.id === selectedNodeId;
              
              return (
                <g key={node.id}>
                  {/* Outer glowing path */}
                  <line
                    x1="50%"
                    y1={180}
                    x2={`calc(50% + ${distance * Math.cos(angle)}px)`}
                    y2={`calc(180px + ${distance * Math.sin(angle)}px)`}
                    className={`stroke-2 transition-all duration-300 ${
                      isSelected ? 'stroke-blue-500/80' : 'stroke-zinc-800/50'
                    }`}
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Nodes Wrapper */}
        <div className="relative z-10 w-full min-h-[340px] flex items-center justify-center">
          
          {/* CENTRAL NODE (Chapter Title Core) */}
          <div className="absolute top-[140px] left-[calc(50%-80px)] w-40 h-20 bg-gradient-to-br from-blue-900 via-indigo-950 to-zinc-950 border-2 border-blue-600 rounded-3xl flex flex-col items-center justify-center p-3 text-center shadow-2xl select-none z-20">
            <BookOpen className="w-4 h-4 text-blue-400 mb-1" />
            <span className="text-[9px] uppercase tracking-wider text-blue-400 font-mono font-bold">Chapter Core</span>
            <span className="text-[10px] font-black text-white line-clamp-1 leading-none">{chapter.title}</span>
          </div>

          {/* CONCEPT NODES RADIATING OUTWARD */}
          {nodes.map((node, idx) => {
            const total = nodes.length;
            const angle = (idx / total) * 2 * Math.PI - Math.PI / 2;
            const distance = 145; // radius
            const isSelected = node.id === selectedNodeId;
            const rating = getNodeRating(node.id);

            return (
              <motion.div
                key={node.id}
                onClick={() => {
                  playSound('click');
                  setSelectedNodeId(node.id);
                }}
                className={`absolute w-36 p-2 rounded-2xl border-2 cursor-pointer transition shadow-lg flex flex-col items-center justify-center text-center ${
                  isSelected 
                    ? 'border-blue-500 bg-zinc-900 text-white scale-110 z-10 shadow-blue-500/10' 
                    : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-700 hover:bg-zinc-900/60'
                }`}
                style={{
                  transform: `translate(${distance * Math.cos(angle)}px, ${distance * Math.sin(angle) + 40}px)`
                }}
                whileHover={{ scale: isSelected ? 1.1 : 1.05 }}
              >
                {/* Visual Status Indicator Dot */}
                <div className="flex items-center gap-1 mb-1">
                  <span className={`w-2 h-2 rounded-full ${
                    rating === 'easy' ? 'bg-emerald-500' :
                    rating === 'medium' ? 'bg-amber-500' :
                    rating === 'hard' ? 'bg-rose-500' : 'bg-zinc-600'
                  }`} />
                  <span className="text-[7px] uppercase font-bold tracking-wider font-mono text-zinc-500">Node {idx+1}</span>
                </div>
                
                <p className="text-[9px] font-bold leading-tight line-clamp-2">
                  {node.front}
                </p>
              </motion.div>
            );
          })}

        </div>

        {/* Quick hint bar */}
        <div className="text-center text-[10px] text-zinc-500 font-medium z-10 select-none border-t border-zinc-900/40 pt-2 flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Click on any node to expand, listen, rate memory confidence, or study with Bharat AI!</span>
        </div>
      </div>

      {/* SELECTED NODE EXPLORATION HUB PANEL */}
      <AnimatePresence mode="wait">
        {selectedNode && (
          <motion.div
            key={selectedNode.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-left space-y-4 shadow-2xl relative"
          >
            {/* Top Concept metadata */}
            <div className="flex justify-between items-start gap-4 border-b border-zinc-900 pb-3">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-black">Branch Concept Explored</span>
                <h4 className="text-base font-extrabold text-white leading-tight mt-0.5">{selectedNode.front}</h4>
              </div>

              {/* Text to speech and AI Help */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => speakConcept(selectedNode.back)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                    isSpeaking 
                      ? 'bg-blue-950 border-blue-800 text-blue-400 animate-pulse' 
                      : 'bg-zinc-900 hover:bg-zinc-850 border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                  title="Listen to this concept concept"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    onOpenAI('doubt', chapter.title, `Discuss this mind map point: "${selectedNode.front}". Explanation: "${selectedNode.back}". Explain clearly in easy scientific terms with examples.`);
                  }}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-850 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Brain className="w-3.5 h-3.5 text-blue-400" />
                  <span>Explain Node</span>
                </button>
              </div>
            </div>

            {/* Answer detail content */}
            <div className="space-y-2 bg-black/30 border border-zinc-900 p-4 rounded-2xl relative">
              <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-600 block">Scientific Definition & Insights</span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-sans">{selectedNode.back}</p>
            </div>

            {/* AI Memory Advice specifically on this mind map node */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1.5">
              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-white">
                  <span>⚡ Exam Speed-Hack</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  "Underline keywords here like '{selectedNode.front.toLowerCase().includes('lysosome') ? 'suicide enzymes' : 'ATP generation'}'. Don't write bulky textbooks, just list bullet equations!"
                </p>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-4 space-y-1">
                <div className="flex items-center gap-1 text-xs font-bold text-white">
                  <span>🎈 Conceptual Analogy</span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  "Think of this concept like a standard household battery storing chemical charge, or a vacuum cleaner cleaning up debris inside a bedroom! Super easy! 😇"
                </p>
              </div>
            </div>

            {/* Rate concept / Update status */}
            <div className="bg-zinc-900/25 border border-zinc-900 p-4.5 rounded-2xl space-y-3.5 text-center">
              <h5 className="text-[11px] uppercase tracking-wider font-extrabold text-zinc-400 font-mono">
                Update Brain Confidence Rating for this Node
              </h5>
              <div className="grid grid-cols-3 gap-2.5 max-w-md mx-auto">
                <button
                  onClick={() => {
                    playSound('click');
                    onRateCard(selectedNode.id, 'hard');
                  }}
                  className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                    getNodeRating(selectedNode.id) === 'hard'
                      ? 'bg-rose-950 border-rose-800 text-rose-400'
                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Hard (Struggling)
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    onRateCard(selectedNode.id, 'medium');
                  }}
                  className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                    getNodeRating(selectedNode.id) === 'medium'
                      ? 'bg-amber-950 border-amber-800 text-amber-400'
                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Medium (Getting it)
                </button>

                <button
                  onClick={() => {
                    playSound('click');
                    onRateCard(selectedNode.id, 'easy');
                  }}
                  className={`py-2 text-[11px] font-bold rounded-xl border transition cursor-pointer ${
                    getNodeRating(selectedNode.id) === 'easy'
                      ? 'bg-emerald-950 border-emerald-800 text-emerald-400'
                      : 'bg-zinc-950 hover:bg-zinc-900 border-zinc-900 text-zinc-400 hover:text-white'
                  }`}
                >
                  Easy (Mastered)
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* NODE CREATOR MODAL WINDOW */}
      {isAddingNode && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-zinc-950 border border-zinc-900 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl text-left"
          >
            <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
              <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono flex items-center gap-1.5">
                <Workflow className="w-4 h-4 text-blue-400" />
                Add Custom Mind Map Node
              </h4>
              <button
                onClick={() => setIsAddingNode(false)}
                className="text-xs text-zinc-500 hover:text-white transition"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleAddNode} className="space-y-4 text-xs">
              {/* Concept Question */}
              <div className="space-y-1.5 relative">
                <label className="text-zinc-500 uppercase font-mono tracking-wider text-[9px] block">Concept Title / Question</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. State Ohm's law."
                  value={newFront}
                  onChange={(e) => setNewFront(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-xl py-2 px-3.5 pr-10 text-white outline-none focus:border-zinc-700"
                />
                
                {/* Voice input for Concept Title */}
                <button
                  type="button"
                  onClick={() => startVoiceTypingForNode('front')}
                  className={`absolute right-2 bottom-1.5 p-1 rounded-lg ${
                    isVoiceTypingFront ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Concept Answer */}
              <div className="space-y-1.5 relative">
                <label className="text-zinc-500 uppercase font-mono tracking-wider text-[9px] block">Detailed Explanation</label>
                <textarea
                  required
                  rows={4}
                  placeholder="e.g. Current through a conductor is proportional to voltage..."
                  value={newBack}
                  onChange={(e) => setNewBack(e.target.value)}
                  className="w-full bg-black border border-zinc-900 rounded-xl p-3.5 pr-10 text-white outline-none focus:border-zinc-700 resize-none"
                />
                
                {/* Voice input for Explanation */}
                <button
                  type="button"
                  onClick={() => startVoiceTypingForNode('back')}
                  className={`absolute right-2 bottom-3.5 p-1 rounded-lg ${
                    isVoiceTypingBack ? 'text-red-500 animate-pulse' : 'text-zinc-500 hover:text-white'
                  }`}
                >
                  <Mic className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNode(false)}
                  className="flex-1 py-2.5 bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white rounded-xl font-bold cursor-pointer transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-white text-black hover:bg-zinc-200 rounded-xl font-extrabold cursor-pointer transition"
                >
                  Attach to Map
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
}
