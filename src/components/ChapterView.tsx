import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Brain, 
  Sparkles, 
  ChevronRight, 
  GraduationCap, 
  Layers, 
  Zap, 
  HelpCircle,
  Lightbulb,
  Check,
  RotateCcw,
  BookOpen,
  Youtube,
  FileText,
  ExternalLink,
  Lock,
  Compass,
  Workflow
} from 'lucide-react';
import { Chapter, ChapterSection, UserProgress, Course, OwnerProfile } from '../types';
import EditableText from './EditableText';
import LecturePlayer from './LecturePlayer';

interface ChapterViewProps {
  chapter: Chapter;
  progress: UserProgress;
  isEditMode: boolean;
  onUpdateChapter: (updatedChapter: Chapter) => void;
  onBack: () => void;
  onComplete: (chapterId: string) => void;
  onOpenAI: (mode: string, context: string, customPrompt?: string) => void;
  onStartQuiz: () => void;
  onStartFlashcards: () => void;
  ownerProfile?: OwnerProfile;
  onUpdateProgress?: (newProgress: UserProgress) => void;
}

export default function ChapterView({ 
  chapter, 
  progress, 
  isEditMode,
  onUpdateChapter,
  onBack, 
  onComplete, 
  onOpenAI, 
  onStartQuiz, 
  onStartFlashcards,
  ownerProfile,
  onUpdateProgress
}: ChapterViewProps) {
  const [activeTab, setActiveTab] = useState<'study' | 'diagram' | 'video'>('study');
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [pendingUrl, setPendingUrl] = useState<string | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string>('');
  const [showDownloadAlert, setShowDownloadAlert] = useState<string | null>(null);

  const handleDownloadClick = (url: string, title: string) => {
    if (ownerProfile && ownerProfile.allowDownloads === false) {
      setShowDownloadAlert("Downloads are disabled by the Academy Administrator.");
      setTimeout(() => setShowDownloadAlert(null), 4000);
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
    if (onUpdateProgress) {
      onUpdateProgress({
        ...progress,
        storagePermissionGranted: true
      });
    }
    if (pendingUrl) {
      triggerActualDownload(pendingUrl, pendingTitle);
    }
  };
  const [selectedOrganelle, setSelectedOrganelle] = useState<string>('nucleus');
  const [atomElement, setAtomElement] = useState<'H' | 'He' | 'Li' | 'C'>('He');
  const [voltage, setVoltage] = useState<number>(6);
  const [resistance, setResistance] = useState<number>(3);
  const [circuitOn, setCircuitOn] = useState<boolean>(true);
  
  // Chemical balancing state: a H2 + b O2 -> c H2O (balanced is 2H2 + 1O2 -> 2H2O)
  const [coeffH2, setCoeffH2] = useState<number>(1);
  const [coeffO2, setCoeffO2] = useState<number>(1);
  const [coeffH2O, setCoeffH2O] = useState<number>(1);

  const isCompleted = progress.completedChapters.includes(chapter.id);

  // Auto scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [chapter.id]);

  // Calculations for virtual circuit
  const current = circuitOn ? Number((voltage / resistance).toFixed(2)) : 0;
  const power = circuitOn ? Number((voltage * current).toFixed(1)) : 0;

  // Balancing checker
  const isEquationBalanced = coeffH2 * 2 === coeffH2O * 2 && coeffO2 * 2 === coeffH2O;

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

  const getAtomDetails = () => {
    switch (atomElement) {
      case 'H': return { name: 'Hydrogen', atomicNum: 1, config: '1', protons: 1, neutrons: 0, electrons: 1 };
      case 'He': return { name: 'Helium', atomicNum: 2, config: '2', protons: 2, neutrons: 2, electrons: 2 };
      case 'Li': return { name: 'Lithium', atomicNum: 3, config: '2, 1', protons: 3, neutrons: 4, electrons: 3 };
      case 'C': return { name: 'Carbon', atomicNum: 6, config: '2, 4', protons: 6, neutrons: 6, electrons: 6 };
    }
  };

  const updateSectionBody = (secId: string, newBody: string) => {
    const updatedSections = chapter.sections.map(sec => 
      sec.id === secId ? { ...sec, body: newBody } : sec
    );
    onUpdateChapter({
      ...chapter,
      sections: updatedSections
    });
  };

  const updateSectionTitle = (secId: string, newTitle: string) => {
    const updatedSections = chapter.sections.map(sec => 
      sec.id === secId ? { ...sec, title: newTitle } : sec
    );
    onUpdateChapter({
      ...chapter,
      sections: updatedSections
    });
  };

  const renderSimulation = () => {
    switch (chapter.sections[0]?.diagramType) {
      case 'cell':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300">🔬 Interactive Eukaryotic Cell Map</h4>
            <p className="text-xs text-zinc-500">Click on any labeled organelle on the cell diagram below to inspect its functions and standard analogies:</p>
            
            <div className="relative w-full h-56 bg-black border border-zinc-900 rounded-xl overflow-hidden flex items-center justify-center p-2">
              <svg viewBox="0 0 200 200" className="w-48 h-48 text-zinc-400">
                {/* Cell Boundary */}
                <ellipse cx="100" cy="100" rx="90" ry="80" fill="none" stroke="#e4e4e7" strokeWidth="2" strokeDasharray="3 3" />
                
                {/* Cytoplasm Background */}
                <ellipse cx="100" cy="100" rx="86" ry="76" fill="#18181b" />

                {/* Nucleus */}
                <circle 
                  cx="90" 
                  cy="90" 
                  r="28" 
                  fill={selectedOrganelle === 'nucleus' ? '#3f3f46' : '#27272a'} 
                  stroke="#a1a1aa" 
                  strokeWidth="1.5" 
                  className="cursor-pointer transition-colors hover:fill-zinc-600"
                  onClick={() => setSelectedOrganelle('nucleus')}
                />
                <circle cx="85" cy="85" r="8" fill="#e4e4e7" opacity="0.6" />

                {/* Mitochondria 1 */}
                <ellipse 
                  cx="145" 
                  cy="75" 
                  rx="14" 
                  ry="8" 
                  transform="rotate(15 145 75)"
                  fill={selectedOrganelle === 'mitochondria' ? '#3f3f46' : '#27272a'} 
                  stroke="#a1a1aa" 
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors hover:fill-zinc-600"
                  onClick={() => setSelectedOrganelle('mitochondria')}
                />
                
                {/* Chloroplast */}
                <ellipse 
                  cx="135" 
                  cy="135" 
                  rx="16" 
                  ry="9" 
                  transform="rotate(-20 135 135)"
                  fill={selectedOrganelle === 'chloroplast' ? '#3f3f46' : '#27272a'} 
                  stroke="#a1a1aa" 
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors hover:fill-zinc-600"
                  onClick={() => setSelectedOrganelle('chloroplast')}
                />

                {/* Lysosomes */}
                <circle 
                  cx="50" 
                  cy="135" 
                  r="7" 
                  fill={selectedOrganelle === 'lysosome' ? '#3f3f46' : '#27272a'} 
                  stroke="#a1a1aa" 
                  strokeWidth="1.5"
                  className="cursor-pointer transition-colors hover:fill-zinc-600"
                  onClick={() => setSelectedOrganelle('lysosome')}
                />

                {/* Plasma Membrane boundary hotpoint */}
                <ellipse 
                  cx="100" 
                  cy="100" 
                  rx="90" 
                  ry="80" 
                  fill="none" 
                  stroke={selectedOrganelle === 'membrane' ? '#e4e4e7' : 'transparent'} 
                  strokeWidth="6"
                  className="cursor-pointer"
                  onClick={() => setSelectedOrganelle('membrane')}
                />
              </svg>

              {/* Organelle Lables overlay */}
              <button 
                onClick={() => setSelectedOrganelle('nucleus')}
                className={`absolute left-1/4 top-1/3 text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition ${selectedOrganelle === 'nucleus' ? 'bg-zinc-100 text-black font-semibold' : 'bg-zinc-900 text-zinc-400'}`}
              >
                Nucleus
              </button>
              <button 
                onClick={() => setSelectedOrganelle('mitochondria')}
                className={`absolute right-1/4 top-1/4 text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition ${selectedOrganelle === 'mitochondria' ? 'bg-zinc-100 text-black font-semibold' : 'bg-zinc-900 text-zinc-400'}`}
              >
                Mitochondria
              </button>
              <button 
                onClick={() => setSelectedOrganelle('chloroplast')}
                className={`absolute right-1/4 bottom-1/4 text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition ${selectedOrganelle === 'chloroplast' ? 'bg-zinc-100 text-black font-semibold' : 'bg-zinc-900 text-zinc-400'}`}
              >
                Chloroplast
              </button>
              <button 
                onClick={() => setSelectedOrganelle('lysosome')}
                className={`absolute left-1/3 bottom-1/4 text-[10px] px-1.5 py-0.5 rounded cursor-pointer transition ${selectedOrganelle === 'lysosome' ? 'bg-zinc-100 text-black font-semibold' : 'bg-zinc-900 text-zinc-400'}`}
              >
                Lysosome
              </button>
            </div>

            {/* Selected Organelle Card */}
            <AnimatePresence mode="wait">
              {selectedOrganelle && (
                <motion.div 
                  key={selectedOrganelle}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 space-y-2 text-xs text-zinc-300"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white text-sm">
                      {organelleInfo[selectedOrganelle].name}
                    </span>
                    <span className="bg-zinc-900 px-2 py-0.5 rounded text-[10px] text-zinc-500 font-mono">
                      Organelle Analysis
                    </span>
                  </div>
                  <p className="leading-relaxed text-zinc-400">
                    <strong>Function:</strong> {organelleInfo[selectedOrganelle].role}
                  </p>
                  <p className="text-zinc-200 italic leading-relaxed">
                    <strong>Startup Analogy:</strong> {organelleInfo[selectedOrganelle].analogy}
                  </p>
                  <button
                    onClick={() => onOpenAI('analogy', chapter.title, `Give me an alternative, incredibly creative Indian analogy to explain the function of the ${organelleInfo[selectedOrganelle].name} in eukaryotic cells.`)}
                    className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                  >
                    <Brain className="w-3 h-3" /> Get fresh AI Analogy
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );

      case 'atom':
        const atom = getAtomDetails();
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300">⚛️ Bohr-Bury Shell Visualizer</h4>
            <div className="flex justify-between items-center bg-zinc-950 p-2 border border-zinc-900 rounded-xl gap-1">
              {(['H', 'He', 'Li', 'C'] as const).map(el => (
                <button
                  key={el}
                  onClick={() => setAtomElement(el)}
                  className={`flex-1 text-center py-1 rounded font-bold text-xs transition cursor-pointer ${
                    atomElement === el ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-850'
                  }`}
                >
                  {el}
                </button>
              ))}
            </div>

            {/* Atomic Bohr Representation Canvas */}
            <div className="relative w-full h-56 bg-black border border-zinc-900 rounded-xl flex items-center justify-center">
              <div className="absolute inset-0 flex items-center justify-center">
                {/* K Shell (n=1) */}
                <div className="w-24 h-24 rounded-full border border-dashed border-zinc-800 flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  {atom.electrons >= 1 && <div className="absolute top-0 w-2.5 h-2.5 bg-white rounded-full"></div>}
                  {atom.electrons >= 2 && <div className="absolute bottom-0 w-2.5 h-2.5 bg-white rounded-full"></div>}
                </div>
              </div>

              {atom.electrons >= 3 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  {/* L Shell (n=2) */}
                  <div className="w-40 h-40 rounded-full border border-dashed border-zinc-800 flex items-center justify-center animate-[spin_15s_linear_infinite_reverse]">
                    <div className="absolute top-0 w-2.5 h-2.5 bg-zinc-400 rounded-full"></div>
                    {atom.electrons >= 4 && <div className="absolute right-0 w-2.5 h-2.5 bg-zinc-400 rounded-full"></div>}
                    {atom.electrons >= 5 && <div className="absolute bottom-0 w-2.5 h-2.5 bg-zinc-400 rounded-full"></div>}
                    {atom.electrons >= 6 && <div className="absolute left-0 w-2.5 h-2.5 bg-zinc-400 rounded-full"></div>}
                  </div>
                </div>
              )}

              {/* Central Nucleus */}
              <div className="relative z-10 w-10 h-10 rounded-full bg-zinc-900 border border-zinc-700 flex flex-col items-center justify-center text-[10px] font-mono">
                <span className="text-white font-bold">p:{atom.protons}</span>
                <span className="text-zinc-500">n:{atom.neutrons}</span>
              </div>
            </div>

            {/* Element Data */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 text-xs space-y-1.5">
              <div className="flex justify-between items-center border-b border-zinc-900 pb-1.5 mb-1.5">
                <span className="font-semibold text-white text-sm">{atom.name} ({atomElement})</span>
                <span className="text-[10px] bg-zinc-900 px-1.5 py-0.5 rounded text-zinc-400">Z = {atom.atomicNum}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-zinc-400 font-mono text-[11px]">
                <div>Protons: <span className="font-semibold text-white">{atom.protons}</span></div>
                <div>Neutrons: <span className="font-semibold text-white">{atom.neutrons}</span></div>
                <div>Electrons: <span className="font-semibold text-white">{atom.electrons}</span></div>
                <div>Valency: <span className="font-semibold text-white">{atomElement === 'H' ? 1 : atomElement === 'He' ? 0 : atomElement === 'Li' ? 1 : 4}</span></div>
              </div>
            </div>
          </div>
        );

      case 'circuit':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-zinc-300">⚡ Ohm's Law Simulation Lab</h4>
              <button 
                onClick={() => setCircuitOn(!circuitOn)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg cursor-pointer border transition-colors ${
                  circuitOn 
                    ? 'bg-zinc-800 border-zinc-700 text-white' 
                    : 'bg-black border-zinc-900 text-zinc-500'
                }`}
              >
                {circuitOn ? '● Power Active' : '○ Power Suspended'}
              </button>
            </div>

            {/* Circuit representation */}
            <div className="relative w-full h-56 bg-black border border-zinc-900 rounded-xl flex flex-col items-center justify-center p-4">
              <div className="flex flex-col items-center space-y-2 mb-2">
                <div 
                  className="w-14 h-14 rounded-full border flex items-center justify-center transition-all duration-300"
                  style={{
                    backgroundColor: circuitOn ? `rgba(255, 255, 255, ${Math.min(current / 2.5, 0.95)})` : 'transparent',
                    boxShadow: circuitOn ? `0 0 ${power * 2}px rgba(255, 255, 255, 0.8)` : 'none',
                    borderColor: circuitOn ? '#ffffff' : '#52525b'
                  }}
                >
                  <Zap className={`w-6 h-6 ${circuitOn ? 'text-black' : 'text-zinc-500'}`} />
                </div>
                <div className="text-[10px] text-zinc-500">Virtual Conductor Coil</div>
              </div>

              <div className="flex justify-between w-full mt-4 bg-zinc-950 p-2 border border-zinc-900 rounded-lg text-[10px] font-mono text-zinc-400">
                <div>V: <span className="text-white font-semibold">{voltage}V</span></div>
                <div>R: <span className="text-white font-semibold">{resistance}Ω</span></div>
                <div>I: <span className="text-white font-semibold">{current}A</span></div>
                <div>P: <span className="text-white font-semibold">{power}W</span></div>
              </div>
            </div>

            {/* Slider controls */}
            <div className="space-y-3 bg-zinc-950 border border-zinc-900 p-4 rounded-xl text-xs">
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Battery Voltage (V)</span>
                  <span className="font-mono text-white font-bold">{voltage} V</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="12" 
                  step="1"
                  value={voltage} 
                  onChange={(e) => setVoltage(Number(e.target.value))}
                  className="w-full accent-white h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-zinc-400">
                  <span>Conductor Resistance (R)</span>
                  <span className="font-mono text-white font-bold">{resistance} Ω</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1"
                  value={resistance} 
                  onChange={(e) => setResistance(Number(e.target.value))}
                  className="w-full accent-white h-1 bg-zinc-900 rounded appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        );

      case 'reaction':
        return (
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-zinc-300">⚖️ Reactant Equation Balancer</h4>
            
            <div className="bg-black p-4 border border-zinc-900 rounded-xl space-y-4">
              <div className="flex items-center justify-center gap-2 text-sm font-mono text-white">
                <div className="flex flex-col items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-900">
                  <button onClick={() => setCoeffH2(prev => Math.min(prev + 1, 4))} className="text-xs text-white px-1 cursor-pointer">▲</button>
                  <span className="font-bold text-white">{coeffH2}</span>
                  <button onClick={() => setCoeffH2(prev => Math.max(prev - 1, 1))} className="text-xs text-white px-1 cursor-pointer">▼</button>
                </div>
                <span>H₂</span>

                <span>+</span>

                <div className="flex flex-col items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-900">
                  <button onClick={() => setCoeffO2(prev => Math.min(prev + 1, 4))} className="text-xs text-white px-1 cursor-pointer">▲</button>
                  <span className="font-bold text-white">{coeffO2}</span>
                  <button onClick={() => setCoeffO2(prev => Math.max(prev - 1, 1))} className="text-xs text-white px-1 cursor-pointer">▼</button>
                </div>
                <span>O₂</span>

                <span className="font-bold">→</span>

                <div className="flex flex-col items-center gap-1 bg-zinc-950 p-1 rounded border border-zinc-900">
                  <button onClick={() => setCoeffH2O(prev => Math.min(prev + 1, 4))} className="text-xs text-white px-1 cursor-pointer">▲</button>
                  <span className="font-bold text-white">{coeffH2O}</span>
                  <button onClick={() => setCoeffH2O(prev => Math.max(prev - 1, 1))} className="text-xs text-white px-1 cursor-pointer">▼</button>
                </div>
                <span>H₂O</span>
              </div>

              {/* Status balancing board */}
              <div className="grid grid-cols-2 gap-4 border-t border-zinc-900 pt-3 text-xs font-mono text-zinc-400">
                <div>
                  <h5 className="text-[10px] text-zinc-600 mb-1">Reactants (Left)</h5>
                  <div>Hydrogen: <span className={coeffH2 * 2 === coeffH2O * 2 ? 'text-white font-bold' : 'text-zinc-600'}>{coeffH2 * 2}</span></div>
                  <div>Oxygen: <span className={coeffO2 * 2 === coeffH2O ? 'text-white font-bold' : 'text-zinc-600'}>{coeffO2 * 2}</span></div>
                </div>
                <div>
                  <h5 className="text-[10px] text-zinc-600 mb-1">Products (Right)</h5>
                  <div>Hydrogen: <span className={coeffH2 * 2 === coeffH2O * 2 ? 'text-white font-bold' : 'text-zinc-600'}>{coeffH2O * 2}</span></div>
                  <div>Oxygen: <span className={coeffO2 * 2 === coeffH2O ? 'text-white font-bold' : 'text-zinc-600'}>{coeffH2O}</span></div>
                </div>
              </div>

              <div className={`p-2 rounded-lg text-center text-xs flex items-center justify-center gap-1.5 ${isEquationBalanced ? 'bg-zinc-900 border border-zinc-800 text-white font-bold' : 'text-zinc-500'}`}>
                {isEquationBalanced ? (
                  <>
                    <Check className="w-4 h-4 text-white" /> Balanced! (2 H₂ + O₂ → 2 H₂O)
                  </>
                ) : (
                  'Balance hydrogen and oxygen coefficients!'
                )}
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl text-center text-xs text-zinc-600">
            No interactive lab simulation available for this section.
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-20 text-zinc-300 font-sans">
      {/* Chapter Top Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-850/80">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-zinc-900 hover:bg-zinc-800 active:scale-95 transition border border-zinc-800 rounded-xl text-zinc-400 hover:text-white cursor-pointer"
            id="btn-back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-300 font-mono font-bold">
                Class {chapter.classLevel}
              </span>
              <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-mono">
                {chapter.subject}
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-sans font-bold text-white tracking-tight line-clamp-1">
              <EditableText
                value={chapter.title}
                onSave={(newVal) => onUpdateChapter({ ...chapter, title: newVal })}
                isEditMode={isEditMode}
                as="span"
              />
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onComplete(chapter.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
              isCompleted
                ? 'bg-zinc-900 border-zinc-800 text-zinc-300'
                : 'bg-white hover:bg-zinc-200 text-black border-white shadow'
            }`}
          >
            {isCompleted ? (
              <>
                <Check className="w-3.5 h-3.5" /> Marked Completed
              </>
            ) : (
              'Mark as Completed'
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: Reading Pane & Lecture materials */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Column: Core Readings and Simulations */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Chapter Description Overview Card */}
          <div className="bg-zinc-950 border border-zinc-900 p-6 rounded-2xl space-y-3">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-zinc-300" /> Lesson Curriculum Syllabus Overview
            </h3>
            <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
              <EditableText
                value={chapter.description}
                onSave={(newVal) => onUpdateChapter({ ...chapter, description: newVal })}
                isEditMode={isEditMode}
                as="span"
                multiline={true}
              />
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {chapter.keyConcepts.map((concept, idx) => (
                <span key={idx} className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-850 px-2.5 py-1 rounded-lg">
                  🎯 {concept}
                </span>
              ))}
            </div>
          </div>

          {/* Master Tab Section: Study notes, Lab simulations, Video lectures */}
          <div className="flex border-b border-zinc-850 bg-zinc-950/30 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('study')}
              className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                activeTab === 'study'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              📘 Study Chapter Material
            </button>
            <button
              onClick={() => setActiveTab('diagram')}
              className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                activeTab === 'diagram'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:text-zinc-350'
              }`}
            >
              🔬 Interactive Virtual Lab
            </button>
            {chapter.lectureUrl && (
              <button
                onClick={() => setActiveTab('video')}
                className={`flex-1 text-center py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition cursor-pointer ${
                  activeTab === 'video'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-500 hover:text-zinc-350'
                }`}
              >
                📽️ Video Lecture Class
              </button>
            )}
          </div>

          <div className="space-y-6">
            {activeTab === 'study' ? (
              chapter.sections.map((section, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.1 }}
                  key={section.id}
                  className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-900 pb-3">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      <EditableText
                        value={section.title}
                        onSave={(newVal) => updateSectionTitle(section.id, newVal)}
                        isEditMode={isEditMode}
                        as="span"
                      />
                    </h3>
                    
                    {/* Ask AI Assist tags */}
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => onOpenAI('doubt', chapter.title, `Explain this section of "${chapter.title}": "${section.title}". Here is the content: "${section.body}"`)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-[10px] text-zinc-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Brain className="w-3 h-3 text-zinc-400" /> Explain Simply
                      </button>
                      <button
                        onClick={() => onOpenAI('analogy', chapter.title, `Provide a highly relatable, fun, Indian daily-life analogy to explain this core concept of "${section.title}": "${section.body}"`)}
                        className="px-2 py-1 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-850 text-[10px] text-zinc-400 hover:text-white font-medium flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Sparkles className="w-3 h-3 text-zinc-400" /> Make Analogy
                      </button>
                    </div>
                  </div>

                  {/* Section Body */}
                  <p className="text-zinc-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                    <EditableText
                      value={section.body}
                      onSave={(newVal) => updateSectionBody(section.id, newVal)}
                      isEditMode={isEditMode}
                      as="span"
                      multiline={true}
                    />
                  </p>

                  {/* High Yield Key Points */}
                  {section.keyPoints && (
                    <div className="bg-zinc-900/40 border border-zinc-850 p-4 rounded-xl mt-2 space-y-2">
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" /> High-Yield Syllabus Facts
                      </h4>
                      <ul className="space-y-1">
                        {section.keyPoints.map((point, pIdx) => (
                          <li key={pIdx} className="text-xs text-zinc-400 flex items-start gap-1.5 leading-normal">
                            <span className="text-zinc-500 mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              ))
            ) : activeTab === 'diagram' ? (
              /* Virtual Interactive Lab Tab */
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-zinc-950 border border-zinc-900 rounded-2xl p-6 space-y-4 shadow-sm"
              >
                {renderSimulation()}
              </motion.div>
            ) : (
              /* Premium Lecture Player overlay dashboard */
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <LecturePlayer
                  chapter={chapter}
                  studentName={progress.studentName || 'Curious mind'}
                  isTeacher={progress.studentName === 'Priyanshu'}
                  onBack={() => setActiveTab('study')}
                />
              </motion.div>
            )}
          </div>
        </div>

        {/* Right Column: Educational widgets, file downloads, links, test CTAs */}
        <div className="space-y-6">
          
          {/* Practice and Retain Test CTA */}
          <div className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl space-y-4 shadow-xl text-center sm:text-left">
            <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
              <GraduationCap className="w-4 h-4" /> Practice Tests & DPPs
            </h4>
            <p className="text-xs text-zinc-500 leading-normal">
              Validate your scientific conceptual strength. Explore the chapter using interactive mind maps or try MCQs.
            </p>

            <div className="grid grid-cols-1 gap-2.5">
              <button
                onClick={onStartFlashcards}
                className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-805 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Workflow className="w-4 h-4 text-blue-400" /> Explore Interactive Mind Map
              </button>
              <button
                onClick={onStartQuiz}
                className="w-full py-2.5 bg-white hover:bg-zinc-200 text-black font-bold rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-4 h-4 text-black" /> Take MCQ Assessment Test
              </button>
            </div>
          </div>

          {/* Downloadable Google Drive PDF and Practice DPP sheets */}
          {(chapter.pdfUrl || chapter.dppUrl || (chapter.dppFiles && chapter.dppFiles.length > 0)) && (
            <div className="bg-zinc-950 border border-zinc-850 p-5 rounded-2xl space-y-3.5 shadow-xl">
              <h4 className="text-xs font-extrabold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Reference Study Resources
              </h4>
              <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                <p className="text-[11px] text-zinc-500 leading-normal">
                  Download educational materials hosted securely on {ownerProfile?.storageDestination === 'google-drive' ? 'Google Storage' : 'Local Academy Vault'}.
                </p>
                {progress.storagePermissionGranted && (
                  <span className="text-[9px] px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/10 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Storage Permission Granted
                  </span>
                )}
              </div>

              <div className="space-y-2">
                {chapter.pdfUrl && (
                  <button
                    type="button"
                    onClick={() => handleDownloadClick(chapter.pdfUrl || '', 'Syllabus Lecture Notes PDF')}
                    className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded-xl text-zinc-300 hover:text-white transition text-xs flex items-center justify-between group cursor-pointer font-medium text-left"
                  >
                    <span className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-zinc-400" /> Syllabus Lecture Notes PDF
                    </span>
                    <div className="flex items-center gap-1.5">
                      {ownerProfile?.allowDownloads === false ? (
                        <span className="text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Downloads Locked
                        </span>
                      ) : (
                        <span className="text-[9px] text-zinc-400 group-hover:text-white font-mono font-bold">📥 Download Notes</span>
                      )}
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    </div>
                  </button>
                )}

                {chapter.dppFiles && chapter.dppFiles.length > 0 ? (
                  chapter.dppFiles.map((file, idx) => (
                    <button
                      key={file.id || idx}
                      type="button"
                      onClick={() => handleDownloadClick(file.url || '', file.name || `Daily Practice DPP Sheet Day #${idx + 1}`)}
                      className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded-xl text-zinc-300 hover:text-white transition text-xs flex items-center justify-between group cursor-pointer font-medium text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-cyan-400" /> {file.name || `Practice Sheet Day #${idx + 1}`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {ownerProfile?.allowDownloads === false ? (
                          <span className="text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Downloads Locked
                          </span>
                        ) : (
                          <span className="text-[9px] text-zinc-400 group-hover:text-white font-mono font-bold">📥 Download sheet</span>
                        )}
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  ))
                ) : (
                  chapter.dppUrl && (
                    <button
                      type="button"
                      onClick={() => handleDownloadClick(chapter.dppUrl || '', 'Daily Practice DPP Sheet')}
                      className="w-full px-3 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-805 rounded-xl text-zinc-300 hover:text-white transition text-xs flex items-center justify-between group cursor-pointer font-medium text-left"
                    >
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-zinc-400" /> Daily Practice DPP Sheet
                      </span>
                      <div className="flex items-center gap-1.5">
                        {ownerProfile?.allowDownloads === false ? (
                          <span className="text-[9px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-lg font-mono font-bold flex items-center gap-1">
                            <Lock className="w-2.5 h-2.5" /> Downloads Locked
                          </span>
                        ) : (
                          <span className="text-[9px] text-zinc-400 group-hover:text-white font-mono font-bold">📥 Download DPP</span>
                        )}
                        <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                      </div>
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* Prompt Doubt Shortcuts */}
          <div className="bg-zinc-950 border border-zinc-900 p-5 rounded-2xl space-y-3 shadow-xl">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-white" /> Fast Doubtsshortcuts
            </h4>
            <p className="text-xs text-zinc-500 leading-normal">
              Need immediate conceptual explanations? Click standard shortcuts below to query the Bharat AI desk:
            </p>

            <div className="space-y-1.5">
              <button
                onClick={() => onOpenAI('quiz', chapter.title, `Test me on topics from "${chapter.title}" by asking an interactive Multiple Choice Question.`)}
                className="w-full text-left px-3 py-2.5 bg-black hover:bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-300 hover:text-white transition text-[11px] flex items-center justify-between group cursor-pointer"
              >
                <span>📝 Test me with interactive MCQ</span>
                <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
              <button
                onClick={() => onOpenAI('numerical', chapter.title, `Generate an interesting Class 9/10 level scientific numerical question related to "${chapter.title}" topics. Give me a question to solve first, then ask if I want the step-by-step solution.`)}
                className="w-full text-left px-3 py-2.5 bg-black hover:bg-zinc-900 border border-zinc-900 rounded-lg text-zinc-300 hover:text-white transition text-[11px] flex items-center justify-between group cursor-pointer"
              >
                <span>🧮 Solve high-yield scientific numerical</span>
                <ChevronRight className="w-3 h-3 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Dynamic Download alert toast */}
      <AnimatePresence>
        {showDownloadAlert && (
          <div className="fixed bottom-6 right-6 z-50 bg-white text-black font-semibold text-xs py-2.5 px-4 rounded-xl shadow-2xl flex items-center gap-2 border border-zinc-200">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
            <span>{showDownloadAlert}</span>
          </div>
        )}
      </AnimatePresence>

      {/* Tricolor Student Storage Permission Request Modal */}
      <AnimatePresence>
        {showStorageModal && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-zinc-950 border border-zinc-850 max-w-md w-full rounded-3xl p-6 space-y-5 relative overflow-hidden text-left"
            >
              {/* Top Premium Accent line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>

              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/25 text-blue-400 rounded-2xl flex items-center justify-center">
                  <Layers className="w-6 h-6 animate-pulse" id="chapter-view-layers-icon" />
                </div>
                <h3 className="text-base font-extrabold text-white">
                  🔒 Storage Permissions Required
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  In order to download and cache reference material <strong>"{pendingTitle}"</strong> directly into your secure phone storage, {ownerProfile?.instituteName || 'the Academy'} requires standard storage write authorization.
                </p>
              </div>

              <div className="bg-zinc-900/60 p-4 rounded-2xl border border-zinc-850/60 text-[10px] space-y-2 text-zinc-400">
                <p className="font-bold text-zinc-300">🛡️ Student Privacy Compliance:</p>
                <p>
                  No personal phone files or photos are accessed. Storage permissions are strictly isolated for caching syllabus lecture PDF sheets.
                </p>
              </div>

              <div className="flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowStorageModal(false)}
                  className="flex-1 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Deny
                </button>
                <button
                  type="button"
                  onClick={handleGrantPermission}
                  className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-black rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Grant Storage Permission
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
