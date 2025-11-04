'use server';

import { suggestOptimalTime, type SmartScheduleInput } from '@/ai/flows/smart-schedule-suggestions';
import type { CalendarEvent } from './types';

export async function getSmartSuggestions(
  events: CalendarEvent[],
  duration: number,
  description: string
): Promise<{ startTime: string; endTime: string; reason: string; }[] | { error: string }> {
  try {
    const input: SmartScheduleInput = {
      schedule: JSON.stringify(events.map(e => ({
        title: e.title,
        start: e.start.toISOString(),
        end: e.end.toISOString(),
      }))),
      eventDuration: duration,
      eventDescription: description,
    };
    
    const result = await suggestOptimalTime(input);
    return result.suggestedTimes;
  } catch (error) {
    console.error('Error getting smart suggestions:', error);
    return { error: 'Failed to get smart suggestions. Please try again.' };
  }
}
