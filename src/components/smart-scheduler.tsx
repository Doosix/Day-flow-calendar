'use client';

import { useState, useTransition } from 'react';
import { Button } from './ui/button';
import { getSmartSuggestions } from '@/lib/actions';
import type { CalendarEvent } from '@/lib/types';
import { Wand2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { differenceInMinutes, format } from 'date-fns';

type Suggestion = {
  startTime: string;
  endTime: string;
  reason: string;
};

type SmartSchedulerProps = {
  allEvents: CalendarEvent[];
  eventTitle: string;
  eventStartDate?: Date;
  eventEndDate?: Date;
  onSuggestionSelect: (suggestion: { startTime: string; endTime: string }) => void;
};

export function SmartScheduler({ allEvents, eventTitle, eventStartDate, eventEndDate, onSuggestionSelect }: SmartSchedulerProps) {
  const [isPending, startTransition] = useTransition();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    if (!eventTitle) {
      toast({
        title: 'Title Required',
        description: 'Please enter an event title to get suggestions.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!eventStartDate || !eventEndDate) {
      toast({
        title: 'Dates Required',
        description: 'Please set a start and end date for the event to determine its duration.',
        variant: 'destructive',
      });
      return;
    }

    const duration = differenceInMinutes(eventEndDate, eventStartDate);

    if (duration <= 0) {
        toast({
            title: "Invalid Duration",
            description: "End time must be after start time.",
            variant: "destructive",
        });
        return;
    }

    startTransition(async () => {
      setSuggestions([]);
      const result = await getSmartSuggestions(allEvents, duration, eventTitle);

      if ('error' in result) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      } else {
        setSuggestions(result);
        if (result.length === 0) {
          toast({
              title: 'No Suggestions',
              description: 'AI could not find any optimal time slots. Try adjusting the duration.',
          });
        }
      }
    });
  };

  return (
    <div className="space-y-4 rounded-lg border p-4 bg-muted/20">
        <div className="flex items-center justify-between">
            <div>
                <h4 className="font-semibold">Smart Scheduler</h4>
                <p className="text-sm text-muted-foreground">Let AI find the best time for your event.</p>
            </div>
            <Button type="button" onClick={handleGetSuggestions} disabled={isPending}>
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Wand2 className="mr-2 h-4 w-4" />
                )}
                Suggest Times
            </Button>
        </div>
      
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {suggestions.map((suggestion, index) => (
            <Button
              key={index}
              type="button"
              variant="outline"
              className="h-auto flex-col items-start p-3 text-left bg-background"
              onClick={() => onSuggestionSelect(suggestion)}
            >
              <span className="font-semibold">
                {format(new Date(suggestion.startTime), 'p')} - {format(new Date(suggestion.endTime), 'p')}
              </span>
              <span className="text-xs text-muted-foreground font-normal">{suggestion.reason}</span>
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
