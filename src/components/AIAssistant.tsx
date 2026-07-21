import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Send, 
  Brain, 
  Sparkles, 
  X, 
  Sliders, 
  Info, 
  CornerDownRight, 
  RotateCcw,
  BookOpen,
  Download,
  Check,
  Lock,
  Unlock,
  ArrowLeft
} from 'lucide-react';
import { ChatMessage, UserProgress } from '../types';
import { translations } from '../lib/translations';
import { playSound } from '../utils/audio';
import ThreeDElement from './ThreeDElement';
import HorizontalScrollContainer from './HorizontalScrollContainer';

interface AIAssistantProps {
  currentChapterTitle?: string;
  isOpen?: boolean;
  onClose?: () => void;
  // Allows other components to pre-inject prompts
  preloadedPrompt?: { mode: string; text: string };
  onClearPreload?: () => void;
  onIncrementDoubtsAsked: () => void;
  appLanguage?: 'en' | 'hi';
  inline?: boolean;
  isDarkMode?: boolean;
  progress?: UserProgress;
  onUpdateProgress?: (newProgress: UserProgress) => void;
}

export default function AIAssistant({ 
  currentChapterTitle, 
  isOpen = true, 
  onClose, 
  preloadedPrompt,
  onClearPreload,
  onIncrementDoubtsAsked,
  appLanguage = 'en',
  inline = false,
  isDarkMode = true,
  progress,
  onUpdateProgress
}: AIAssistantProps) {
  const t = translations[appLanguage];

  const getWelcomeText = () => {
    return appLanguage === 'hi'
      ? "नमस्ते! मैं **भारत AI** हूँ, आपका व्यक्तिगत विज्ञान गुरु। 🇮🇳🧬\n\nमैं आपके संदेहों को हल कर सकता हूँ, भौतिकी के कठिन न्यूमेरिकलों को समझा सकता हूँ, या जीव विज्ञान को सरल सादृश्य (Analogy) से सिखा सकता हूँ!\n\nआज आप किस विषय में उत्सुक हैं?"
      : "Namaste! I am **Bharat AI**, your personal Science Guru. 🇮🇳🧬\n\nI can solve your school doubts, break down hard physics numericals, or teach you biology using simple analogies!\n\nWhat are you curious about today?";
  };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [studyMode, setStudyMode] = useState<'doubt' | 'numerical' | 'quiz' | 'analogy'>('doubt');
  const [apiError, setApiError] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  // Storage and file download permission states
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [pendingText, setPendingText] = useState('');
  const [pendingTitle, setPendingTitle] = useState('');
  const [showDownloadAlert, setShowDownloadAlert] = useState<string | null>(null);

  const handleDownloadNote = (content: string, title: string) => {
    if (progress && !progress.storagePermissionGranted) {
      setPendingText(content);
      setPendingTitle(title);
      setShowStorageModal(true);
      return;
    }
    triggerActualDownload(content, title);
  };

  const triggerActualDownload = (content: string, title: string) => {
    setShowDownloadAlert(`Downloading "${title}"... Saved directly to local storage.`);
    setTimeout(() => setShowDownloadAlert(null), 5000);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/[^a-zA-Z0-9]/g, '_')}_note.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGrantPermission = () => {
    setShowStorageModal(false);
    if (onUpdateProgress && progress) {
      onUpdateProgress({
        ...progress,
        storagePermissionGranted: true
      });
    }
    if (pendingText) {
      triggerActualDownload(pendingText, pendingTitle);
    }
  };

  const startVoiceTyping = () => {
    playSound('click');
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsListening(true);
      setTimeout(() => {
        setInputText(appLanguage === 'hi' 
          ? "क्या आप मुझे न्यूटन के गति के नियम समझा सकते हैं?" 
          : "Can you explain Newton's laws of motion in simple terms?"
        );
        setIsListening(false);
      }, 2000);
      return;
    }

    try {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = appLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInputText(text);
      };

      rec.onerror = (err: any) => {
        console.warn('Voice typing error:', err);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: getWelcomeText(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, [appLanguage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (preloadedPrompt && (isOpen || inline)) {
      setStudyMode(preloadedPrompt.mode as any);
      handleSendMessage(preloadedPrompt.text);
      if (onClearPreload) onClearPreload();
    }
  }, [preloadedPrompt, isOpen, inline]);

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    setApiError(null);

    const userMsg: ChatMessage = {
      id: Math.random().toString(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customText) setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: messages.concat(userMsg),
          chapterContext: currentChapterTitle || (appLanguage === 'hi' ? 'सामान्य विज्ञान कक्षा 9 से 12' : 'General Class 9 to 12 Science'),
          question: textToSend,
          mode: studyMode
        })
      });

      let data;
      const contentType = response.headers.get('content-type') || '';

      if (response.ok) {
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { text: text || (appLanguage === 'hi' ? "मुझे सर्वर से अमान्य उत्तर प्राप्त हुआ।" : "I received an unformatted response from the server.") };
        }
      } else {
        let errorMessage = appLanguage === 'hi' 
          ? "एआई सहायक अस्थायी रूप से ऑफ़लाइन है। कृपया अपनी एपीआई कुंजी की जांच करें।"
          : 'The AI Assistant experienced a conceptual hiccup. Please verify if your API key is correctly configured.';
        if (contentType.includes('application/json')) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // ignore
          }
        } else {
          const text = await response.text();
          if (text && text.length < 200 && !text.includes('<!doctype') && !text.includes('<!DOCTYPE')) {
            errorMessage = text;
          }
        }
        throw new Error(errorMessage);
      }
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: data.text || data.response || "No response text.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      onIncrementDoubtsAsked();
    } catch (err: any) {
      console.error('AI chat failed:', err);
      
      const fallbackResponses: Record<string, string> = appLanguage === 'hi' ? {
        'doubt': "मैं वर्तमान में ऑफ़लाइन काम कर रहा हूँ। यहाँ एक संक्षिप्त सारांश है:\n\n1. **मुख्य विचार**: भौतिकी और रसायन विज्ञान के नियम सार्वभौमिक संरक्षण सिद्धांतों (जैसे द्रव्यमान या ऊर्जा के संरक्षण) पर आधारित हैं।\n2. **सीबीएसई सलाह**: हमेशा परीक्षा में सूत्र, चरण-वार गणना और सही मात्रक (SI Unit) अवश्य लिखें।",
        'quiz': "यहाँ आपके लिए एक ऑफ़लाइन पुनरीक्षण प्रश्न है:\n\n**प्रश्न**: विद्युत प्रतिरोधकता का S.I. मात्रक क्या है?\n- A) ओम (Ohm)\n- B) ओम-मीटर (Ohm-meter)\n- C) वोल्ट (Volt)\n- D) एम्पीयर (Ampere)\n\n*संकेत: R = ρL/A सूत्र से इसे प्राप्त किया जाता है*",
        'numerical': "यहाँ एक मानक ऑफ़लाइन न्यूमेरिकल उदाहरण है:\n\n**प्रश्न**: एक तार का प्रतिरोध R है। यदि इसकी लंबाई दोगुनी और क्षेत्रफल आधा कर दिया जाए, तो नया प्रतिरोध क्या होगा?\n- **उत्तर**: नया प्रतिरोध 4R हो जाएगा, क्योंकि लंबाई बढ़ने और मोटाई घटने से प्रतिरोध 4 गुना बढ़ जाता है।",
        'analogy': "यहाँ एक ऑफ़लाइन उदाहरण है:\n\n**प्रतिरोध (Resistance) का उदाहरण**:\nएक व्यस्त मेट्रो स्टेशन की कल्पना करें। यात्री इलेक्ट्रॉन (धारा) हैं। रास्ते में आने वाले खंभे और अन्य यात्री परमाणु हैं जो बाधा उत्पन्न करते हैं। इसी बाधा को प्रतिरोध कहते हैं!"
      } : {
        'doubt': "I'm currently operating in offline mode as the online AI brain is taking a quick break. 🌟 Let me give you a helpful NCERT summary:\n\n1. **Concept Summary**: Physics and Chemistry concepts are governed by universal conservation laws (like conservation of mass or energy).\n2. **CBSE Core Advice**: Always write down the given variables, formula, step-by-step substitution, and final S.I. unit to score full marks in descriptive board questions.\n\nWould you like me to quiz you on this instead?",
        'quiz': "Here is an offline review question for you:\n\n**Question**: What is the S.I. unit of electrical resistivity?\n- A) Ohm\n- B) Ohm-meter\n- C) Volt\n- D) Ampere\n\n*Think about it! (Hint: It is derived from R = ρL/A)*",
        'numerical': "Since we are offline, here is a standard numerical template:\n\n**Problem**: A resistor has resistance R. If its length is doubled and area is halved, what is the new resistance?\n- **Given**: Length L' = 2L, Area A' = A/2\n- **Formula**: R = ρL/A\n- **Calculation**: R' = ρ(2L)/(A/2) = 4 * (ρL/A) = 4R.\n- **Conclusion**: The new resistance is 4 times the original resistance.",
        'analogy': "Here is an offline analogy:\n\n**Concept: Electrical Resistance**\nImagine a crowded metro station corridor (the conductor). The commuters walking through are the electrons (current). The pillars, luggage, and opposite-direction travelers are the atoms/ions inside the conductor creating **resistance** by colliding with the commuters. If the corridor is longer, more collisions occur (higher resistance). If the corridor is wider, more space is available (lower resistance)!"
      };

      const fallbackText = fallbackResponses[studyMode] || (appLanguage === 'hi' ? "मैं वर्तमान में ऑफ़लाइन हूँ। कृपया कोई भी सामान्य प्रश्न पूछें!" : "I'm currently connected offline. Please ask any general syllabus question, and I'll do my best to help!");
      
      const assistantMsg: ChatMessage = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: `⚠️ [${appLanguage === 'hi' ? 'ऑफ़लाइन मोड' : 'Offline Mode'}] ${fallbackText}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMsg]);
      setApiError(t.ai_offline_mode);
    } finally {
      setIsTyping(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: appLanguage === 'hi' ? "चैट इतिहास साफ़ कर दिया गया है! हम आगे क्या सीखेंगे?" : "Chat cleared! What shall we learn next, Curious Mind?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setApiError(null);
  };

  // Concise recommendation prompts as requested
  const presetDoubts = [
    {
      label: t.ai_starter_photosynthesis_title,
      prompt: t.ai_starter_photosynthesis,
      mode: 'analogy'
    },
    {
      label: t.ai_starter_ohms_title,
      prompt: t.ai_starter_ohms,
      mode: 'numerical'
    },
    {
      label: t.ai_starter_balance_title,
      prompt: t.ai_starter_balance,
      mode: 'doubt'
    },
    {
      label: t.ai_starter_cell_title,
      prompt: t.ai_starter_cell,
      mode: 'analogy'
    }
  ];

  const formatMessageText = (text: string) => {
    // Split by triple backticks to identify code blocks
    const parts = text.split('```');
    return parts.map((part, index) => {
      // Every odd index is a code block
      const isCodeBlock = index % 2 === 1;
      if (isCodeBlock) {
        // Extract language and code
        const lines = part.split('\n');
        let language = 'science-code';
        let code = part;
        if (lines[0] && lines[0].trim().match(/^[a-zA-Z0-9_\-#+]+$/)) {
          language = lines[0].trim();
          code = lines.slice(1).join('\n');
        }
        
        return (
          <div key={index} className="my-3 rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 font-mono text-xs text-zinc-300 shadow-2xl">
            {/* Header tab */}
            <div className="flex items-center justify-between bg-zinc-900 px-4 py-2 border-b border-zinc-850 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
              <span className="flex items-center gap-1.5 text-orange-400">
                <span className="inline-block w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                {language || 'BHARAT EXAM CODE'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleDownloadNote(code.trim(), `${language}_cheat_sheet`);
                    playSound('click');
                  }}
                  className="hover:text-emerald-300 transition cursor-pointer text-[9px] bg-zinc-950/85 hover:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 active:scale-95 flex items-center gap-1"
                >
                  <Download className="w-2.5 h-2.5 text-emerald-400" />
                  Download Note
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(code.trim());
                    playSound('click');
                  }}
                  className="hover:text-white transition cursor-pointer text-[9px] bg-zinc-950/85 hover:bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800/80 hover:border-zinc-700 text-zinc-400 active:scale-95"
                >
                  Copy Code
                </button>
              </div>
            </div>
            <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-emerald-400 font-medium font-mono selection:bg-zinc-800 scrollbar-thin">
              <code>{code.trim()}</code>
            </pre>
          </div>
        );
      } else {
        // Render regular lines
        const lines = part.split('\n');
        return lines.map((line, lineIdx) => {
          if (!line.trim() && lineIdx > 0 && lineIdx < lines.length - 1) {
            return <div key={`${index}-${lineIdx}`} className="h-2"></div>;
          }
          
          const boldRegex = /\*\*(.*?)\*\*/g;
          const inlineParts = [];
          let lastIndex = 0;
          let match;
          
          while ((match = boldRegex.exec(line)) !== null) {
            if (match.index > lastIndex) {
              inlineParts.push(line.substring(lastIndex, match.index));
            }
            inlineParts.push(
              <strong key={match.index} className={`font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                {match[1]}
              </strong>
            );
            lastIndex = boldRegex.lastIndex;
          }
          
          if (lastIndex < line.length) {
            inlineParts.push(line.substring(lastIndex));
          }

          // Check for inline backticks like `formula`
          const inlineBacktickParts: React.ReactNode[] = [];
          const textToParse = inlineParts.length > 0 ? "" : line;
          
          // Parse inline backticks if no bold parsing happened on the line
          if (!inlineParts.length && textToParse.includes('`')) {
            const btParts = textToParse.split('`');
            btParts.forEach((btPart, btIdx) => {
              if (btIdx % 2 === 1) {
                inlineBacktickParts.push(
                  <code key={btIdx} className="bg-zinc-900 border border-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-400 font-bold mx-0.5">
                    {btPart}
                  </code>
                );
              } else {
                inlineBacktickParts.push(btPart);
              }
            });
          }

          const isListItem = line.trim().startsWith('•') || line.trim().startsWith('-');
          if (isListItem) {
            const cleanLine = line.replace(/^[•-]\s*/, '');
            // Let's also check inline backticks for list items
            const listItemContent = inlineParts.length > 0 ? inlineParts : (
              cleanLine.includes('`') ? cleanLine.split('`').map((btPart, btIdx) => (
                btIdx % 2 === 1 ? (
                  <code key={btIdx} className="bg-zinc-900 border border-zinc-800/80 px-1.5 py-0.5 rounded font-mono text-[10px] text-emerald-400 font-bold mx-0.5">
                    {btPart}
                  </code>
                ) : btPart
              )) : cleanLine
            );

            return (
              <div key={`${index}-${lineIdx}`} className={`flex items-start gap-2 pl-2 text-[12px] leading-relaxed py-0.5 ${isDarkMode ? 'text-zinc-300' : 'text-slate-800 font-medium'}`}>
                <span className={`${isDarkMode ? 'text-zinc-500' : 'text-slate-400'} mt-1 shrink-0`}>•</span>
                <span>{listItemContent}</span>
              </div>
            );
          }

          return (
            <p key={`${index}-${lineIdx}`} className={`text-[12px] leading-relaxed min-h-[1rem] ${isDarkMode ? 'text-zinc-300' : 'text-slate-850 font-medium'}`}>
              {inlineParts.length > 0 ? inlineParts : (inlineBacktickParts.length > 0 ? inlineBacktickParts : line)}
            </p>
          );
        });
      }
    });
  };

  const BharatRobotAvatar = ({ className = "w-16 h-16" }: { className?: string }) => (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      {/* Premium Glow Aura */}
      <div className="absolute -inset-3 rounded-full bg-[#14b8a6]/15 opacity-60 blur-[8px] animate-pulse"></div>
      <ThreeDElement type="robot_3d_assistant" className="w-full h-full relative z-10" />
    </div>
  );

  const renderContent = () => {
    const isInitialState = messages.length <= 1;

    if (isInitialState) {
      return (
        <div className={`flex-1 w-full h-full flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/95 backdrop-blur-md text-zinc-300' : 'bg-slate-50/95 backdrop-blur-md text-slate-800'} ${inline ? 'border border-zinc-900 rounded-3xl overflow-hidden' : 'border-x border-zinc-900/80 max-w-4xl mx-auto'} relative`}>
          
          {/* Header */}
          <div className="p-4 flex items-center justify-between shrink-0 border-b border-white/5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-zinc-500 flex items-center gap-1">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {appLanguage === 'hi' ? 'भारत एआई अध्ययन' : 'BHARAT AI • ONLINE'}
              </span>
            </div>
            {!inline && onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 border rounded-lg transition cursor-pointer flex items-center gap-1 text-xs px-3 font-semibold ${isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800'}`}
              >
                <X className="w-4 h-4" /> {appLanguage === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            )}
          </div>

          {/* Centered Main Minimalist Section (Image 1 reference) */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-8 max-w-xl mx-auto w-full">
            <div className="flex flex-col items-center space-y-4">
              <BharatRobotAvatar className="w-24 h-24 sm:w-28 sm:h-28" />
              <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight font-sans ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-snug`}>
                {appLanguage === 'hi' ? 'भारत AI से कुछ भी पूछें' : 'Ask Anything to Bharat AI'}
              </h2>
              <p className={`text-xs ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'} font-medium max-w-sm leading-relaxed`}>
                {appLanguage === 'hi' 
                  ? 'भौतिकी, रसायन विज्ञान या जीव विज्ञान का कोई भी प्रश्न पूछें और तत्काल समाधान प्राप्त करें।' 
                  : 'Get instant, high-quality answers and verified concepts for your CBSE syllabus.'}
              </p>
            </div>

            {/* Input Form Box (Clean capsules exactly as in Image 1) */}
            <form onSubmit={handleFormSubmit} className="w-full space-y-4">
              <div className={`relative flex items-center w-full rounded-2xl p-1 shadow-2xl transition-all ${
                isDarkMode 
                  ? 'bg-zinc-900/60 border border-zinc-800/80 focus-within:border-zinc-700/80 focus-within:ring-1 focus-within:ring-zinc-800' 
                  : 'bg-white border border-orange-100 focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-100'
              }`}>
                {/* Plus context button on left */}
                <button
                  type="button"
                  onClick={() => {
                    playSound('click');
                    setInputText(appLanguage === 'hi' ? "कोशिका और परमाणु में क्या अंतर है?" : "What is the difference between a cell and an atom?");
                  }}
                  className={`p-3.5 rounded-xl transition cursor-pointer flex items-center justify-center shrink-0 ${
                    isDarkMode ? 'hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'hover:bg-orange-50 text-orange-600'
                  }`}
                  title={appLanguage === 'hi' ? 'संदर्भित प्रश्न' : 'Add context sample'}
                >
                  <span className="text-lg font-bold font-mono">+</span>
                </button>

                <input
                  type="text"
                  disabled={isTyping}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    isListening ? (appLanguage === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') :
                    (appLanguage === 'hi' ? 'भारत AI से कुछ भी पूछें...' : 'Ask Anything to Bharat AI...')
                  }
                  className={`flex-1 bg-transparent py-3.5 px-2 text-xs outline-none ${
                    isDarkMode ? 'text-white placeholder-zinc-500' : 'text-slate-900 placeholder-slate-400'
                  }`}
                />

                {/* Right side microphones and voice waves */}
                <div className="flex items-center gap-1.5 pr-2">
                  {/* Waveform animation if listening */}
                  {isListening && (
                    <div className="flex items-center gap-0.5 px-2">
                      <span className="w-1 h-3 bg-red-500 rounded-full animate-bounce"></span>
                      <span className="w-1 h-5 bg-red-500 rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:0.3s]"></span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={startVoiceTyping}
                    className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-center ${
                      isListening
                        ? 'bg-red-950 border-red-900 text-red-400 animate-pulse'
                        : (isDarkMode ? 'bg-zinc-850 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white' : 'bg-slate-100 border-slate-200 hover:border-orange-400 text-slate-500')
                    }`}
                    title={appLanguage === 'hi' ? 'आवाज़ से टाइप करें' : 'Voice Typing'}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                    </svg>
                  </button>

                  <button
                    type="submit"
                    disabled={isTyping || !inputText.trim()}
                    className={`p-2.5 rounded-xl transition flex items-center justify-center cursor-pointer ${
                      inputText.trim() 
                        ? (isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-orange-600 text-white hover:bg-orange-700')
                        : 'opacity-30 pointer-events-none'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Footer branding */}
          <div className={`p-4 text-center text-[9px] font-mono ${isDarkMode ? 'text-zinc-600' : 'text-slate-400'} border-t border-white/5`}>
            {appLanguage === 'hi' ? '🇮🇳 भारत एआई: सुगम व उच्च स्तरीय सीबीएसई अध्ययन प्रणाली' : '🇮🇳 BHARAT AI • POWERED BY GOOGLE GEMINI 3.5'}
          </div>
        </div>
      );
    }

    // Standard dialougue feed when there are messages
    return (
      <div className={`flex-1 w-full h-full flex flex-col justify-between ${isDarkMode ? 'bg-zinc-950/95 backdrop-blur-md text-zinc-300' : 'bg-slate-50/95 backdrop-blur-md text-slate-800'} ${inline ? 'border border-zinc-900 rounded-3xl overflow-hidden' : 'border-x border-zinc-900/80 max-w-4xl mx-auto'} relative`}>
        {/* Header - exactly identical format as first look */}
        <div className="p-4 flex items-center justify-between shrink-0 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-zinc-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {appLanguage === 'hi' ? 'भारत एआई अध्ययन' : 'BHARAT AI • ONLINE'}
            </span>
            {currentChapterTitle && (
              <span className={`text-[10px] ${isDarkMode ? 'text-zinc-400' : 'text-slate-500'} font-medium truncate max-w-[150px] sm:max-w-[250px]`}>
                • {currentChapterTitle}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClearChat}
              title={t.ai_clear_history}
              className={`p-1.5 rounded-lg transition cursor-pointer ${isDarkMode ? 'hover:bg-zinc-800 text-zinc-500 hover:text-white' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            {!inline && onClose && (
              <button
                onClick={onClose}
                className={`p-1.5 border rounded-lg transition cursor-pointer flex items-center gap-1 text-xs px-3 font-semibold ${isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400 hover:text-white' : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800'}`}
              >
                <X className="w-4 h-4" /> {appLanguage === 'hi' ? 'बंद करें' : 'Close'}
              </button>
            )}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className={`px-4 py-2.5 ${isDarkMode ? 'bg-zinc-900/60 border-b border-zinc-900' : 'bg-slate-50/90 border-b border-orange-100/40'} flex items-center justify-between shrink-0 text-xs`}>
          <span className={`${isDarkMode ? 'text-zinc-500' : 'text-slate-500'} flex items-center gap-1 font-mono text-[10px] font-bold`}>
            <Sliders className="w-3.5 h-3.5" /> {t.ai_track}
          </span>
          <div className="max-w-[285px] sm:max-w-lg">
            <HorizontalScrollContainer>
              {(['doubt', 'numerical', 'analogy', 'quiz'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { playSound('click'); setStudyMode(mode); }}
                  className={`px-3 py-1 rounded text-[10px] font-bold capitalize transition cursor-pointer shrink-0 ${
                    studyMode === mode
                      ? (isDarkMode ? 'bg-white text-black font-extrabold' : 'bg-orange-600 text-white font-extrabold shadow-sm')
                      : (isDarkMode ? 'bg-zinc-950 text-zinc-400 border border-zinc-850 hover:bg-zinc-900' : 'bg-white text-slate-600 border border-orange-100/80 hover:bg-orange-50/40')
                  }`}
                >
                  {mode === 'doubt' ? t.ai_track_concept : mode === 'numerical' ? t.ai_track_numerical : mode === 'analogy' ? t.ai_track_analogy : t.ai_track_quiz}
                </button>
              ))}
            </HorizontalScrollContainer>
          </div>
        </div>

        {/* Messages Feed */}
        <div className={`flex-1 overflow-y-auto p-5 space-y-5 no-scrollbar ${isDarkMode ? 'bg-black/45' : 'bg-transparent'} min-h-[300px]`}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex items-start gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 p-0.5 ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-teal-50 border border-teal-150 text-teal-600'}`}>
                    <ThreeDElement type="robot_3d_assistant" className="w-full h-full" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4.5 space-y-2.5 shadow-md relative group ${
                  isUser 
                    ? (isDarkMode ? 'bg-zinc-800 border border-zinc-700/80 text-white rounded-tr-none' : 'bg-orange-600 text-white rounded-tr-none') 
                    : (isDarkMode ? 'bg-zinc-900/90 border border-zinc-850 text-zinc-300 rounded-tl-none' : 'bg-white border border-orange-100 text-slate-800 rounded-tl-none')
                }`}>
                  {formatMessageText(msg.text)}
                  <span className={`block text-[8px] ${isUser ? 'text-orange-200' : 'text-zinc-500'} font-mono text-right mt-1`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-start gap-3.5">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-1 p-0.5 animate-pulse ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-teal-50 border border-teal-150 text-teal-600'}`}>
                <ThreeDElement type="robot_3d_assistant" className="w-full h-full" />
              </div>
              <div className={`rounded-2xl rounded-tl-none px-5 py-3.5 flex items-center gap-1 shadow-md ${isDarkMode ? 'bg-zinc-900 border border-zinc-850' : 'bg-white border border-orange-100'}`}>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.2s] ${isDarkMode ? 'bg-white' : 'bg-orange-600'}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.4s] ${isDarkMode ? 'bg-white' : 'bg-orange-600'}`}></div>
                <div className={`w-1.5 h-1.5 rounded-full animate-bounce [animation-delay:0.6s] ${isDarkMode ? 'bg-white' : 'bg-orange-600'}`}></div>
              </div>
            </div>
          )}

          {apiError && (
            <div className={`p-4 rounded-2xl text-xs space-y-2 max-w-xl mx-auto ${isDarkMode ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-orange-200'}`}>
              <div className={`font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                <Info className="w-4 h-4 text-zinc-400" /> {appLanguage === 'hi' ? 'कनेक्शन संदेश' : 'Connection checkpoint'}
              </div>
              <p className={`leading-relaxed font-sans ${isDarkMode ? 'text-zinc-400' : 'text-slate-600'}`}>
                {apiError}
              </p>
              <div className={`text-[10px] font-mono ${isDarkMode ? 'text-zinc-500' : 'text-slate-450'}`}>
                {appLanguage === 'hi' 
                  ? "कृपया जांचें कि क्या आपने सेटिंग्स > सीक्रेट्स पैनल में अपनी जेमिनी एपीआई की (GEMINI_API_KEY) प्रदान की है।"
                  : "Please verify that you have provided your Gemini API Key in the Settings > Secrets panel in the UI."}
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input form - Always at bottom */}
        <form 
          onSubmit={handleFormSubmit}
          className={`p-4 ${isDarkMode ? 'bg-zinc-900 border-t border-zinc-850' : 'bg-slate-50 border-t border-orange-100/60'} flex items-center gap-3 shrink-0`}
        >
          <div className="relative flex-1 flex items-center">
            <input
              type="text"
              disabled={isTyping}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                isListening ? (appLanguage === 'hi' ? 'सुन रहा हूँ... बोलिए' : 'Listening... Speak now') :
                studyMode === 'doubt' ? t.ai_placeholder_doubt :
                studyMode === 'numerical' ? t.ai_placeholder_numerical :
                studyMode === 'quiz' ? t.ai_placeholder_quiz :
                t.ai_placeholder_analogy
              }
              className={`flex-1 rounded-xl py-3 pl-4 pr-12 text-xs outline-none transition-all ${
                isDarkMode 
                  ? 'bg-zinc-950 border border-zinc-850 text-white placeholder-zinc-600 focus:border-zinc-700' 
                  : 'bg-white border border-orange-200 text-slate-900 placeholder-slate-450 focus:border-orange-400 focus:ring-1 focus:ring-orange-200'
              } ${
                isListening ? 'border-red-500/80 ring-1 ring-red-900/50' : ''
              }`}
            />
            
            {/* Voice Typing microphone button inside the chat field */}
            <button
              type="button"
              onClick={startVoiceTyping}
              className={`absolute right-3 p-1.5 rounded-lg border transition cursor-pointer ${
                isListening
                  ? 'bg-red-950 border-red-900 text-red-400 animate-pulse'
                  : (isDarkMode ? 'bg-zinc-900 border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white' : 'bg-white border-orange-200 hover:border-orange-400 text-slate-400 hover:text-slate-700')
              }`}
              title={appLanguage === 'hi' ? 'आवाज़ से टाइप करें' : 'Voice Typing Keyboard'}
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>

          <button
            type="submit"
            disabled={isTyping || !inputText.trim()}
            className={`p-3 ${isDarkMode ? 'bg-white text-black hover:bg-zinc-200' : 'bg-orange-600 text-white hover:bg-orange-700'} disabled:opacity-40 transition rounded-xl flex items-center justify-center cursor-pointer shrink-0 animate-fadeIn`}
            id="btn-send-ai-chat"
          >
            <Send className={`w-4 h-4 ${isDarkMode ? 'text-black' : 'text-white'}`} />
          </button>
        </form>

        {/* DOWNLOAD ALERTS */}
        <AnimatePresence>
          {showDownloadAlert && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-20 left-4 right-4 z-50 bg-indigo-600 border border-indigo-500/80 text-white text-xs px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2"
            >
              <Check className="w-4 h-4 shrink-0 text-white" />
              <span className="font-sans font-bold">{showDownloadAlert}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TRICOLOR STORAGE PERMISSION PROMPT MODAL */}
        <AnimatePresence>
          {showStorageModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="max-w-md w-full bg-zinc-950 border border-zinc-900 rounded-3xl p-6 text-center relative overflow-hidden shadow-2xl"
              >
                {/* PREMIUM HEADER STRIPE */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4F9DFF] to-[#14b8a6]"></div>

                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-400">
                  <Download className="w-7 h-7" />
                </div>

                <h3 className="text-base font-extrabold text-white mb-2 uppercase tracking-wide">
                  {appLanguage === 'hi' ? 'भंडारण अनुमति आवश्यक' : 'Device Storage Access Permission'}
                </h3>

                <p className="text-xs text-zinc-400 mb-6 leading-relaxed font-sans">
                  {appLanguage === 'hi' 
                    ? 'अध्ययन सामग्री, रिवीजन नोट्स, सूत्र चीट-शीट्स और वर्कशीट पीडीएफ को सीधे अपने डिवाइस पर डाउनलोड और सेव करने के लिए कृपया Curious Bharat को भंडारण (Storage) अनुमति प्रदान करें।'
                    : 'To download and store CBSE study materials, revision notes, formula cheat-sheets, and practice PDF worksheets directly on your local device, please grant storage permission.'}
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => { playSound('click'); setShowStorageModal(false); }}
                    className="flex-1 py-2.5 rounded-xl border border-zinc-900 hover:bg-zinc-900 transition text-xs font-bold text-zinc-400 cursor-pointer"
                  >
                    {appLanguage === 'hi' ? 'रद्द करें' : 'Deny'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { playSound('click'); handleGrantPermission(); }}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black hover:bg-zinc-200 transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>{appLanguage === 'hi' ? 'अनुमति दें' : 'Grant Access'}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  if (inline) {
    return renderContent();
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed inset-0 z-50 bg-zinc-950 flex flex-col justify-between font-sans text-zinc-300 overflow-hidden"
          id="ai-assistant-container"
        >
          {renderContent()}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
