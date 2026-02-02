const GOOGLE_SHEETS_WEB_APP_URL = process.env.EXPO_PUBLIC_GOOGLE_SHEETS_WEB_APP_URL || '';

export interface FeedbackSubmission {
  questionId: number;
  question: string;
  answer: string;
  level: number;
}

/**
 * Submit feedback answer to Google Sheets
 */
export async function submitFeedbackToGoogleSheets(
  submission: FeedbackSubmission
): Promise<boolean> {
  if (!GOOGLE_SHEETS_WEB_APP_URL) {
    console.warn('Google Sheets web app URL not configured. Feedback will not be submitted.');
    // In development, you might want to log the submission instead
    console.log('Feedback submission (not sent):', submission);
    return false;
  }

  try {
    const response = await fetch(GOOGLE_SHEETS_WEB_APP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(submission),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error submitting feedback to Google Sheets:', error);
    return false;
  }
}
