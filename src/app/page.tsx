'use client';

import { useState } from 'react';
import type { CalendarEvent } from '@/lib/types';
import AppHeader from '@/components/app-header';
import CalendarView from '@/components/calendar-view';
import { EventSheet } from '@/components/event-sheet';
import { useFirebase, useUser } from '@/firebase';
import { doc, collection } from 'firebase/firestore';
import { useCollection, useMemoFirebase } from '@/firebase';
import { addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import AuthStatus from '@/components/auth-status';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const { firestore } = useFirebase();

  const eventsCollection = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return collection(firestore, 'users', user.uid, 'events');
  }, [user, firestore]);

  const { data: events, isLoading: areEventsLoading } = useCollection(eventsCollection);

  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isSheetOpen, setSheetOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    if (!eventsCollection) return;
    const newEvent = { ...event, userId: user!.uid };
    addDocumentNonBlocking(eventsCollection, newEvent);
    setSheetOpen(false);
  };

  const handleUpdateEvent = (updatedEvent: CalendarEvent) => {
    if (!eventsCollection) return;
    const eventRef = doc(eventsCollection, updatedEvent.id);
    const { id, ...eventData } = updatedEvent;
    setDocumentNonBlocking(eventRef, eventData, { merge: true });
    setSheetOpen(false);
    setSelectedEvent(null);
  };
  
  const handleDeleteEvent = (eventId: string) => {
    if (!eventsCollection) return;
    const eventRef = doc(eventsCollection, eventId);
    deleteDocumentNonBlocking(eventRef);
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

  if (isUserLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!user) {
    return (
       <div className="flex h-screen items-center justify-center bg-background">
        <div className="w-full max-w-md p-8 space-y-8">
          <div className="text-center">
             <h1 className="text-3xl font-bold text-foreground">
               Welcome to DayFlow Calendar
             </h1>
             <p className="mt-2 text-muted-foreground">
               Please sign in to manage your schedule.
             </p>
          </div>
          <AuthStatus />
        </div>
       </div>
    );
  }

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
          events={events || []}
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
        allEvents={events || []}
      />
    </div>
  );
}
