import { Timestamp } from "firebase/firestore";

export interface User {
  uid: string;
  role: "student" | "parent" | "admin";
  displayName: string;
  email: string;
  phone?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Student {
  userId: string;
  parentIds: string[];
  level: "S1" | "S2" | "S3" | "S4";
  school?: string;
  enrolledSubjects: string[];
  studyCode: string;
  subscriptionStatus: "trial" | "active" | "expired";
  trialStartDate: Timestamp;
  subscriptionExpiry: Timestamp;
  diagnosticCompleted: boolean;
  diagnosticScores: Record<string, number>;
  predictedGrades: Record<string, string>;
}

export interface Parent {
  userId: string;
  studentIds: string[];
  phone: string;
  whatsappOptIn: boolean;
  emailReportsOptIn: boolean;
}

export interface Subject {
  id: string;
  name: string;
  level: "S3" | "S4";
  description: string;
  totalTopics: number;
  isActive: boolean;
  accentColor: string;
}

export interface Topic {
  id: string;
  subjectId: string;
  title: string;
  description: string;
  order: number;
  totalLessons: number;
  estimatedHours: number;
  isActive: boolean;
}

export type LessonBlock =
  | { type: "text"; heading?: string; content: string }
  | { type: "key_point"; title: string; content: string }
  | { type: "worked_example"; problem: string; steps: string[]; answer: string }
  | { type: "question"; question: string; options: string[]; correctIndex: number; explanation: string }
  | { type: "image"; storageUrl: string; caption: string };

export interface Lesson {
  id: string;
  topicId: string;
  subjectId: string;
  title: string;
  order: number;
  estimatedMinutes: number;
  passingScore: number;
  blocks: LessonBlock[];
  isActive: boolean;
}

export interface PastPaperQuestion {
  id: string;
  subjectId: string;
  topicId: string;
  year: number;
  paper: number;
  questionRef: string;
  text: string;
  marks: number;
  type: "mcq" | "short_answer" | "structured" | "essay";
  options?: string[];
  markingScheme: string;
  modelAnswer: string;
  requiredKeywords: string[];
  isActive: boolean;
}

export interface TopicMarkingScheme {
  topicId: string;
  subjectId: string;
  generalGuidance: string;
  keyTerms: string[];
  commonMistakes: string[];
  gradingCriteria: string;
  version: number;
  updatedAt: Timestamp;
  updatedBy: string;
}

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
  score: number;
  attempts: number;
  completedAt?: Timestamp;
  timeSpentSeconds: number;
  answers: Array<{
    blockIndex: number;
    answer: string | number;
    correct: boolean;
    timeSeconds: number;
  }>;
}

export interface TopicProgress {
  topicId: string;
  masteryLevel: number;
  lessonsCompleted: number;
  totalLessons: number;
  lastStudiedAt: Timestamp;
  averageScore: number;
}

export interface SubjectProgress {
  subjectId: string;
  predictedGrade: string;
  topicsStarted: number;
  topicsCompleted: number;
  totalStudySeconds: number;
  weeklyStudySeconds: number;
  lastStudiedAt: Timestamp;
  guaranteeProgress: number;
}

export interface WeeklyReport {
  id: string;
  studentId: string;
  weekId: string;
  weekStart: Timestamp;
  weekEnd: Timestamp;
  totalStudyMinutes: number;
  lessonsCompleted: number;
  questionsAttempted: number;
  subjectBreakdown: Record<
    string,
    {
      studyMinutes: number;
      lessonsCompleted: number;
      predictedGrade: string;
      gradeChange: number;
    }
  >;
  weakAreas: string[];
  guaranteeProgress: number;
  generatedAt: Timestamp;
  deliveredEmail: boolean;
  deliveredWhatsapp: boolean;
}
