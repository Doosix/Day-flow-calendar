'use client';

import { useState } from 'react';
import type { CalendarEvent } from '@/lib/types';
import AppHeader from '@/components/app-header';
import CalendarView from '@/components/calendar-view';
import { EventSheet } from '@/components/event-sheet';
import { addDays, set } from 'date-fns';

const today = new Date();
const initialEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    start: set(today, { hours: 10, minutes: 0, seconds: 0, milliseconds: 0 }),
    end: set(today, { hours: 11, minutes: 0, seconds: 0, milliseconds: 0 }),
    description: 'Weekly sync-up call to discuss project progress.',
  },
  {
    id: '2',
    title: 'Dentist Appointment',
    start: set(addDays(today, 1), { hours: 14, minutes: 0, seconds: 0, milliseconds: 0 }),
    end: set(addDays(today, 1), { hours: 15, minutes: 0, seconds: 0, milliseconds: 0 }),
    description: 'Annual check-up.',
  },
  {
    id: '3',
    title: 'Lunch with Sarah',
    start: set(addDays(today, -2), { hours: 12, minutes: 30, seconds: 0, milliseconds: 0 }),
    end: set(addDays(today, -2), { hours: 13, minutes: 30, seconds: 0, milliseconds: 0 }),
    description: 'Catch up at the new Italian place.',
  },
];

export default function Home() {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { ...event, id: crypto.randomUUID() };
    setEvents([...events, newEvent]);
    setSheetOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    setEvents(events.map((e) => (e.id === updatedEvent.id ? updatedEvent : e)));
    setSheetOpen(false);
    setSelectedEvent(null);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter((e) => e.id !== eventId));
    setSheetOpen(false);
    setSelectedEvent(null);
  };

  const openNewEventSheet = (date: Date) => {
    setSelectedEvent(null);
    setSelectedDate(date);
    setSheetOpen(true);
  };

  const openEditEventSheet = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedDate(null);
    setSheetOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <AppHeader
        view={view}
        onViewChange={setView}
        currentDate={currentDate}
        onCurrentDateChange={setCurrentDate}
        onNewEventClick={() => openNewEventSheet(new Date())}
      />
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <CalendarView
          view={view}
          events={events}
          currentDate={currentDate}
          onDateClick={openNewEventSheet}
          onEventClick={openEditEventSheet}
        />
      </main>
      <EventSheet
        isOpen={isSheetOpen}
        onOpenChange={setSheetOpen}
        event={selectedEvent}
        selectedDate={selectedDate}
        onSave={selectedEvent ? handleUpdateEvent : handleAddEvent}
        onDelete={handleDeleteEvent}
        allEvents={events}
      />
    </div>
  );
}
