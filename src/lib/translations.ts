export interface TranslationDict {
  // Navigation / Tabs
  home: string;
  batches: string;
  practice: string;
  bharat_ai: string;
  profile: string;
  educator_live_edit: string;
  admin_panel: string;

  // Header / Brand
  brand_title: string;
  brand_subtitle: string;

  // Dashboard / Batches View
  batches_title: string;
  member_program: string;
  free_batch: string;
  purchased: string;
  buy_now: string;
  open_batch: string;
  chapters_enrolled: string;
  search_placeholder: string;
  active_folder_topic: string;
  study_folder: string;
  master_chapters_title: string;
  modules_enrolled: string;
  back_to_batches: string;
  back_to_batch_chapters: string;
  course_directory: string;
  no_topics: string;
  no_chapters: string;

  // Filters
  filter_btn: string;
  filter_title: string;
  filter_class: string;
  filter_subject: string;
  filter_price: string;
  all: string;
  free: string;
  paid: string;
  apply_filter: string;

  // AI Assistant
  ai_title: string;
  ai_subtitle: string;
  ai_placeholder_doubt: string;
  ai_placeholder_numerical: string;
  ai_placeholder_quiz: string;
  ai_placeholder_analogy: string;
  ai_track: string;
  ai_track_concept: string;
  ai_track_numerical: string;
  ai_track_analogy: string;
  ai_track_quiz: string;
  popular_ai_prompts: string;
  ai_starter_photosynthesis: string;
  ai_starter_ohms: string;
  ai_starter_balance: string;
  ai_starter_cell: string;
  ai_starter_photosynthesis_title: string;
  ai_starter_ohms_title: string;
  ai_starter_balance_title: string;
  ai_starter_cell_title: string;
  ai_clear_history: string;
  ai_offline_mode: string;

  // Practice Tab
  practice_title: string;
  practice_subtitle: string;
  select_chapter: string;
  question_type: string;
  mcq_only: string;
  descriptive_only: string;
  numerical_only: string;
  mixed: string;
  question_count: string;
  generate_test_btn: string;
  generating_test: string;
  submit_answer_btn: string;
  evaluating: string;
  score_label: string;
  accuracy_label: string;
  concept_understanding: string;
  missing_keywords: string;
  strengths: string;
  suggestions: string;
  next_question: string;
  test_completed: string;

  // Profile
  profile_title: string;
  profile_subtitle: string;
  student_name: string;
  school_name: string;
  grade_level: string;
  save_profile_btn: string;
  edit_profile_btn: string;
  coins_balance: string;
  rank_title: string;
  clear_cache_btn: string;
  admin_portal_btn: string;
  sound_effects: string;
  data_saver: string;
  video_quality: string;
  app_language: string;

  // Lecture Player / Detail
  overview: string;
  discussion_board: string;
  my_notes: string;
  pdfs_homework: string;
  learning_objectives: string;
  instructor_label: string;
  duration_label: string;
  format_label: string;
  report_issue: string;
  save_note_btn: string;
  type_note_placeholder: string;
  download_notes_pdf: string;
  dpp_sheet: string;
  dynamic_progress: string;
  saved_bookmarks: string;
  bookmark_hint: string;
  completed_tasks: string;
}

