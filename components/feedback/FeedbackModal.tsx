import { FeedbackQuestion } from '@/constants/feedback';
import { GAME_COLORS } from '@/constants/game';
import { useResponsive } from '@/hooks/useResponsive';
import React, { useEffect, useState } from 'react';
import { Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import GameButton from '../game/GameButton';

interface FeedbackModalProps {
  visible: boolean;
  level: number;
  onClose: () => void;
  onSubmit: (questionId: number, answer: string) => Promise<void>;
  getRandomUnansweredQuestion: () => FeedbackQuestion | null;
}

export default function FeedbackModal({
  visible,
  level,
  onClose,
  onSubmit,
  getRandomUnansweredQuestion,
}: FeedbackModalProps) {
  const [currentQuestion, setCurrentQuestion] = useState<FeedbackQuestion | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState('');
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { letter, button } = useResponsive();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (visible) {
      const question = getRandomUnansweredQuestion();
      setCurrentQuestion(question);
      setSelectedOption(null);
      setTextAnswer('');
      setOtherText('');
      
      // If no question available, close modal immediately
      if (!question) {
        onClose();
      }
    }
  }, [visible, getRandomUnansweredQuestion, onClose]);

  const handleSubmit = async () => {
    if (!currentQuestion) {
      onClose();
      return;
    }

    let answer = '';

    if (currentQuestion.type === 'text') {
      answer = textAnswer.trim();
      if (!answer) {
        alert('Please provide an answer');
        return;
      }
    } else if (currentQuestion.type === 'multiple-choice') {
      if (!selectedOption) {
        alert('Please select an option');
        return;
      }
      answer = selectedOption;
    } else if (currentQuestion.type === 'multiple-choice-with-other') {
      if (!selectedOption) {
        alert('Please select an option');
        return;
      }
      if (selectedOption === 'Other') {
        if (!otherText.trim()) {
          alert('Please provide details for "Other"');
          return;
        }
        answer = `Other: ${otherText.trim()}`;
      } else {
        answer = selectedOption;
      }
    }

    setIsSubmitting(true);
    try {
      await onSubmit(currentQuestion.id, answer);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentQuestion) {
    return null;
  }

  const canSubmit = () => {
    if (currentQuestion.type === 'text') {
      return textAnswer.trim().length > 0;
    }
    if (currentQuestion.type === 'multiple-choice') {
      return selectedOption !== null;
    }
    if (currentQuestion.type === 'multiple-choice-with-other') {
      if (!selectedOption) return false;
      if (selectedOption === 'Other') {
        return otherText.trim().length > 0;
      }
      return true;
    }
    return false;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent={Platform.OS !== 'web'}
    >
      <View style={[styles.overlay, {
        marginTop: Platform.OS !== 'web' ? -insets.top : 0,
        marginBottom: Platform.OS !== 'web' ? -insets.bottom : 0,
        marginLeft: Platform.OS !== 'web' ? -insets.left : 0,
        marginRight: Platform.OS !== 'web' ? -insets.right : 0,
        paddingTop: Platform.OS !== 'web' ? insets.top + 20 : 20,
        paddingBottom: Platform.OS !== 'web' ? insets.bottom + 20 : 20,
        paddingLeft: Platform.OS !== 'web' ? insets.left + 20 : 20,
        paddingRight: Platform.OS !== 'web' ? insets.right + 20 : 20,
      }]}>
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { fontSize: letter * 0.7 }]}>Question</Text>
            <Text style={[styles.question, { fontSize: letter * 0.8 }]}>{currentQuestion.question}</Text>

            {currentQuestion.type === 'text' && (
              <TextInput
                style={[styles.textInput, { fontSize: letter * 0.5 }]}
                placeholder="Type your answer here..."
                placeholderTextColor="#888"
                value={textAnswer}
                onChangeText={setTextAnswer}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            )}

            {currentQuestion.type === 'multiple-choice' && (
              <View style={styles.optionsContainer}>
                {currentQuestion.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { fontSize: letter * 0.5},
                        selectedOption === option && styles.optionTextSelected,
                      ]}
                    >
                      {String.fromCharCode(97 + index)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {currentQuestion.type === 'multiple-choice-with-other' && (
              <View style={styles.optionsContainer}>
                {currentQuestion.options?.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.optionButton,
                      selectedOption === option && styles.optionButtonSelected,
                    ]}
                    onPress={() => setSelectedOption(option)}
                  >
                    <Text
                      style={[
                        styles.optionText,
                        { fontSize: letter * 0.5 },
                        selectedOption === option && styles.optionTextSelected,
                      ]}
                    >
                      {String.fromCharCode(97 + index)}. {option}
                    </Text>
                  </TouchableOpacity>
                ))}
                {selectedOption === 'Other' && (
                  <TextInput
                    style={[styles.textInput, styles.otherInput, { fontSize: letter * 0.5 }]}
                    placeholder="Please specify..."
                    placeholderTextColor="#888"
                    value={otherText}
                    onChangeText={setOtherText}
                    multiline
                  />
                )}
              </View>
            )}

            <View style={styles.buttonContainer}>
              <GameButton
                title="Submit"
                onPress={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
              />
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      web: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
      default: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      },
    }),
  },
  modalContainer: {
    backgroundColor: GAME_COLORS.background,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: GAME_COLORS.gridLine + '80',
    maxWidth: 500,
    width: '100%',
    maxHeight: '80%',
  },
  scrollContent: {
    padding: 20,
  },
  title: {
    color: GAME_COLORS.title,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    textTransform: 'uppercase',
  },
  question: {
    color: GAME_COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: GAME_COLORS.gridLine,
    borderRadius: 8,
    padding: 12,
    color: GAME_COLORS.text,
    minHeight: 100,
    marginBottom: 20,
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionButton: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: GAME_COLORS.gridLine,
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: GAME_COLORS.startButton,
    borderColor: GAME_COLORS.startButton,
  },
  optionText: {
    color: GAME_COLORS.text,
  },
  optionTextSelected: {
    color: GAME_COLORS.background,
    fontWeight: 'bold',
  },
  otherInput: {
    marginTop: 10,
    minHeight: 60,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 10,
  },
});


