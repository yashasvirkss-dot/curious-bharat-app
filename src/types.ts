export interface Flashcard {
  id: string;
  front: string;
  back: string;
  category: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  examReference?: string;
  weightage?: string;
}

export interface ChapterSection {
  id: string;
  title: string;
  body: string;
  keyPoints?: string[];
  diagramType?: 'cell' | 'atom' | 'circuit' | 'reaction' | 'ray-diagram';
  hidden?: boolean; // Toggle visibility for student
}

export interface DPPFile {
  id: string;
  name: string;
  url: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  sections: ChapterSection[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  lectureUrl?: string; // YouTube embedded link
  pdfUrl?: string;     // Google Drive link
  dppUrl?: string;     // Daily Practice Problems link
  dppFiles?: DPPFile[]; // Multiple day-wise named PDFs
  hidden?: boolean;    // Toggle visibility for student
}

export interface Chapter {
  id: string;
  title: string;
  description: string;
  classLevel: string | number; // Support any custom class level
  subject: string;             // Support any custom subject
  readingTime: string;
  keyConcepts: string[];
  topics?: Topic[];            // Subfolders: nested list of topics inside Chapter
  sections?: ChapterSection[]; // Kept for backwards compatibility
  flashcards?: Flashcard[];    // Kept for backwards compatibility
  quiz?: QuizQuestion[];       // Kept for backwards compatibility
  // Customizable resource links
  lectureUrl?: string; // YouTube embedded link
  pdfUrl?: string;     // Google Drive link
  dppUrl?: string;     // Daily Practice Problems link
  dppFiles?: DPPFile[]; // Multiple day-wise named PDFs
  hidden?: boolean;    // Toggle visibility for student
}

export interface Course {
  id: string;
  title: string;
  description: string;
  isPaid: boolean;
  price: string;
  subject: string;             // Support any custom subject (SST, Math, English, etc.)
  chapters: Chapter[];
  upiId?: string;
  thumbnailUrl?: string; // Customizable course thumbnail
  specialAIFeature?: string; // AI generated special premium features for that batch
  hidden?: boolean;      // Toggle visibility for student
  aiInstructionStudyNotes?: string;
  aiInstructionMCQs?: string;
  aiInstructionConceptMindMap?: string;
  aiInstructionDpp?: string;
  aiInstructionPDFs?: string;
}

export interface AppCustomization {
  brandingTitle: string;
  brandingSubtitle: string;
  fontStyle: 'sans' | 'mono' | 'serif';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';
  cardBg: 'bg-slate-900' | 'bg-zinc-900' | 'bg-black' | 'bg-neutral-900';
  elementOrdering: string[]; // e.g., ["header", "courses", "dashboard", "features", "footer"]
  fontSize: 'small' | 'normal' | 'large';
  shapeStyle: 'sharp' | 'curved' | 'round';
  textHeadingStyle: 'normal' | 'uppercase' | 'tracking-wider';
  appLogoText?: string;       // Custom branding logo abbreviation, e.g., "CB"
  appLogoIcon?: 'graduation-cap' | 'atom' | 'brain' | 'sparkles' | 'lightbulb'; // Custom branding icon symbol
  appLogoUrl?: string;        // Custom uploaded branding logo image URL
}

export interface UserProgress {
  completedChapters: string[]; // List of chapter IDs completed
  quizScores: Record<string, { highscore: number; attempts: number }>; // chapterId -> quiz progress
  flashcardStatus: Record<string, 'easy' | 'medium' | 'hard' | 'unseen'>; // flashcardId -> confidence
  streak: number;
  lastActiveDate: string | null;
  totalXP: number;
  aiDoubtsAsked: number;
  purchasedCourses: string[]; // list of purchased course IDs
  studentName?: string;
  studentGrade?: string;
  studentSchool?: string;
  contactNumber?: string;
  profilePic?: string;
  referralCode?: string;
  referralWallet?: number;
  onboarded?: boolean;
  mentorPreference?: 'analytical' | 'visual' | 'both';
  storagePermissionGranted?: boolean;
  downloadedFiles?: Array<{ id: string; title: string; url: string; downloadedAt: string; sizeKb: number }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface StudentAnalysisRecord {
  id: string;
  studentName: string;
  contactDetails: string;
  courseId: string;
  courseTitle: string;
  price: string;
  paymentDetails: string; // UTR or Ref number
  purchasedAt: string;
  status?: 'pending' | 'approved' | 'denied';
  diagnosticScore?: number;
  syllabusChaptersRead?: number;
  quizSubmissionsSolved?: number;
}

export interface OwnerProfile {
  name: string;
  email: string;
  contact: string;
  storageDestination: 'local' | 'google-drive';
  googleStorageEmail: string;
  googleDriveFolderId?: string;
  upiId: string;
  allowDownloads: boolean;
  avatarUrl?: string;
  instituteName: string;
}



