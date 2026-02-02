// Feedback Questions Constants

export interface FeedbackQuestion {
  id: number;
  question: string;
  type: 'multiple-choice' | 'text' | 'multiple-choice-with-other';
  options?: string[];
}

export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
  {
    id: 1,
    question: 'What version of L2W are you playing?',
    type: 'multiple-choice',
    options: ['Web version', 'Android app'],
  },
  {
    id: 2,
    question: 'How often do you play block puzzle games?',
    type: 'multiple-choice',
    options: ['Never', 'Sometimes', 'A lot'],
  },
  {
    id: 3,
    question: 'What do you think of the game screen?',
    type: 'multiple-choice',
    options: ['Simple', 'Clean', 'Bland', 'Needs work'],
  },
  {
    id: 4,
    question: 'How do you find the game?',
    type: 'multiple-choice',
    options: ['Easy to follow', 'Confusing', 'Needs explaining'],
  },
  {
    id: 5,
    question: 'How difficult is it?',
    type: 'multiple-choice',
    options: ['Too hard', 'Too easy', 'Just right'],
  },
  {
    id: 6,
    question: 'How did you feel when you completed the level?',
    type: 'multiple-choice-with-other',
    options: ['Great', 'Neutral', 'Bored', 'Other'],
  },
  {
    id: 7,
    question: 'Is winning important to you?',
    type: 'multiple-choice-with-other',
    options: ['Yes', 'No', 'Other'],
  },
  {
    id: 8,
    question: 'Describe your experience playing L2W.',
    type: 'multiple-choice-with-other',
    options: ['Fun', 'Dull', 'Challenging', 'Other'],
  },
  {
    id: 9,
    question: 'What is one thing you liked about the game?',
    type: 'text',
  },
  {
    id: 10,
    question: 'What is one thing you would change?',
    type: 'text',
  },
];

export const STORAGE_KEY_ANSWERED_QUESTIONS = 'l2w_answered_questions';
