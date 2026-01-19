import { useState, useEffect, useRef, useCallback } from "react";
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, eachDayOfInterval, isSameDay, parseISO, addDays, setHours, setMinutes, addMinutes } from "date-fns";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar, Loader2, RefreshCw, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import CreateEventModal from "./CreateEventModal";
import EditEventModal from "./EditEventModal";

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
  htmlLink?: string;
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

interface DragState {
  isDragging: boolean;
  startDay: Date | null;
  startHour: number | null;
  startMinute: number;
  endHour: number | null;
  endMinute: number;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7am to 8pm
const SLOT_HEIGHT = 56; // Height of each hour cell in pixels

const WeeklyCalendarView = ({ userId }: WeeklyCalendarViewProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [calendars, setCalendars] = useState<LinkedCalendar[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create event state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createEventDate, setCreateEventDate] = useState<Date | undefined>();
  const [createEventHour, setCreateEventHour] = useState<number | undefined>();
  const [createEventDuration, setCreateEventDuration] = useState<number | undefined>();

  // Edit event state
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Drag state
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    startDay: null,
    startHour: null,
    startMinute: 0,
    endHour: null,
    endMinute: 0,
  });
  const gridRef = useRef<HTMLDivElement>(null);

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
    return (end.getTime() - start.getTime()) / (1000 * 60);
  };

  const getEventTopOffset = (event: CalendarEvent) => {
    const start = parseISO(event.start);
    return (start.getMinutes() / 60) * 100;
  };

  // Calculate minute from Y position within a cell
  const getMinuteFromY = (y: number, cellTop: number): number => {
    const relativeY = y - cellTop;
    const minutePercent = relativeY / SLOT_HEIGHT;
    const rawMinute = Math.round(minutePercent * 60);
    // Snap to 15-minute increments
    return Math.max(0, Math.min(45, Math.floor(rawMinute / 15) * 15));
  };

  const handleMouseDown = (e: React.MouseEvent, day: Date, hour: number) => {
    if (calendars.length === 0) {
      toast({
        title: "Connect a calendar first",
        description: "Go to Settings to connect your Google Calendar",
        variant: "destructive",
      });
      return;
    }

    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const minute = getMinuteFromY(e.clientY, rect.top);

    setDragState({
      isDragging: true,
      startDay: day,
      startHour: hour,
      startMinute: minute,
      endHour: hour,
      endMinute: minute + 15,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.startDay) return;

    const gridElement = gridRef.current;
    if (!gridElement) return;

    // Find which cell we're over
    const cells = gridElement.querySelectorAll('[data-hour]');
    for (const cell of cells) {
      const rect = (cell as HTMLElement).getBoundingClientRect();
      if (e.clientX >= rect.left && e.clientX <= rect.right && 
          e.clientY >= rect.top && e.clientY <= rect.bottom) {
        const hour = parseInt((cell as HTMLElement).dataset.hour || '0');
        const dayIndex = parseInt((cell as HTMLElement).dataset.dayIndex || '0');
        
        // Only allow dragging within the same day
        if (dayIndex === weekDays.findIndex(d => isSameDay(d, dragState.startDay!))) {
          const minute = getMinuteFromY(e.clientY, rect.top);
          
          // Calculate end time (minimum 15 minutes)
          const startTotalMinutes = dragState.startHour! * 60 + dragState.startMinute;
          const currentTotalMinutes = hour * 60 + minute;
          
          if (currentTotalMinutes >= startTotalMinutes) {
            setDragState(prev => ({
              ...prev,
              endHour: hour,
              endMinute: Math.min(60, minute + 15),
            }));
          }
        }
        break;
      }
    }
  }, [dragState.isDragging, dragState.startDay, dragState.startHour, dragState.startMinute, weekDays]);

  const handleMouseUp = useCallback(() => {
    if (dragState.isDragging && dragState.startDay && dragState.startHour !== null) {
      const startTotalMinutes = dragState.startHour * 60 + dragState.startMinute;
      const endTotalMinutes = (dragState.endHour || dragState.startHour) * 60 + dragState.endMinute;
      const duration = Math.max(15, endTotalMinutes - startTotalMinutes);

      setCreateEventDate(dragState.startDay);
      setCreateEventHour(dragState.startHour);
      setCreateEventDuration(duration);
      setShowCreateModal(true);
    }

    setDragState({
      isDragging: false,
      startDay: null,
      startHour: null,
      startMinute: 0,
      endHour: null,
      endMinute: 0,
    });
  }, [dragState]);

  // Global mouse event listeners for drag
  useEffect(() => {
    if (dragState.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  const handleCellClick = (day: Date, hour: number) => {
    // Only trigger if not dragging (handled by mouseup)
    if (dragState.isDragging) return;
    
    if (calendars.length === 0) {
      toast({
        title: "Connect a calendar first",
        description: "Go to Settings to connect your Google Calendar",
        variant: "destructive",
      });
      return;
    }
    setCreateEventDate(day);
    setCreateEventHour(hour);
    setCreateEventDuration(60);
    setShowCreateModal(true);
  };

  const handleCreateEvent = () => {
    if (calendars.length === 0) {
      toast({
        title: "Connect a calendar first",
        description: "Go to Settings to connect your Google Calendar",
        variant: "destructive",
      });
      return;
    }
    setCreateEventDate(new Date());
    setCreateEventHour(new Date().getHours() + 1);
    setCreateEventDuration(60);
    setShowCreateModal(true);
  };

  const handleEventCreated = () => {
    fetchEvents();
  };

  const handleEventClick = (e: React.MouseEvent, event: CalendarEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  // Calculate drag selection visual
  const getDragSelection = () => {
    if (!dragState.isDragging || !dragState.startDay || dragState.startHour === null) return null;

    const dayIndex = weekDays.findIndex(d => isSameDay(d, dragState.startDay!));
    const startTotalMinutes = dragState.startHour * 60 + dragState.startMinute;
    const endTotalMinutes = (dragState.endHour || dragState.startHour) * 60 + dragState.endMinute;
    const duration = Math.max(15, endTotalMinutes - startTotalMinutes);

    return { dayIndex, startHour: dragState.startHour, startMinute: dragState.startMinute, duration };
  };

  const dragSelection = getDragSelection();

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
            <>
              <Button onClick={handleCreateEvent} size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Event
              </Button>
              <div className="flex items-center gap-1.5 ml-2">
                {calendars.slice(0, 3).map((cal) => (
                  <Badge key={cal.id} variant="outline" className="text-xs" style={{ borderColor: cal.color }}>
                    <span className="w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: cal.color }} />
                    {cal.name}
                  </Badge>
                ))}
              </div>
            </>
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
        <div className="flex-1 overflow-auto select-none" ref={gridRef}>
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
                        onClick={(e) => handleEventClick(e, event)}
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
                {weekDays.map((day, dayIndex) => {
                  const hourEvents = getEventsForDayAndHour(day, hour);
                  const isDragSelectionCell = dragSelection && 
                    dragSelection.dayIndex === dayIndex && 
                    hour >= dragSelection.startHour && 
                    hour <= dragSelection.startHour + Math.floor((dragSelection.startMinute + dragSelection.duration) / 60);

                  return (
                    <div
                      key={day.toISOString()}
                      data-hour={hour}
                      data-day-index={dayIndex}
                      onMouseDown={(e) => handleMouseDown(e, day, hour)}
                      className={`relative h-14 border-l border-border/50 cursor-crosshair transition-colors ${
                        isSameDay(day, new Date()) ? "bg-primary/5" : ""
                      } ${dragState.isDragging ? "" : "hover:bg-muted/30"}`}
                    >
                      {/* Drag selection indicator */}
                      {isDragSelectionCell && dragSelection && hour === dragSelection.startHour && (
                        <div
                          className="absolute left-0.5 right-0.5 bg-primary/20 border-2 border-primary border-dashed rounded z-20 pointer-events-none"
                          style={{
                            top: `${(dragSelection.startMinute / 60) * 100}%`,
                            height: `${(dragSelection.duration / 60) * 100}%`,
                            minHeight: '20px',
                          }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs text-primary font-medium bg-background/80 px-1 rounded">
                              {dragSelection.duration} min
                            </span>
                          </div>
                        </div>
                      )}

                      {hourEvents.map((event) => {
                        const duration = getEventDuration(event);
                        const heightPercent = Math.min((duration / 60) * 100, 400);
                        const topOffset = getEventTopOffset(event);
                        return (
                          <div
                            key={event.id}
                            onClick={(e) => handleEventClick(e, event)}
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

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onEventCreated={handleEventCreated}
        userId={userId}
        calendars={calendars}
        initialDate={createEventDate}
        initialHour={createEventHour}
        initialDuration={createEventDuration}
      />

      {/* Edit Event Modal */}
      <EditEventModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedEvent(null);
        }}
        onEventUpdated={fetchEvents}
        onEventDeleted={fetchEvents}
        userId={userId}
        event={selectedEvent}
      />
    </div>
  );
};

export default WeeklyCalendarView;
