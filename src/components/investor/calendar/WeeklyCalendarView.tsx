import { useState, useEffect } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, parseISO, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  calendarId: string;
  calendarName: string;
  color: string;
  allDay: boolean;
  location?: string;
  description?: string;
}

interface LinkedCalendar {
  id: string;
  calendarId: string;
  name: string;
  color: string;
  isPrimary: boolean;
  includeInAvailability: boolean;
}

interface WeeklyCalendarViewProps {
  userId: string;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm

const WeeklyCalendarView = ({ userId }: WeeklyCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<LinkedCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-calendar-events", {
        body: {
          investorId: userId,
          startDate: weekStart.toISOString(),
          endDate: addDays(weekEnd, 1).toISOString(),
        },
      });

      if (error) throw error;

      setEvents(data.events || []);
      setCalendars(data.calendars || []);
    } catch (err: any) {
      console.error("Error fetching calendar events:", err);
      if (err.message?.includes("Missing")) {
        // No calendars connected
        setEvents([]);
        setCalendars([]);
      } else {
        toast({
          title: "Failed to load calendar",
          description: err.message || "Could not fetch your calendar events",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [currentDate, userId]);

  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      if (event.allDay) return false;
      const eventStart = parseISO(event.start);
      const eventHour = eventStart.getHours();
      return isSameDay(eventStart, day) && eventHour === hour;
    });
  };

  const getAllDayEvents = (day: Date) => {
    return events.filter((event) => {
      if (!event.allDay) return false;
      const eventStart = parseISO(event.start);
      return isSameDay(eventStart, day);
    });
  };

  const getEventDuration = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    const end = parseISO(event.end);
    return (end.getTime() - start.getTime()) / (1000 * 60); // Duration in minutes
  };

  const getEventTopOffset = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    return (start.getMinutes() / 60) * 100;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
            Today
          </Button>
          <h2 className="text-lg font-semibold">
            {format(weekStart, "MMMM d")} – {format(weekEnd, "d, yyyy")}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {calendars.length > 0 && (
            <div className="flex items-center gap-1.5">
              {calendars.slice(0, 3).map((cal) => (
                <Badge key={cal.id} variant="outline" className="text-xs" style={{ borderColor: cal.color }}>
                  <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: cal.color }} />
                  {cal.name}
                </Badge>
              ))}
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={fetchEvents} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading && events.length === 0 ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : calendars.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-lg mb-2">No Calendar Connected</h3>
          <p className="text-muted-foreground max-w-md">
            Connect your Google Calendar in Settings to see your events here and sync your availability.
          </p>
        </div>
      ) : (
        <div className="flex-1 overflow-auto">
          <div className="min-w-[800px]">
            {/* Day Headers */}
            <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border sticky top-0 bg-background z-10">
              <div className="p-2 text-xs text-muted-foreground" />
              {weekDays.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`p-2 text-center border-l border-border ${
                    isSameDay(day, new Date()) ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                  <div
                    className={`text-lg font-semibold ${
                      isSameDay(day, new Date()) ? "text-primary" : ""
                    }`}
                  >
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>

            {/* All Day Events Row */}
            {weekDays.some((day) => getAllDayEvents(day).length > 0) && (
              <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
                <div className="p-2 text-xs text-muted-foreground">All day</div>
                {weekDays.map((day) => (
                  <div key={day.toISOString()} className="p-1 border-l border-border min-h-[40px]">
                    {getAllDayEvents(day).map((event) => (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        className="text-xs px-2 py-1 rounded cursor-pointer truncate hover:opacity-80"
                        style={{ backgroundColor: event.color + "20", color: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Hour Grid */}
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border/50">
                <div className="p-2 text-xs text-muted-foreground text-right pr-3">
                  {format(new Date().setHours(hour, 0), "h a")}
                </div>
                {weekDays.map((day) => {
                  const hourEvents = getEventsForDayAndHour(day, hour);
                  return (
                    <div
                      key={day.toISOString()}
                      className={`relative h-14 border-l border-border/50 ${
                        isSameDay(day, new Date()) ? "bg-primary/5" : ""
                      }`}
                    >
                      {hourEvents.map((event) => {
                        const duration = getEventDuration(event);
                        const heightPercent = Math.min((duration / 60) * 100, 400);
                        const topOffset = getEventTopOffset(event);
                        return (
                          <div
                            key={event.id}
                            onClick={() => setSelectedEvent(event)}
                            className="absolute left-0.5 right-0.5 rounded px-1.5 py-0.5 text-xs cursor-pointer hover:opacity-90 overflow-hidden z-10"
                            style={{
                              backgroundColor: event.color + "30",
                              borderLeft: `3px solid ${event.color}`,
                              top: `${topOffset}%`,
                              height: `${heightPercent}%`,
                              minHeight: "20px",
                            }}
                          >
                            <div className="font-medium truncate" style={{ color: event.color }}>
                              {event.title}
                            </div>
                            <div className="text-muted-foreground truncate">
                              {format(parseISO(event.start), "h:mm a")}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedEvent?.color }}
              />
              {selectedEvent?.title}
            </DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">When</p>
                <p>
                  {selectedEvent.allDay
                    ? format(parseISO(selectedEvent.start), "EEEE, MMMM d, yyyy")
                    : `${format(parseISO(selectedEvent.start), "EEEE, MMMM d, yyyy")} · ${format(
                        parseISO(selectedEvent.start),
                        "h:mm a"
                      )} – ${format(parseISO(selectedEvent.end), "h:mm a")}`}
                </p>
              </div>
              {selectedEvent.location && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Location</p>
                  <p>{selectedEvent.location}</p>
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-muted-foreground">Calendar</p>
                <Badge variant="outline" style={{ borderColor: selectedEvent.color }}>
                  <span
                    className="w-2 h-2 rounded-full mr-1.5"
                    style={{ backgroundColor: selectedEvent.color }}
                  />
                  {selectedEvent.calendarName}
                </Badge>
              </div>
              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Description</p>
                  <p className="text-sm whitespace-pre-wrap">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WeeklyCalendarView;