export interface VignetteAnnotation {
  term: string;
  insight: string;
}

export interface BoardQuestion {
  id: string;
  vignette: {
    presentation: string;
    physicalExam?: string;
    labs?: string;
  };
  phaseAnalyses: {
    presentation: string;
    physicalExam?: string;
    labs?: string;
  };
  vignetteAnnotations: VignetteAnnotation[];
  questionText: string;
  options: string[];
  optionRationales: string[]; // Rationale for every option, explaining why it's right or precisely why it's a distractor
  correctIndex: number;
  explanation: string;
  keyLearningPoint: string;
  yieldTag: 'Step 1 Foundational' | 'Step 2 CK High-Yield' | 'Board Classic' | 'Score Optimizer';
  managementFollowUp?: {
    questionText: string;
    options: string[];
    correctIndex: number;
    explanation: string;
    optionRationales: string[]; // Added rationales for follow-up distractors
  };
}

export interface LessonSection {
  title: string;
  content: string;
  highYieldBullets: string[];
}

export interface Equation {
  name: string;
  formula: string;
  variables: string[];
  clinicalUtility: string;
}

export interface MedicalLesson {
  title: string;
  category: string;
  overview: string;
  difficulty: 'Step 1' | 'Step 2 CK' | 'Comprehensive';
  sections: LessonSection[];
  questions: BoardQuestion[];
  pearls: string[]; 
  equations?: Equation[];
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  VIEWING_LESSON = 'VIEWING_LESSON',
}