import React, { useState, useEffect, useRef } from 'react';
import { 
  Dribbble, 
  Flame, 
  Sparkles, 
  Award, 
  RotateCcw, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle, 
  XCircle, 
  Dna, 
  Atom, 
  Lightbulb, 
  Zap, 
  TrendingUp,
  Skull
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { UserProgress } from '../types';

interface ScienceGamesProps {
  progress: UserProgress;
  onUpdateProgress: (newProgress: UserProgress) => void;
  key?: string;
}

// 1. Newton's Gravity Dash Types
interface PhysicsQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  concept: string;
}

const GRAVITY_DASH_QUESTIONS: PhysicsQuestion[] = [
  {
    id: 'gd1',
    question: "What is Newton's First Law of Motion also known as?",
    options: ["Law of Inertia", "Law of Acceleration", "Law of Action-Reaction"],
    correctIndex: 0,
    concept: "Inertia prevents sudden change of state!"
  },
  {
    id: 'gd2',
    question: "Which of the following is the constant acceleration due to gravity on Earth?",
    options: ["8.9 m/s²", "9.8 m/s²", "10.5 m/s²"],
    correctIndex: 1,
    concept: "Constant free-fall acceleration under gravity."
  },
  {
    id: 'gd3',
    question: "If mass increases, what happens to inertia?",
    options: ["Decreases", "Remains Constant", "Increases"],
    correctIndex: 2,
    concept: "Inertia is directly proportional to mass."
  },
  {
    id: 'gd4',
    question: "What unit measures electrical resistance in Ohm's Law?",
    options: ["Volt (V)", "Ampere (A)", "Ohm (Ω)"],
    correctIndex: 2,
    concept: "Resistance limits current flow: R = V/I."
  },
  {
    id: 'gd5',
    question: "Which type of friction is the smallest?",
    options: ["Rolling friction", "Static friction", "Sliding friction"],
    correctIndex: 0,
    concept: "Rolling contact minimizes surface interlocking."
  },
  {
    id: 'gd6',
    question: "What does the slope of a distance-time graph represent?",
    options: ["Speed / Velocity", "Acceleration", "Displacement"],
    correctIndex: 0,
    concept: "Slope = Δy / Δx = distance / time = speed."
  },
  {
    id: 'gd7',
    question: "At what angle of projection is horizontal range of a Class 11 projectile maximum?",
    options: ["30°", "45°", "60°"],
    correctIndex: 1,
    concept: "Range = u²sin(2θ)/g is maximum at θ = 45°."
  },
  {
    id: 'gd8',
    question: "According to Class 12 Coulomb's Law, what happens to force when distance is halved?",
    options: ["Halved", "Doubled", "Quadrupled"],
    correctIndex: 2,
    concept: "Force is inversely proportional to r²; halving r quadruples force."
  }
];

// 2. Chemical Bubble Shooter Types
interface ChemicalIon {
  id: string;
  formula: string;
  charge: number; // e.g. +1, -1, -2, +2, +3, -3
  color: string;
  name: string;
}

const IONS_DATABASE: ChemicalIon[] = [
  { id: 'i1', formula: 'H⁺', charge: 1, color: 'bg-rose-500 border-rose-400', name: 'Hydrogen Ion' },
  { id: 'i2', formula: 'Na⁺', charge: 1, color: 'bg-emerald-500 border-emerald-400', name: 'Sodium Ion' },
  { id: 'i3', formula: 'Cl⁻', charge: -1, color: 'bg-yellow-500 border-yellow-400', name: 'Chloride Ion' },
  { id: 'i4', formula: 'O²⁻', charge: -2, color: 'bg-blue-500 border-blue-400', name: 'Oxide Ion' },
  { id: 'i5', formula: 'Mg²⁺', charge: 2, color: 'bg-purple-500 border-purple-400', name: 'Magnesium Ion' },
  { id: 'i6', formula: 'OH⁻', charge: -1, color: 'bg-sky-500 border-sky-400', name: 'Hydroxide Ion' },
  { id: 'i7', formula: 'Al³⁺', charge: 3, color: 'bg-indigo-500 border-indigo-400', name: 'Aluminium Ion (Class 11/12)' },
  { id: 'i8', formula: 'PO₄³⁻', charge: -3, color: 'bg-orange-500 border-orange-400', name: 'Phosphate Ion (Class 11/12)' }
];

