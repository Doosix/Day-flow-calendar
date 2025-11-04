'use client';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Trash2 } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './ui/form';
import { useEffect } from 'react';
import { SmartScheduler } from './smart-scheduler';

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  startDate: z.date({ required_error: 'Start date is required' }),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  endDate: z.date({ required_error: 'End date is required' }),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:mm)'),
  description: z.string().optional(),
}).refine(data => {
    const start = new Date(data.startDate);
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    start.setHours(startHour, startMinute);

    const end = new Date(data.endDate);
    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    end.setHours(endHour, endMinute);

    return end > start;
}, {
    message: "End time must be after start time",
    path: ["endTime"],
});

type EventFormValues = z.infer<typeof eventSchema>;

type EventSheetProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  event: CalendarEvent | null;
  selectedDate: Date | null;
  onSave: (data: any) => void;
  onDelete: (id: string) => void;
  allEvents: CalendarEvent[];
};

export function EventSheet({
  isOpen,
  onOpenChange,
  event,
  selectedDate,
  onSave,
  onDelete,
  allEvents
}: EventSheetProps) {
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
  });

  useEffect(() => {
    if (isOpen) {
        if (event) {
          form.reset({
            title: event.title,
            startDate: event.start,
            startTime: format(event.start, 'HH:mm'),
            endDate: event.end,
            endTime: format(event.end, 'HH:mm'),
            description: event.description || '',
          });
        } else {
          const initialDate = selectedDate || new Date();
          const endDate = new Date(initialDate.getTime() + 60 * 60 * 1000);
          form.reset({
            title: '',
            startDate: initialDate,
            startTime: format(initialDate, 'HH:mm'),
            endDate: endDate, // 1 hour later
            endTime: format(endDate, 'HH:mm'),
            description: '',
          });
        }
    }
  }, [event, selectedDate, isOpen, form]);

  const onSubmit = (data: EventFormValues) => {
    const [startHour, startMinute] = data.startTime.split(':').map(Number);
    const start = new Date(data.startDate);
    start.setHours(startHour, startMinute, 0, 0);

    const [endHour, endMinute] = data.endTime.split(':').map(Number);
    const end = new Date(data.endDate);
    end.setHours(endHour, endMinute, 0, 0);
    
    onSave({ id: event?.id, title: data.title, start, end, description: data.description });
    form.reset();
  };

  const handleSuggestionSelect = (suggestion: { startTime: string, endTime: string }) => {
    const start = new Date(suggestion.startTime);
    const end = new Date(suggestion.endTime);
    form.setValue('startDate', start, { shouldValidate: true });
    form.setValue('startTime', format(start, 'HH:mm'), { shouldValidate: true });
    form.setValue('endDate', end, { shouldValidate: true });
    form.setValue('endTime', format(end, 'HH:mm'), { shouldValidate: true });
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md w-full overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{event ? 'Edit Event' : 'Add Event'}</SheetTitle>
          <SheetDescription>
            {event ? 'Update the details of your event.' : 'Create a new event for your calendar.'}
          </SheetDescription>
        </SheetHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Coffee with Jane" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={'outline'}
                            className={cn(
                              'w-full pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                          >
                            {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add a description or notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <SmartScheduler 
              allEvents={allEvents}
              eventTitle={form.watch('title')}
              eventStartDate={form.watch('startDate')}
              eventEndDate={form.watch('endDate')}
              onSuggestionSelect={handleSuggestionSelect}
            />

            <SheetFooter className="pt-6 sm:justify-between">
              {event && (
                <Button variant="destructive" type="button" onClick={() => onDelete(event.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button type="submit" className="sm:ml-auto">
                Save Changes
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
