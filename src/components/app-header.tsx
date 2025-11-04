'use client';

import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { format, add, sub } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type AppHeaderProps = {
  view: 'month' | 'week' | 'day';
  onViewChange: (view: 'month' | 'week' | 'day') => void;
  currentDate: Date;
  onCurrentDateChange: (date: Date) => void;
  onNewEventClick: () => void;
};

export default function AppHeader({
  view,
  onViewChange,
  currentDate,
  onCurrentDateChange,
  onNewEventClick,
}: AppHeaderProps) {
  const handleToday = () => {
    onCurrentDateChange(new Date());
  };

  const handlePrev = () => {
    const newDate =
      view === 'month'
        ? sub(currentDate, { months: 1 })
        : view === 'week'
        ? sub(currentDate, { weeks: 1 })
        : sub(currentDate, { days: 1 });
    onCurrentDateChange(newDate);
  };

  const handleNext = () => {
    const newDate =
      view === 'month'
        ? add(currentDate, { months: 1 })
        : view === 'week'
        ? add(currentDate, { weeks: 1 })
        : add(currentDate, { days: 1 });
    onCurrentDateChange(newDate);
  };

  return (
    <header className="flex items-center flex-wrap justify-between gap-y-2 p-4 border-b bg-card shadow-sm">
      <div className="flex items-center gap-4">
        <CalendarIcon className="h-8 w-8 text-primary" />
        <h1 className="text-xl md:text-2xl font-bold text-foreground font-headline">
          DayFlow Calendar
        </h1>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="outline" onClick={handleToday}>
          Today
        </Button>
        <div className="flex items-center rounded-md border">
          <Button variant="ghost" size="icon" onClick={handlePrev} aria-label="Previous period">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm md:text-base font-medium w-32 md:w-48 text-center" aria-live="polite">
            {format(currentDate, view === 'month' ? 'MMMM yyyy' : 'MMMM d, yyyy')}
          </span>
          <Button variant="ghost" size="icon" onClick={handleNext} aria-label="Next period">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-4">
        <Select value={view} onValueChange={(v) => onViewChange(v as any)}>
          <SelectTrigger className="w-[100px] md:w-[120px]">
            <SelectValue placeholder="View" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="month">Month</SelectItem>
            <SelectItem value="week">Week</SelectItem>
            <SelectItem value="day">Day</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={onNewEventClick}>New Event</Button>
      </div>
    </header>
  );
}
