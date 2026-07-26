export interface AnalyticsEvent {
  id: string;
  timestamp: string; // ISO string
  timestampMs: number;
  userId: string;
  userName: string;
  role: 'student' | 'educator' | 'admin';
  actionType:
    | 'quiz_attempt'
    | 'quiz_submission'
    | 'chapter_read'
    | 'time_spent'
    | 'batch_update'
    | 'question_modified'
    | 'feedback_given'
    | 'comment_posted'
    | 'course_enrolled'
    | 'payment_completed'
    | 'apk_download';
  details: Record<string, any>;
  syncedToFirebase?: boolean;
}

export interface RealAnalyticsSummary {
  totalSubmissions: number;
  totalAttempts: number;
  averageScorePercent: number;
  totalTimeSpentSeconds: number;
  totalTimeSpentMinutes: number;
  educatorBatchUpdates: number;
  educatorQuestionModifications: number;
  totalFeedbackLogged: number;
  totalCommentsLogged: number;
  uniqueActiveUsersCount: number;
  totalPaymentCompletedEvents: number;
  totalRealPaymentsRevenue: number;
  recentEvents: AnalyticsEvent[];
}

const STORAGE_KEY = 'curious_analytics_events';

export function getAnalyticsEvents(): AnalyticsEvent[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading analytics events:', err);
  }
  return [];
}

export function logAnalyticsEvent(
  eventData: Omit<AnalyticsEvent, 'id' | 'timestamp' | 'timestampMs'>
): AnalyticsEvent {
  const now = new Date();
  const event: AnalyticsEvent = {
    ...eventData,
    id: `evt-${Math.random().toString(36).substring(2, 11)}-${now.getTime()}`,
    timestamp: now.toISOString(),
    timestampMs: now.getTime(),
    syncedToFirebase: false
  };

  try {
    const existing = getAnalyticsEvents();
    const updated = [event, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch window event for live UI reactivity
    window.dispatchEvent(new CustomEvent('curious_analytics_event_logged', { detail: event }));
  } catch (err) {
    console.warn('Failed to persist analytics event:', err);
  }

  return event;
}

export function getRealAnalyticsSummary(): RealAnalyticsSummary {
  const events = getAnalyticsEvents();

  let totalSubmissions = 0;
  let totalAttempts = 0;
  let totalScorePercentageSum = 0;
  let totalTimeSpentSeconds = 0;
  let educatorBatchUpdates = 0;
  let educatorQuestionModifications = 0;
  let totalFeedbackLogged = 0;
  let totalCommentsLogged = 0;
  let totalPaymentCompletedEvents = 0;
  let totalRealPaymentsRevenue = 0;

  const uniqueUsers = new Set<string>();

  events.forEach((evt) => {
    if (evt.userId) {
      uniqueUsers.add(evt.userId);
    }

    switch (evt.actionType) {
      case 'quiz_attempt':
        totalAttempts += 1;
        break;
      case 'quiz_submission':
        totalSubmissions += 1;
        if (typeof evt.details?.percentage === 'number') {
          totalScorePercentageSum += evt.details.percentage;
        } else if (
          typeof evt.details?.score === 'number' &&
          typeof evt.details?.totalQuestions === 'number' &&
          evt.details.totalQuestions > 0
        ) {
          totalScorePercentageSum += Math.round((evt.details.score / evt.details.totalQuestions) * 100);
        }
        if (typeof evt.details?.timeSpentSeconds === 'number') {
          totalTimeSpentSeconds += evt.details.timeSpentSeconds;
        }
        break;
      case 'chapter_read':
      case 'time_spent':
        if (typeof evt.details?.timeSpentSeconds === 'number') {
          totalTimeSpentSeconds += evt.details.timeSpentSeconds;
        } else if (typeof evt.details?.durationSeconds === 'number') {
          totalTimeSpentSeconds += evt.details.durationSeconds;
        }
        break;
      case 'batch_update':
        educatorBatchUpdates += 1;
        break;
      case 'question_modified':
        educatorQuestionModifications += 1;
        break;
      case 'feedback_given':
        totalFeedbackLogged += 1;
        break;
      case 'comment_posted':
        totalCommentsLogged += 1;
        break;
      case 'payment_completed':
        totalPaymentCompletedEvents += 1;
        if (typeof evt.details?.amount === 'number') {
          totalRealPaymentsRevenue += evt.details.amount;
        } else if (typeof evt.details?.price === 'string') {
          const numericPrice = parseInt(evt.details.price.replace(/[^\d]/g, ''), 10);
          if (!isNaN(numericPrice)) {
            totalRealPaymentsRevenue += numericPrice;
          }
        }
        break;
    }
  });

  const averageScorePercent =
    totalSubmissions > 0 ? Math.round(totalScorePercentageSum / totalSubmissions) : 0;
  const totalTimeSpentMinutes = Math.round(totalTimeSpentSeconds / 60);

  return {
    totalSubmissions: totalSubmissions || 0,
    totalAttempts: totalAttempts || 0,
    averageScorePercent: averageScorePercent || 0,
    totalTimeSpentSeconds: totalTimeSpentSeconds || 0,
    totalTimeSpentMinutes: totalTimeSpentMinutes || 0,
    educatorBatchUpdates: educatorBatchUpdates || 0,
    educatorQuestionModifications: educatorQuestionModifications || 0,
    totalFeedbackLogged: totalFeedbackLogged || 0,
    totalCommentsLogged: totalCommentsLogged || 0,
    uniqueActiveUsersCount: uniqueUsers.size || 0,
    totalPaymentCompletedEvents: totalPaymentCompletedEvents || 0,
    totalRealPaymentsRevenue: totalRealPaymentsRevenue || 0,
    recentEvents: events.slice(0, 50)
  };
}
