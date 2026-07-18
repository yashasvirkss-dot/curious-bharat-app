import { Course } from '../types';
import { chaptersData } from './chapters';

export const defaultCourses: Course[] = [
  {
    id: 'course-free-9',
    title: 'Class 9 Fundamental Foundations',
    description: 'Master the core building blocks of Class 9 Science. Dive deep into Cell Organelles and Atomic Configurations.',
    isPaid: false,
    price: '0',
    subject: 'General Science',
    chapters: [
      {
        ...chaptersData[0], // Cell
        lectureUrl: 'https://www.youtube.com/embed/URUJD5NEXC8', // Sample educational cell video
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_CELL_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_CELL_DPP/view'
      },
      {
        ...chaptersData[1], // Atoms
        lectureUrl: 'https://www.youtube.com/embed/FM_S-nS90u0', // Sample atom video
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_ATOM_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_ATOM_DPP/view'
      }
    ]
  },
  {
    id: 'course-free-physics',
    title: 'Rio Physics Masterclass',
    description: 'A completely free physics program for Class 10 students. Master Ohm\'s Law, resistance networks, and circuit calculations.',
    isPaid: false,
    price: '0',
    subject: 'Physics',
    chapters: [
      {
        ...chaptersData[3], // Electricity
        lectureUrl: 'https://www.youtube.com/embed/U7_P_Y56Zgw', // Electricity lesson
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_ELEC_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_ELEC_DPP/view'
      }
    ]
  },
  {
    id: 'course-paid-chemistry',
    title: 'Advanced Stoichiometry & Chemical Equations (Pro)',
    description: 'Learn balancing equations, displacement reactions, and redox chemistry from high-tier educators.',
    isPaid: true,
    price: '₹499',
    subject: 'Chemistry',
    upiId: 'rst010186@paytm',
    chapters: [
      {
        ...chaptersData[2], // Chemical Reactions
        lectureUrl: 'https://www.youtube.com/embed/e_C_Z_O5_rM', // Chemical Reactions lesson
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_CHEM_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_CHEM_PDF/view'
      }
    ]
  },
  {
    id: 'course-free-11',
    title: 'Class 11 Academic Acceleration Core',
    description: 'Establish high-tier mastery over key Class 11 curriculums. Master high-dimensional vectors and orbital hybridization.',
    isPaid: false,
    price: '0',
    subject: 'Physics',
    chapters: [
      {
        ...chaptersData[4], // Kinematics
        lectureUrl: 'https://www.youtube.com/embed/P6pS7ZpE734',
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_KIN_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_KIN_DPP/view'
      },
      {
        ...chaptersData[5], // Chemical Bonding
        lectureUrl: 'https://www.youtube.com/embed/YmPf8Nn_6W0',
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_BOND_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_BOND_DPP/view'
      }
    ]
  },
  {
    id: 'course-paid-12',
    title: 'Class 12 Boards & Advanced Competitive Prep',
    description: 'Unlock elite preparation for class 12 Boards, IIT-JEE, and NEET. Study electrostatic dipoles and central dogma genetics.',
    isPaid: true,
    price: '₹599',
    subject: 'Biology',
    upiId: 'rst010186@paytm',
    chapters: [
      {
        ...chaptersData[6], // Electrostatics
        lectureUrl: 'https://www.youtube.com/embed/8t_v7bWf-Yw',
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_ELST_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_ELST_DPP/view'
      },
      {
        ...chaptersData[7], // Molecular Inheritance
        lectureUrl: 'https://www.youtube.com/embed/91N-LqE51_M',
        pdfUrl: 'https://drive.google.com/file/d/1SAMPLE_MOL_PDF/view',
        dppUrl: 'https://drive.google.com/file/d/1SAMPLE_MOL_DPP/view'
      }
    ]
  }
];

export const defaultCustomization = {
  brandingTitle: 'Curious Bharat',
  brandingSubtitle: 'Premium EdTech Portal',
  fontStyle: 'sans' as const,
  borderRadius: 'xl' as const,
  cardBg: 'bg-slate-900' as const,
  elementOrdering: ['header', 'search-grades', 'stats', 'courses', 'games', 'dashboard', 'footer'],
  fontSize: 'normal' as const,
  shapeStyle: 'curved' as const,
  textHeadingStyle: 'normal' as const,
  appLogoText: 'CB',
  appLogoIcon: 'graduation-cap' as const
};
