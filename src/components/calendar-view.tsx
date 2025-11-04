'use client';

import {
  eachDayOfInterval,
  endOfMonth,
  startOfMonth,
  format,
  isSameMonth,
  isToday,
  isSameDay,
  startOfWeek,
  endOfWeek,
  getHours,
  getMinutes,
  toDate,
} from 'date-fns';
import type { CalendarEvent } from '@/lib/types';
import { cn } from '@/lib/utils';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// Helper to convert Firestore Timestamp to Date if needed
const ensureDate = (date: any): Date => {
  if (date && typeof date.toDate === 'function') {
    return date.toDate();
  }
  return toDate(date);
};


type CalendarViewProps = {
  view: 'month' | 'week' | 'day';
  events: CalendarEvent[];
  currentDate: Date;
  onDateClick: (date: Date) => void;
  onEventClick: (event: CalendarEvent) => void;
};

export default function CalendarView({ view, ...props }: CalendarViewProps) {
  const safeEvents = props.events.map(event => ({
    ...event,
    start: ensureDate(event.start),
    end: ensureDate(event.end)
  }));
  
  const viewProps = { ...props, events: safeEvents };

  return (
    <div key={view} className="animate-in fade-in duration-300">
      {view === 'month' && <MonthView {...viewProps} />}
      {view === 'week' && <WeekView {...viewProps} />}
      {view === 'day' && <DayView {...viewProps} />}
    </div>
  );
}

type ViewProps = Omit<CalendarViewProps, 'view'>;

const MonthView = ({ currentDate, events, onDateClick, onEventClick }: ViewProps) => {
  const firstDay = startOfMonth(currentDate);
  const lastDay = endOfMonth(currentDate);
  const startDay = startOfWeek(firstDay);
  const endDay = endOfWeek(lastDay);
  const calendarDays = eachDayOfInterval({ start: startDay, end: endDay });

  return (
    <div className="grid grid-cols-7 border-l border-t rounded-lg overflow-hidden bg-card shadow-md">
      {DAYS_OF_WEEK.map((day) => (
        <div key={day} className="p-2 border-r border-b text-center font-bold text-sm text-muted-foreground bg-card">
          {day}
        </div>
      ))}
      {calendarDays.map((day) => {
        const isCurrentMonth = isSameMonth(day, currentDate);
        const eventsForDay = events.filter((e) => isSameDay(e.start, day));
        return (
          <div
            key={day.toString()}
            className={cn('h-24 md:h-36 border-r border-b p-1 md:p-2 flex flex-col cursor-pointer transition-colors relative', {
              'bg-card': isCurrentMonth,
              'bg-muted/30 text-muted-foreground': !isCurrentMonth,
              'hover:bg-accent/20': isCurrentMonth,
            })}
            onClick={() => onDateClick(day)}
            role="gridcell"
            aria-label={`Date ${format(day, 'd')}`}
          >
            <span
              className={cn('text-xs md:text-sm font-medium self-end', {
                'text-white bg-primary rounded-full flex items-center justify-center h-6 w-6': isToday(day),
                'text-foreground': !isToday(day),
              })}
            >
              {format(day, 'd')}
            </span>
            <div className="flex-1 overflow-y-auto no-scrollbar mt-1 space-y-1">
              {eventsForDay.slice(0, 2).map((event) => (
                <div
                  key={event.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                  className="bg-accent/80 text-accent-foreground p-1 rounded text-xs truncate hover:bg-accent"
                >
                  {event.title}
                </div>
              ))}
              {eventsForDay.length > 2 && (
                <div className="text-xs text-muted-foreground">
                  + {eventsForDay.length - 2} more
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const WeekView = ({ currentDate, events, onDateClick, onEventClick }: ViewProps) => {
  const weekStart = startOfWeek(currentDate);
  const weekEnd = endOfWeek(currentDate);
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex border-t bg-card rounded-lg shadow-md overflow-hidden">
      <div className="w-16 border-r pt-14"> {/* Spacer for header */}
        {hours.map((hour) => (
          <div key={hour} className="h-16 text-xs text-center border-b p-1 text-muted-foreground relative -top-3">
            {format(new Date(0, 0, 0, hour), 'ha')}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 flex-1">
        {daysInWeek.map((day) => {
          const eventsForDay = events.filter((e) => isSameDay(e.start, day));
          return (
            <div key={day.toString()} className="relative border-r">
              <div className="text-center p-2 border-b font-medium bg-card sticky top-0 z-10 h-14">
                <p className="text-sm text-muted-foreground">{format(day, 'EEE')}</p>
                <p className={cn('text-xl', { 'text-white bg-primary rounded-full flex items-center justify-center h-7 w-7 mx-auto': isToday(day) })}>{format(day, 'd')}</p>
              </div>
              <div className="relative h-full" onClick={() => onDateClick(day)}>
                {hours.map((hour) => (
                  <div key={hour} className="h-16 border-b" />
                ))}
                {eventsForDay.map((event) => {
                  const startHour = getHours(event.start) + getMinutes(event.start) / 60;
                  const endHour = getHours(event.end) + getMinutes(event.end) / 60;
                  const duration = Math.max(0.5, endHour - startHour);
                  return (
                    <div
                      key={event.id}
                      className="absolute w-full px-1"
                      style={{
                        top: `${startHour * 4}rem`, // 4rem = 64px = h-16
                        height: `${duration * 4}rem`,
                      }}
                    >
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className="bg-primary/80 text-primary-foreground p-1 rounded h-full overflow-hidden text-xs shadow-md cursor-pointer hover:bg-primary"
                      >
                        <p className="font-bold">{event.title}</p>
                        <p>{`${format(event.start, 'p')} - ${format(event.end, 'p')}`}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DayView = ({ currentDate, events, onEventClick }: Pick<ViewProps, 'currentDate' | 'events' | 'onEventClick'>) => {
  const eventsForDay = events.filter((e) => isSameDay(e.start, currentDate)).sort((a,b) => a.start.getTime() - b.start.getTime());

  if (eventsForDay.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground bg-card rounded-lg shadow-md h-full flex flex-col justify-center items-center">
        <h3 className="text-xl font-semibold text-foreground">All Clear!</h3>
        <p>No events scheduled for today.</p>
        <p>Enjoy your free day!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {eventsForDay.map((event) => (
        <div
          key={event.id}
          onClick={() => onEventClick(event)}
          className="flex gap-4 p-4 bg-card rounded-lg shadow-sm cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-primary"
        >
          <div className="flex flex-col items-center justify-center text-primary font-medium w-24 text-center">
            <span className='text-sm'>{format(event.start, 'p')}</span>
            <div className="w-px h-4 bg-border my-1"></div>
            <span className='text-sm'>{format(event.end, 'p')}</span>
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground">{event.title}</h3>
            {event.description && <p className="text-muted-foreground mt-1">{event.description}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};