export const translations: Record<'en' | 'hi', TranslationDict> = {
  en: {
    home: "Home",
    batches: "Batches",
    practice: "Practice",
    bharat_ai: "Bharat AI",
    profile: "Profile",
    educator_live_edit: "Educator Live-Edit",
    admin_panel: "Admin Panel",
    brand_title: "Bharat Gurukul",
    brand_subtitle: "NCERT Chapter-Wise Interactive Board Engine",
    batches_title: "Public & Paid Batches",
    member_program: "MEMBER PROGRAM",
    free_batch: "FREE BATCH",
    purchased: "Purchased",
    buy_now: "Buy Now",
    open_batch: "Open Batch",
    chapters_enrolled: "Chapters enrolled",
    search_placeholder: "Search among batches...",
    active_folder_topic: "Active Folder Topic",
    study_folder: "Study Folder",
    master_chapters_title: "Master Study Chapters & Topics",
    modules_enrolled: "Modules enrolled",
    back_to_batches: "Back to Batches",
    back_to_batch_chapters: "Back to Batch Chapters",
    course_directory: "BATCH DIRECTORY",
    no_topics: "No nested topics uploaded inside this chapter folder yet.",
    no_chapters: "No chapters enrolled under this batch track yet.",
    filter_btn: "Filter",
    filter_title: "Customize Batches",
    filter_class: "Class Level",
    filter_subject: "Subject / Topic",
    filter_price: "Price Mode",
    all: "All",
    free: "Free",
    paid: "Paid",
    apply_filter: "Apply Filters",
    ai_title: "Bharat AI Study Companion",
    ai_subtitle: "Ask dynamic NCERT questions, scientific formulas, equations, or receive tailored analogies.",
    ai_placeholder_doubt: "Type any concept doubt or science question...",
    ai_placeholder_numerical: "Paste a numerical question to solve step-by-step...",
    ai_placeholder_quiz: "Ask for an interactive test quiz with questions...",
    ai_placeholder_analogy: "Enter a scientific concept to explain using a simple analogy...",
    ai_track: "SELECT MENTORING TRACK:",
    ai_track_concept: "Concept Doubts",
    ai_track_numerical: "Solve Numerical",
    ai_track_analogy: "Analogies",
    ai_track_quiz: "Quiz Practice",
    popular_ai_prompts: "Popular AI Prompts",
    ai_starter_photosynthesis: "Explain Photosynthesis using a Cricket Match analogy!",
    ai_starter_ohms: "Give me a simple Class 10 circuit numerical question to solve step-by-step.",
    ai_starter_balance: "Can you teach me how to balance a chemical equation in 3 simple steps?",
    ai_starter_cell: "How is a eukaryotic cell like a busy metropolitan city?",
    ai_starter_photosynthesis_title: "🏏 Photosynthesis analogy",
    ai_starter_ohms_title: "🧮 Ohm's Law numerical",
    ai_starter_balance_title: "🧪 Balance equation task",
    ai_starter_cell_title: "🔬 Cell organelles roles",
    ai_clear_history: "Clear Chat History",
    ai_offline_mode: "Operating in Offline-first Mode (AI endpoint currently unavailable).",
    practice_title: "Self-Assessment Assessment Board",
    practice_subtitle: "Evaluate your structural CBSE writing, formula application, and conceptual depth.",
    select_chapter: "Select Practice Chapter Topic",
    question_type: "Select Target Question Type",
    mcq_only: "Multiple Choice Questions (MCQs)",
    descriptive_only: "NCERT Board Descriptive Questions",
    numerical_only: "Numerical & Formula Applications",
    mixed: "Mixed Comprehensive",
    question_count: "Number of Assessment Questions",
    generate_test_btn: "Generate Dynamic Practice Test",
    generating_test: "Generating Test Cards...",
    submit_answer_btn: "Submit Answer for Evaluation",
    evaluating: "Evaluating Answer...",
    score_label: "Conceptual Score",
    accuracy_label: "Evaluation Accuracy",
    concept_understanding: "Concept Understanding",
    missing_keywords: "Missing Board Keywords",
    strengths: "Key Answer Strengths",
    suggestions: "Improvement Suggestions",
    next_question: "Proceed to Next Card",
    test_completed: "Practice Test Completed! Great Effort!",
    profile_title: "Student Hub & Settings",
    profile_subtitle: "Manage your study statistics, app behavior, and profile options.",
    student_name: "Student Name",
    school_name: "School Name",
    grade_level: "Grade Level",
    save_profile_btn: "Save Profile",
    edit_profile_btn: "Edit Profile Info",
    coins_balance: "Total Gurukul Coins",
    rank_title: "Current Rank",
    clear_cache_btn: "Clear Local Cache",
    admin_portal_btn: "Educator Admin Portal",
    sound_effects: "Sound Effects",
    data_saver: "Data Saver Mode",
    video_quality: "Default Video Quality",
    app_language: "Application Language",
    overview: "Overview",
    discussion_board: "Discussion Board",
    my_notes: "My Notes",
    pdfs_homework: "PDFs & Homework",
    learning_objectives: "Learning Objectives",
    instructor_label: "Instructor",
    duration_label: "Duration",
    format_label: "Format",
    report_issue: "Report playback or translation mismatch issue",
    save_note_btn: "Save Note",
    type_note_placeholder: "Type a key takeaway, reminder, or formula...",
    download_notes_pdf: "Interactive Class Notes PDF",
    dpp_sheet: "Daily Practice Problem (DPP)",
    dynamic_progress: "Dynamic Progress",
    saved_bookmarks: "Saved Bookmarks",
    bookmark_hint: "Click the bookmark button in player controls to save any video timestamps.",
    completed_tasks: "Completed Tasks"
  },
  hi: {
    home: "मुख्य पृष्ठ",
    batches: "बैच",
    practice: "अभ्यास",
    bharat_ai: "भारत AI",
    profile: "प्रोफ़ाइल",
    educator_live_edit: "शिक्षक लाइव-एडिट",
    admin_panel: "एडमिन पैनल",
    brand_title: "भारत गुरुकुल",
    brand_subtitle: "NCERT अध्याय-वार इंटरैक्टिव बोर्ड इंजन",
    batches_title: "सार्वजनिक और सशुल्क बैच",
    member_program: "सदस्य कार्यक्रम",
    free_batch: "निःशुल्क बैच",
    purchased: "खरीदा गया",
    buy_now: "अभी खरीदें",
    open_batch: "बैच खोलें",
    chapters_enrolled: "अध्याय नामांकित",
    search_placeholder: "बैचों में खोजें...",
    active_folder_topic: "सक्रिय फ़ोल्डर विषय",
    study_folder: "अध्ययन फ़ोल्डर",
    master_chapters_title: "मास्टर अध्ययन अध्याय और विषय",
    modules_enrolled: "मॉड्यूल नामांकित",
    back_to_batches: "बैचों पर वापस जाएं",
    back_to_batch_chapters: "बैच अध्यायों पर वापस जाएं",
    course_directory: "बैच निर्देशिका",
    no_topics: "इस अध्याय फ़ोल्डर में अभी कोई विषय अपलोड नहीं किया गया है।",
    no_chapters: "इस बैच ट्रैक में अभी कोई अध्याय नामांकित नहीं है।",
    filter_btn: "फ़िल्टर",
    filter_title: "बैचों को अनुकूलित करें",
    filter_class: "कक्षा स्तर",
    filter_subject: "विषय / टॉपिक",
    filter_price: "मूल्य मोड",
    all: "सभी",
    free: "निःशुल्क",
    paid: "सशुल्क",
    apply_filter: "फ़िल्टर लागू करें",
    ai_title: "भारत AI अध्ययन साथी",
    ai_subtitle: "NCERT से संबंधित कोई भी सवाल, वैज्ञानिक सूत्र, समीकरण पूछें, या सरल उदाहरण पाएं।",
    ai_placeholder_doubt: "कोई भी सिद्धांत संदेह या विज्ञान का प्रश्न टाइप करें...",
    ai_placeholder_numerical: "हल करने के लिए चरण-दर-चरण न्यूमेरिकल प्रश्न पेस्ट करें...",
    ai_placeholder_quiz: "प्रश्नों के साथ एक इंटरैक्टिव परीक्षा क्विज़ मांगें...",
    ai_placeholder_analogy: "सरल उदाहरण का उपयोग करके समझाने के लिए एक वैज्ञानिक सिद्धांत दर्ज करें...",
    ai_track: "शिक्षण ट्रैक का चयन करें:",
    ai_track_concept: "सिद्धांत संदेह",
    ai_track_numerical: "न्यूमेरिकल हल करें",
    ai_track_analogy: "सरल उदाहरण (Analogy)",
    ai_track_quiz: "क्विज़ अभ्यास",
    popular_ai_prompts: "लोकप्रिय AI प्रॉम्प्ट",
    ai_starter_photosynthesis: "क्रिकेट मैच के उदाहरण का उपयोग करके प्रकाश संश्लेषण समझाएं!",
    ai_starter_ohms: "मुझे हल करने के लिए एक सरल कक्षा 10 सर्किट न्यूमेरिकल प्रश्न दें।",
    ai_starter_balance: "क्या आप मुझे 3 सरल चरणों में रासायनिक समीकरण को संतुलित करना सिखा सकते हैं?",
    ai_starter_cell: "एक यूकेरियोटिक कोशिका एक व्यस्त महानगर जैसी कैसे है?",
    ai_starter_photosynthesis_title: "🏏 प्रकाश संश्लेषण उदाहरण",
    ai_starter_ohms_title: "🧮 ओम का नियम न्यूमेरिकल",
    ai_starter_balance_title: "🧪 संतुलित समीकरण कार्य",
    ai_starter_cell_title: "🔬 कोशिका अंगक की भूमिकाएं",
    ai_clear_history: "चैट इतिहास साफ़ करें",
    ai_offline_mode: "ऑफ़लाइन मोड में काम कर रहा है (AI एंडपॉइंट वर्तमान में अनुपलब्ध है)।",
    practice_title: "स्व-मूल्यांकन बोर्ड",
    practice_subtitle: "अपने CBSE लेखन, सूत्र अनुप्रयोग और वैचारिक गहराई का मूल्यांकन करें।",
    select_chapter: "अभ्यास अध्याय विषय चुनें",
    question_type: "लक्षित प्रश्न प्रकार चुनें",
    mcq_only: "बहुविकल्पीय प्रश्न (MCQs)",
    descriptive_only: "NCERT बोर्ड वर्णनात्मक प्रश्न",
    numerical_only: "न्यूमेरिकल और सूत्र अनुप्रयोग",
    mixed: "मिश्रित व्यापक अभ्यास",
    question_count: "मूल्यांकन प्रश्नों की संख्या",
    generate_test_btn: "डायनेमिक अभ्यास टेस्ट उत्पन्न करें",
    generating_test: "टेस्ट कार्ड उत्पन्न किए जा रहे हैं...",
    submit_answer_btn: "मूल्यांकन के लिए उत्तर जमा करें",
    evaluating: "उत्तर का मूल्यांकन किया जा रहा है...",
    score_label: "वैचारिक स्कोर",
    accuracy_label: "मूल्यांकन सटीकता",
    concept_understanding: "सिद्धांत की समझ",
    missing_keywords: "लापता बोर्ड कीवर्ड",
    strengths: "उत्तर की मुख्य ताकत",
    suggestions: "सुधार के लिए सुझाव",
    next_question: "अगले कार्ड पर आगे बढ़ें",
    test_completed: "अभ्यास परीक्षण पूरा हुआ! बहुत बढ़िया प्रयास!",
    profile_title: "छात्र हब और सेटिंग्स",
    profile_subtitle: "अपने अध्ययन के आंकड़े, ऐप व्यवहार और प्रोफ़ाइल विकल्पों को प्रबंधित करें।",
    student_name: "छात्र का नाम",
    school_name: "स्कूल का नाम",
    grade_level: "कक्षा का स्तर",
    save_profile_btn: "प्रोफ़ाइल सहेजें",
    edit_profile_btn: "प्रोफ़ाइल संपादित करें",
    coins_balance: "कुल गुरुकुल सिक्के",
    rank_title: "वर्तमान रैंक",
    clear_cache_btn: "लोकल कैश साफ़ करें",
    admin_portal_btn: "शिक्षक एडमिन पैनल",
    sound_effects: "ध्वनि प्रभाव",
    data_saver: "डेटा सेवर मोड",
    video_quality: "डिफ़ॉल्ट वीडियो गुणवत्ता",
    app_language: "एप्लिकेशन भाषा",
    overview: "अवलोकन",
    discussion_board: "चर्चा बोर्ड",
    my_notes: "मेरे नोट्स",
    pdfs_homework: "PDFs और होमवर्क",
    learning_objectives: "सीखने के उद्देश्य",
    instructor_label: "शिक्षक / अनुदेशक",
    duration_label: "अवधि",
    format_label: "प्रारूप",
    report_issue: "प्लेबैक या अनुवाद बेमेल समस्या की रिपोर्ट करें",
    save_note_btn: "नोट सहेजें",
    type_note_placeholder: "एक मुख्य सीख, अनुस्मारक या सूत्र टाइप करें...",
    download_notes_pdf: "इंटरैक्टिव क्लास नोट्स PDF",
    dpp_sheet: "दैनिक अभ्यास समस्या (DPP)",
    dynamic_progress: "गतिशील प्रगति",
    saved_bookmarks: "सहेजे गए बुकमार्क",
    bookmark_hint: "वीडियो टाइमस्टैम्प सहेजने के लिए प्लेयर कंट्रोल में बुकमार्क बटन पर क्लिक करें।",
    completed_tasks: "पूरे किए गए कार्य"
  }
};
