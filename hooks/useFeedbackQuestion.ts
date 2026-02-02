import { FEEDBACK_QUESTIONS, FeedbackQuestion } from '@/constants/feedback';
import { useMemo } from 'react';
import { useAnsweredQuestions } from './useAnsweredQuestions';

/**
 * Hook to get a random unanswered feedback question
 */
export function useFeedbackQuestion() {
  const { hasAnsweredQuestion, isLoading } = useAnsweredQuestions();

  const getRandomUnansweredQuestion = useMemo(() => {
    return (): FeedbackQuestion | null => {
      if (isLoading) return null;

      const unansweredQuestions = FEEDBACK_QUESTIONS.filter(
        (q) => !hasAnsweredQuestion(q.id)
      );

      if (unansweredQuestions.length === 0) {
        // All questions answered
        return null;
      }

      // Return a random unanswered question
      const randomIndex = Math.floor(Math.random() * unansweredQuestions.length);
      return unansweredQuestions[randomIndex];
    };
  }, [hasAnsweredQuestion, isLoading]);

  return {
    getRandomUnansweredQuestion,
    isLoading,
  };
}
