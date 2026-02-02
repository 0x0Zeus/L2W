import { STORAGE_KEY_ANSWERED_QUESTIONS } from "@/constants/feedback";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

export function useAnsweredQuestions() {
  const [answeredQuestionIds, setAnsweredQuestionIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAnsweredQuestions();
  }, []);

  const loadAnsweredQuestions = async () => {
    try {
      let stored: string | null = null;

      if (Platform.OS === 'web') {
        stored = localStorage.getItem(STORAGE_KEY_ANSWERED_QUESTIONS);
      } else {
        stored = await AsyncStorage.getItem(STORAGE_KEY_ANSWERED_QUESTIONS);
      }

      if (stored) {
        const ids = JSON.parse(stored) as number[];
        setAnsweredQuestionIds(new Set(ids));
      }
    } catch (error) {
      console.error('Error loading answered questions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  const markQuestionAsAnswered = async (questionId: number) => {
    try {
      const newSet = new Set(answeredQuestionIds);
      newSet.add(questionId);
      setAnsweredQuestionIds(newSet);

      const idsArray = Array.from(newSet);
      const stored = JSON.stringify(idsArray);

      if (Platform.OS === 'web') {
        localStorage.setItem(STORAGE_KEY_ANSWERED_QUESTIONS, stored);
      } else {
        await AsyncStorage.setItem(STORAGE_KEY_ANSWERED_QUESTIONS, stored);
      }
    } catch (error) {
      console.error('Error saving answered question:', error);
    }
  };

  const hasAnsweredQuestion = (questionId: number): boolean => {
    return answeredQuestionIds.has(questionId);
  };

  const getAllAnsweredQuestionIds = (): number[] => {
    return Array.from(answeredQuestionIds);
  };

  const resetAnsweredQuestions = async () => {
    try {
      setAnsweredQuestionIds(new Set());
      if (Platform.OS === 'web') {
        localStorage.removeItem(STORAGE_KEY_ANSWERED_QUESTIONS);
      } else {
        await AsyncStorage.removeItem(STORAGE_KEY_ANSWERED_QUESTIONS);
      }
    } catch (error) {
      console.error('Error resetting answered questions:', error);
    }
  };

  return {
    answeredQuestionIds,
    isLoading,
    hasAnsweredQuestion,
    markQuestionAsAnswered,
    getAllAnsweredQuestionIds,
    resetAnsweredQuestions,
  }
}

