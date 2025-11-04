'use server';

/**
 * @fileOverview Provides smart schedule suggestions based on the user's existing calendar.
 *
 * - suggestOptimalTime - A function that suggests optimal times for new events.
 * - SmartScheduleInput - The input type for the suggestOptimalTime function, including the existing schedule and event details.
 * - SmartScheduleOutput - The return type for the suggestOptimalTime function, providing a list of suggested time slots.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SmartScheduleInputSchema = z.object({
  schedule: z.string().describe('The user existing schedule in JSON format.'),
  eventDuration: z.number().describe('The duration of the new event in minutes.'),
  eventDescription: z.string().describe('The description of the event to schedule.'),
});
export type SmartScheduleInput = z.infer<typeof SmartScheduleInputSchema>;

const SmartScheduleOutputSchema = z.object({
  suggestedTimes: z.array(
    z.object({
      startTime: z.string().describe('Suggested start time for the event (ISO format).'),
      endTime: z.string().describe('Suggested end time for the event (ISO format).'),
      reason: z.string().describe('Reason why this time slot is optimal.'),
    })
  ).describe('A list of suggested time slots for the new event.'),
});
export type SmartScheduleOutput = z.infer<typeof SmartScheduleOutputSchema>;

export async function suggestOptimalTime(input: SmartScheduleInput): Promise<SmartScheduleOutput> {
  return smartScheduleFlow(input);
}

const smartSchedulePrompt = ai.definePrompt({
  name: 'smartSchedulePrompt',
  input: {schema: SmartScheduleInputSchema},
  output: {schema: SmartScheduleOutputSchema},
  prompt: `You are a helpful AI assistant specialized in scheduling. Given a user's existing schedule and the details of a new event, suggest three optimal times for the new event.

Existing Schedule: {{{schedule}}}
Event Description: {{{eventDescription}}}
Event Duration: {{{eventDuration}}} minutes

Consider the existing schedule to avoid conflicts and provide suggestions with reasons why each time slot is optimal. Return the suggested times in JSON format.
`,
});

const smartScheduleFlow = ai.defineFlow(
  {
    name: 'smartScheduleFlow',
    inputSchema: SmartScheduleInputSchema,
    outputSchema: SmartScheduleOutputSchema,
  },
  async input => {
    const {output} = await smartSchedulePrompt(input);
    return output!;
  }
);