export default function ScienceGames({ progress, onUpdateProgress }: ScienceGamesProps) {
  const [activeGame, setActiveGame] = useState<'none' | 'gravity-dash' | 'bubble-shooter'>('none');

  // ==========================================
  // GAME A: NEWTON'S GRAVITY RUN (STATE)
  // ==========================================
  const [gdScore, setGdScore] = useState<number>(0);
  const [gdHighScore, setGdHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('gd_highscore') || '0');
  });
  const [gdStatus, setGdStatus] = useState<'idle' | 'playing' | 'question' | 'crashed'>('idle');
  const [currentGDQuestion, setCurrentGDQuestion] = useState<PhysicsQuestion | null>(null);
  const [gdFeedback, setGdFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [runnerLane, setRunnerLane] = useState<number>(1); // 0, 1, 2
  const [gdSpeed, setGdSpeed] = useState<number>(1);
  const [gdAlertMsg, setGdAlertMsg] = useState<string>('');

  // Runner distance increment tick
  useEffect(() => {
    if (gdStatus !== 'playing') return;

    const interval = setInterval(() => {
      setGdScore(prev => {
        const next = prev + gdSpeed;
        // Trigger question every 100 points
        if (next > 0 && next % 80 === 0) {
          triggerGDQuestion();
        }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, [gdStatus, gdSpeed]);

  const triggerGDQuestion = () => {
    setGdStatus('question');
    const randomQ = GRAVITY_DASH_QUESTIONS[Math.floor(Math.random() * GRAVITY_DASH_QUESTIONS.length)];
    setCurrentGDQuestion(randomQ);
    setGdFeedback(null);
  };

  const handleGDAnswer = (answerIndex: number) => {
    if (!currentGDQuestion) return;

    const correct = answerIndex === currentGDQuestion.correctIndex;
    if (correct) {
      setGdFeedback({
        isCorrect: true,
        text: `CORRECT! Boost applied: ${currentGDQuestion.concept}`
      });
      // Award XP
      onUpdateProgress({
        ...progress,
        totalXP: progress.totalXP + 25
      });
      setGdSpeed(prev => Math.min(prev + 1, 5));
      setTimeout(() => {
        setGdStatus('playing');
        setCurrentGDQuestion(null);
        setGdFeedback(null);
      }, 2000);
    } else {
      setGdFeedback({
        isCorrect: false,
        text: `CRASH! Wrong Force Field: ${currentGDQuestion.concept}`
      });
      setTimeout(() => {
        setGdStatus('crashed');
        if (gdScore > gdHighScore) {
          setGdHighScore(gdScore);
          localStorage.setItem('gd_highscore', gdScore.toString());
        }
      }, 2000);
    }
  };

  const restartGDGame = () => {
    setGdScore(0);
    setGdSpeed(1);
    setGdStatus('playing');
    setCurrentGDQuestion(null);
    setGdFeedback(null);
  };

  // ==========================================
  // GAME B: ATOMIC BUBBLE SHOOTER (STATE)
  // ==========================================
  // Grid of bubbles hanging at the top (6 columns x 3 rows)
  const [bubbleGrid, setBubbleGrid] = useState<(ChemicalIon | null)[][]>([
    [IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[5], IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[2]], // Cl, O, Mg, Cl, O, Cl
    [IONS_DATABASE[0], IONS_DATABASE[5], IONS_DATABASE[3], IONS_DATABASE[0], IONS_DATABASE[5], IONS_DATABASE[0]], // H, Mg, O, H, Mg, H
    [IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[2], IONS_DATABASE[3]]
  ]);
  const [currentLauncherIon, setCurrentLauncherIon] = useState<ChemicalIon>(IONS_DATABASE[1]); // e.g. Na+
  const [aimColumn, setAimColumn] = useState<number>(2); // 0 to 5
  const [shooterScore, setShooterScore] = useState<number>(0);
  const [bsHighScore, setBsHighScore] = useState<number>(() => {
    return Number(localStorage.getItem('bs_highscore') || '0');
  });
  const [shooterAlert, setShooterAlert] = useState<string>('');

  const cycleLauncherIon = () => {
    // Generate only positive charges for launcher to combine with negative grid ions, or vice versa
    const launcherPool = IONS_DATABASE.filter(ion => ion.charge > 0);
    const randomIon = launcherPool[Math.floor(Math.random() * launcherPool.length)];
    setCurrentLauncherIon(randomIon);
  };

  const handleShoot = () => {
    setShooterAlert('');
    // Travel up the aim column to find first empty space starting from bottom (row 2 down to 0)
    let targetRow = -1;
    for (let r = bubbleGrid.length - 1; r >= 0; r--) {
      if (bubbleGrid[r][aimColumn] === null) {
        targetRow = r;
        break;
      }
    }

    // If targetRow is -1, it means the column is completely filled, search if we need to expand or if collision happens
    // Find neighbors at targetRow if valid
    const gridCellToHitRow = targetRow === -1 ? 0 : targetRow;
    const existingIon = bubbleGrid[gridCellToHitRow][aimColumn];

    if (existingIon) {
      // Check if they neutralize charge!
      // e.g. Launcher Na+ (charge +1) and existing Cl- (charge -1). Total = 0! Neutral salt formed!
      const totalCharge = currentLauncherIon.charge + existingIon.charge;
      if (totalCharge === 0) {
        // Pop! Remove both ions and award score
        const newGrid = bubbleGrid.map((row, rIdx) => 
          row.map((col, cIdx) => {
            if (rIdx === gridCellToHitRow && cIdx === aimColumn) {
              return null; // pop
            }
            return col;
          })
        );
        setBubbleGrid(newGrid);
        setShooterScore(prev => prev + 150);
        setShooterAlert(`🧪 Balanced Compound Formed! (${currentLauncherIon.formula} + ${existingIon.formula} neutralizes charge)`);
        
        // Update total XP
        onUpdateProgress({
          ...progress,
          totalXP: progress.totalXP + 30
        });

        if (shooterScore + 150 > bsHighScore) {
          setBsHighScore(shooterScore + 150);
          localStorage.setItem('bs_highscore', (shooterScore + 150).toString());
        }
      } else {
        // Did not neutralize. They attach! Place the shot ion in the cell right below if possible
        if (gridCellToHitRow < bubbleGrid.length - 1) {
          const newGrid = [...bubbleGrid];
          newGrid[gridCellToHitRow + 1][aimColumn] = currentLauncherIon;
          setBubbleGrid(newGrid);
          setShooterAlert(`❌ Ions Repelled! Charges (${currentLauncherIon.charge} & ${existingIon.charge}) do not equal 0!`);
        } else {
          setShooterAlert(`⚠️ Lane full! Try shooting another column.`);
        }
      }
    } else {
      // Landed in empty space. Attach to top row if empty
      const newGrid = [...bubbleGrid];
      newGrid[gridCellToHitRow][aimColumn] = currentLauncherIon;
      setBubbleGrid(newGrid);
      setShooterAlert(`Attached ${currentLauncherIon.formula} to column ${aimColumn + 1}`);
    }

    // Load next ion
    cycleLauncherIon();
  };

  const resetShooterGrid = () => {
    setBubbleGrid([
      [IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[5], IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[2]],
      [IONS_DATABASE[0], IONS_DATABASE[5], IONS_DATABASE[3], IONS_DATABASE[0], IONS_DATABASE[5], IONS_DATABASE[0]],
      [IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[2], IONS_DATABASE[3], IONS_DATABASE[2], IONS_DATABASE[3]]
    ]);
    setShooterScore(0);
    setShooterAlert('Arcade Grid Refreshed! Aim at Negative Ions (Chloride Cl⁻, Oxide O²⁻) with positive elements.');
    cycleLauncherIon();
  };

  return (
    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden" id="science-games-container">
      
      {/* Dynamic Background Grid Decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#09090b_1px,transparent_1px),linear-gradient(to_bottom,#09090b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

      <AnimatePresence mode="wait">
        
        {/* GAME MENU SCREEN */}
        {activeGame === 'none' && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6 relative z-10"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  🎮 Interactive Science Arcades
                </h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Engage in retro mechanics calibrated with high-yield Physics & Chemistry curriculums. Complete challenges to earn continuous score points!
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-mono font-bold text-white shrink-0 self-start sm:self-center">
                <Award className="w-4 h-4 text-zinc-400" /> STREAK MULTIPLIER: 1.5x
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* GAME 1: NEWTON'S RUNNER */}
              <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-zinc-800 transition group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition"></div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-xl">
                      <Zap className="w-5 h-5 text-zinc-300" />
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 font-mono">
                      CLASS 9 TO 12 PHYSICS
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-zinc-200 transition">
                      Newtonian Gravity Run
                    </h4>
                    <p className="text-xs text-zinc-500 leading-normal mt-1">
                      Control momentum and friction. Evade obstacles by responding to fast-paced velocity, inertia, and gravimetric questions. Speed scales infinitely!
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-4 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-mono text-zinc-600">
                    Highscore: <strong className="text-zinc-400 font-medium">{gdHighScore} m</strong>
                  </span>
                  <button 
                    onClick={() => {
                      setActiveGame('gravity-dash');
                      restartGDGame();
                    }}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    Launch Cabin <Play className="w-3.5 h-3.5 fill-black" />
                  </button>
                </div>
              </div>

              {/* GAME 2: CHEMICAL BUBBLE POP */}
              <div className="bg-black/40 border border-zinc-900 rounded-2xl p-6 space-y-4 flex flex-col justify-between hover:border-zinc-800 transition group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl pointer-events-none group-hover:bg-white/10 transition"></div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="p-2.5 bg-zinc-900 border border-zinc-800 text-white rounded-xl">
                      <Atom className="w-5 h-5 text-zinc-300" />
                    </span>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-zinc-500 font-mono">
                      CLASS 9 TO 12 CHEMISTRY
                    </span>
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white group-hover:text-zinc-200 transition">
                      Atomic Valency Bubble Shooter
                    </h4>
                    <p className="text-xs text-zinc-500 leading-normal mt-1">
                      Aim and shoot positively-charged ions (Na⁺, Mg²⁺) into negative grid layers. Group opposite charges to neutralize valency to 0 to trigger pops and clear elements!
                    </p>
                  </div>
                </div>

                <div className="border-t border-zinc-900/60 pt-4 flex items-center justify-between mt-4">
                  <span className="text-[11px] font-mono text-zinc-600">
                    Highscore: <strong className="text-zinc-400 font-medium">{bsHighScore} Coins</strong>
                  </span>
                  <button 
                    onClick={() => {
                      setActiveGame('bubble-shooter');
                      resetShooterGrid();
                    }}
                    className="px-4 py-2 bg-white hover:bg-zinc-200 text-black font-bold text-xs rounded-xl cursor-pointer transition flex items-center gap-1"
                  >
                    Launch Cabin <Play className="w-3.5 h-3.5 fill-black" />
                  </button>
                </div>
              </div>

            </div>
          </motion.div>
        )}

        {/* GAME A: NEWTONIAN GRAVITY RUN PLAYING PANEL */}
        {activeGame === 'gravity-dash' && (
          <motion.div 
            key="gravity-dash"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 relative z-10"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <button 
                onClick={() => {
                  setActiveGame('none');
                  setGdStatus('idle');
                }}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-xs rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Arcades
              </button>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                🚀 NEWTON'S GRAVITY RUN
              </h4>
              <div className="text-xs font-mono">
                Best: <strong className="text-zinc-300">{gdHighScore} m</strong>
              </div>
            </div>

            {/* Runner Visual Screen */}
            <div className="relative bg-zinc-950 border border-zinc-900 rounded-2xl h-[240px] overflow-hidden flex flex-col justify-between p-4">
              
              {/* Dynamic Grid Background sliding left */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px)] bg-[size:1.5rem_1.5rem] opacity-20 animate-pulse pointer-events-none"></div>

              {/* Top stats bar */}
              <div className="flex justify-between items-center z-10 text-xs text-zinc-400 font-mono">
                <div>Distance: <strong className="text-white text-sm">{gdScore} meters</strong></div>
                <div>Engine Velocity: <strong className="text-white">{gdSpeed * 20} km/h</strong></div>
              </div>

              {/* Interactive Lane Canvas */}
              <div className="relative w-full h-[120px] flex flex-col justify-around my-2 z-10">
                {/* Lanes tracks */}
                <div className="absolute left-0 right-0 h-0.5 bg-zinc-900 top-[20px]"></div>
                <div className="absolute left-0 right-0 h-0.5 bg-zinc-900 top-[60px]"></div>
                <div className="absolute left-0 right-0 h-0.5 bg-zinc-900 top-[100px]"></div>

                {/* Question Alert Notification */}
                {gdStatus === 'playing' && gdScore > 0 && gdScore % 80 < 30 && (
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 px-3 py-1.5 rounded-lg text-[10px] font-mono tracking-widest font-bold uppercase animate-ping">
                    ⚠️ PHYSICS WALL APPROACHING!
                  </div>
                )}

                {/* Character Icon moving horizontally or locked in lane */}
                <motion.div 
                  animate={{ y: runnerLane * 40 - 15 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="absolute left-16 w-8 h-8 rounded-full bg-white text-black flex items-center justify-center font-bold text-sm shadow-xl z-20"
                >
                  {gdStatus === 'crashed' ? '💥' : '🏃'}
                </motion.div>

                {/* Approaching obstacles */}
                {gdStatus === 'playing' && (
                  <motion.div
                    animate={{ x: [-40, 400] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="absolute right-10 w-4 h-4 bg-zinc-800 rounded-sm border border-zinc-700 flex items-center justify-center text-[8px] font-bold"
                  >
                    ⚡
                  </motion.div>
                )}
              </div>

              {/* QUESTION POPUP OVERLAY */}
              <AnimatePresence>
                {gdStatus === 'question' && currentGDQuestion && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    className="absolute inset-0 bg-black/90 backdrop-blur-sm z-30 flex flex-col justify-center p-6 space-y-3"
                  >
                    <div className="space-y-1 text-center">
                      <span className="text-[9px] uppercase tracking-wider text-yellow-500 font-bold font-mono">
                        ⚠️ FORCE SHIELD OBSTACLE DETECTED!
                      </span>
                      <h4 className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                        {currentGDQuestion.question}
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
                      {currentGDQuestion.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleGDAnswer(idx)}
                          disabled={!!gdFeedback}
                          className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-xl text-xs font-semibold cursor-pointer transition text-left"
                        >
                          <span className="font-mono text-zinc-600 mr-1">{String.fromCharCode(65 + idx)}.</span> {opt}
                        </button>
                      ))}
                    </div>

                    {gdFeedback && (
                      <motion.div 
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-center py-1.5 px-3 rounded-lg text-[11px] font-semibold border ${
                          gdFeedback.isCorrect 
                            ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400' 
                            : 'bg-rose-950/20 border-rose-900/30 text-rose-400 animate-bounce'
                        }`}
                      >
                        {gdFeedback.text}
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* CRASHED PANEL OVERLAY */}
              {gdStatus === 'crashed' && (
                <div className="absolute inset-0 bg-black/95 z-30 flex flex-col items-center justify-center space-y-4">
                  <div className="text-center space-y-1">
                    <Skull className="w-8 h-8 text-zinc-500 mx-auto animate-pulse" />
                    <h4 className="text-base font-bold text-white">GRAVIMETRIC DECOMPOSITION</h4>
                    <p className="text-xs text-zinc-500 font-mono">Distance Traveled: {gdScore} meters</p>
                  </div>
                  <div className="flex gap-2.5">
                    <button
                      onClick={restartGDGame}
                      className="px-4 py-2 bg-white text-black font-bold text-xs rounded-xl hover:bg-zinc-200 transition cursor-pointer"
                    >
                      Restart Run
                    </button>
                    <button
                      onClick={() => setActiveGame('none')}
                      className="px-4 py-2 bg-zinc-900 text-zinc-400 font-bold text-xs rounded-xl border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
                    >
                      Arcade Hub
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* Lane Controller Controls */}
            {gdStatus === 'playing' && (
              <div className="grid grid-cols-3 gap-2 bg-zinc-950 p-3 border border-zinc-900 rounded-xl">
                <button 
                  onClick={() => setRunnerLane(0)}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    runnerLane === 0 ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  🔼 Top Lane (High PE)
                </button>
                <button 
                  onClick={() => setRunnerLane(1)}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    runnerLane === 1 ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  ⏺️ Mid Lane (Zero G)
                </button>
                <button 
                  onClick={() => setRunnerLane(2)}
                  className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer ${
                    runnerLane === 2 ? 'bg-white text-black border-white' : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  🔽 Low Lane (High Friction)
                </button>
              </div>
            )}

            {/* Quick manual controls description */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-[11px] text-zinc-500 leading-normal text-center font-mono">
              💡 Toggle lanes to bypass gravitational obstacles. Maintain focus — as distance scales, force fields materialize and prompt your scientific evaluation!
            </div>
          </motion.div>
        )}

        {/* GAME B: ATOMIC VALENCY BUBBLE SHOOTER PLAYING PANEL */}
        {activeGame === 'bubble-shooter' && (
          <motion.div 
            key="bubble-shooter"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-6 relative z-10"
          >
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <button 
                onClick={() => setActiveGame('none')}
                className="px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 text-xs rounded-xl text-zinc-400 hover:text-white transition cursor-pointer"
              >
                ← Back to Arcades
              </button>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                🧪 VALENCY BUBBLE SHOOTER
              </h4>
              <div className="text-xs font-mono">
                Score: <strong className="text-zinc-300">{shooterScore} Coins</strong>
              </div>
            </div>

            {/* Main Interactive Bubble Shooter Arena */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-between min-h-[360px] relative">
              
              {/* Ion Hanging Grid */}
              <div className="w-full max-w-sm grid grid-cols-6 gap-3 mb-8">
                {bubbleGrid.map((row, rIdx) => 
                  row.map((ion, cIdx) => (
                    <div 
                      key={`${rIdx}-${cIdx}`} 
                      className={`h-11 rounded-full border-2 flex flex-col items-center justify-center text-xs font-bold shadow-md transition-all relative ${
                        ion ? `${ion.color} text-white animate-pulse` : 'bg-zinc-900/40 border-dashed border-zinc-900 text-zinc-850'
                      }`}
                      title={ion ? `${ion.name} (${ion.formula})` : 'Empty Space'}
                    >
                      {ion ? (
                        <>
                          <span className="text-[11px] font-sans font-bold leading-none">{ion.formula}</span>
                          <span className="text-[7px] font-mono opacity-80 mt-0.5 leading-none">{ion.charge > 0 ? `+${ion.charge}` : ion.charge}</span>
                        </>
                      ) : (
                        <span className="text-[8px] font-mono">.</span>
                      )}
                      
                      {/* Grid border columns guide lines */}
                      {aimColumn === cIdx && (
                        <div className="absolute top-12 left-1/2 -translate-x-1/2 w-0.5 h-16 border-l border-dashed border-zinc-850/40 pointer-events-none"></div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Launcher block */}
              <div className="w-full max-w-xs flex flex-col items-center space-y-4 pt-4 border-t border-zinc-900/60">
                
                {/* Aiming Deck column indicators */}
                <div className="flex items-center justify-between w-full">
                  <button 
                    onClick={() => setAimColumn(prev => Math.max(0, prev - 1))}
                    disabled={aimColumn === 0}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div className="text-center space-y-1">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-mono font-bold block">
                      AIMING COLUMN
                    </span>
                    <span className="text-sm font-mono text-white font-extrabold bg-zinc-900 px-3.5 py-1 rounded-xl border border-zinc-850">
                      Column {aimColumn + 1}
                    </span>
                  </div>

                  <button 
                    onClick={() => setAimColumn(prev => Math.min(5, prev + 1))}
                    disabled={aimColumn === 5}
                    className="p-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* Ion Loaded in Chamber */}
                <div className="flex items-center gap-4 bg-zinc-900/40 p-3 rounded-2xl border border-zinc-850/60 w-full justify-center">
                  <div className="space-y-0.5">
                    <span className="text-[9px] uppercase tracking-widest text-zinc-500 block font-mono">CHAMBER LOAD</span>
                    <span className="text-[11px] font-bold text-white block truncate max-w-[120px]">{currentLauncherIon.name}</span>
                  </div>

                  {/* Visual Sphere */}
                  <div className={`w-11 h-11 rounded-full border-2 ${currentLauncherIon.color} text-white flex flex-col items-center justify-center text-xs font-bold shadow-lg animate-bounce`}>
                    <span className="text-[11px] leading-none font-bold">{currentLauncherIon.formula}</span>
                    <span className="text-[7px] font-mono opacity-80 mt-0.5 leading-none">+{currentLauncherIon.charge}</span>
                  </div>
                </div>

                {/* Launch fire Button */}
                <button
                  onClick={handleShoot}
                  className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-extrabold text-xs rounded-xl shadow cursor-pointer transition flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-4 h-4 fill-black text-black" /> LAUNCH ION ORBIT
                </button>
              </div>

              {/* Feedback messages */}
              {shooterAlert && (
                <div className="mt-4 text-center py-2 px-3 bg-zinc-900/80 border border-zinc-850 rounded-xl text-[10px] sm:text-xs text-zinc-300 max-w-sm">
                  {shooterAlert}
                </div>
              )}
            </div>

            {/* Quick operational tip */}
            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-[11px] text-zinc-500 leading-normal text-center font-mono">
              💡 Chemistry Rule: An ion with positive valency (e.g. Sodium Na⁺) forms an ionic compound when combining with a negative charge (e.g. Chloride Cl⁻). Neutralize charges perfectly to trigger popping reactions!
            </div>
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
