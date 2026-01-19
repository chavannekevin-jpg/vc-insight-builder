import { useState, useEffect } from "react";
import { format, addHours, setHours, setMinutes, parseISO } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, MapPin, Users, FileText, Loader2, X, Plus, Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface LinkedCalendar {
  id: string;
  calendarId: string;
  name: string;
  color: string;
}

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  userId: string;
  calendars: LinkedCalendar[];
  initialDate?: Date;
  initialHour?: number;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];
const DURATIONS = [
  { value: 15, label: "15 minutes" },
  { value: 30, label: "30 minutes" },
  { value: 45, label: "45 minutes" },
  { value: 60, label: "1 hour" },
  { value: 90, label: "1.5 hours" },
  { value: 120, label: "2 hours" },
  { value: 180, label: "3 hours" },
];

const CreateEventModal = ({
  isOpen,
  onClose,
  onEventCreated,
  userId,
  calendars,
  initialDate,
  initialHour,
}: CreateEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState(format(initialDate || new Date(), "yyyy-MM-dd"));
  const [startHour, setStartHour] = useState(initialHour ?? 9);
  const [startMinute, setStartMinute] = useState(0);
  const [duration, setDuration] = useState(60);
  const [selectedCalendar, setSelectedCalendar] = useState(calendars[0]?.calendarId || "primary");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendees, setAttendees] = useState<string[]>([]);
  const [reminder, setReminder] = useState(15);
  const [isCreating, setIsCreating] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDescription("");
      setLocation("");
      setDate(format(initialDate || new Date(), "yyyy-MM-dd"));
      setStartHour(initialHour ?? 9);
      setStartMinute(0);
      setDuration(60);
      setSelectedCalendar(calendars[0]?.calendarId || "primary");
      setAttendees([]);
      setAttendeeEmail("");
      setReminder(15);
    }
  }, [isOpen, initialDate, initialHour, calendars]);

  const handleAddAttendee = () => {
    const email = attendeeEmail.trim().toLowerCase();
    if (!email) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({ title: "Invalid email address", variant: "destructive" });
      return;
    }
    
    if (attendees.includes(email)) {
      toast({ title: "Email already added", variant: "destructive" });
      return;
    }
    
    setAttendees([...attendees, email]);
    setAttendeeEmail("");
  };

  const handleRemoveAttendee = (email: string) => {
    setAttendees(attendees.filter((a) => a !== email));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAttendee();
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      toast({ title: "Please enter an event title", variant: "destructive" });
      return;
    }

    setIsCreating(true);

    try {
      // Build start and end date times
      const startDate = parseISO(date);
      const start = setMinutes(setHours(startDate, startHour), startMinute);
      const end = addHours(start, duration / 60);

      const { data, error } = await supabase.functions.invoke("create-calendar-event", {
        body: {
          investorId: userId,
          calendarId: selectedCalendar,
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
          attendees: attendees.length > 0 ? attendees : undefined,
          reminders: [{ method: "popup", minutes: reminder }],
        },
      });

      if (error) throw error;

      toast({ 
        title: "Event created!",
        description: attendees.length > 0 
          ? `Invitations sent to ${attendees.length} attendee${attendees.length > 1 ? "s" : ""}`
          : undefined
      });
      
      onEventCreated();
      onClose();
    } catch (err: any) {
      console.error("Error creating event:", err);
      toast({
        title: "Failed to create event",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  const selectedCalendarData = calendars.find((c) => c.calendarId === selectedCalendar);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            New Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Title */}
          <div>
            <Input
              placeholder="Add title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-0 border-b rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary"
              autoFocus
            />
          </div>

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Date & Time</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-muted-foreground">Date</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Start Time</Label>
                <div className="flex gap-2 mt-1">
                  <Select value={String(startHour)} onValueChange={(v) => setStartHour(Number(v))}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {HOURS.map((h) => (
                        <SelectItem key={h} value={String(h)}>
                          {format(setHours(new Date(), h), "h a")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={String(startMinute)} onValueChange={(v) => setStartMinute(Number(v))}>
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MINUTES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          :{m.toString().padStart(2, "0")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duration</Label>
              <Select value={String(duration)} onValueChange={(v) => setDuration(Number(v))}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DURATIONS.map((d) => (
                    <SelectItem key={d.value} value={String(d.value)}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="text-sm font-medium">Location</span>
            </div>
            <Input
              placeholder="Add location or video call link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">Guests</span>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add guest email"
                type="email"
                value={attendeeEmail}
                onChange={(e) => setAttendeeEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                className="flex-1"
              />
              <Button variant="outline" size="icon" onClick={handleAddAttendee}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {attendees.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {attendees.map((email) => (
                  <Badge key={email} variant="secondary" className="gap-1 pr-1">
                    {email}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleRemoveAttendee(email)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}
            {attendees.length > 0 && (
              <p className="text-xs text-muted-foreground">
                Invitations will be sent when you create the event
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-medium">Description</span>
            </div>
            <Textarea
              placeholder="Add description or notes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Reminder */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bell className="h-4 w-4" />
              <span className="text-sm font-medium">Reminder</span>
            </div>
            <Select value={String(reminder)} onValueChange={(v) => setReminder(Number(v))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="10">10 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Calendar Selection */}
          {calendars.length > 1 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-muted-foreground">Add to calendar</Label>
              <Select value={selectedCalendar} onValueChange={setSelectedCalendar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {calendars.map((cal) => (
                    <SelectItem key={cal.id} value={cal.calendarId}>
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: cal.color }}
                        />
                        {cal.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Selected calendar indicator */}
          {selectedCalendarData && calendars.length <= 1 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: selectedCalendarData.color }}
              />
              Adding to {selectedCalendarData.name}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t mt-4">
          <Button variant="outline" onClick={onClose} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title.trim()}>
            {isCreating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Creating...
              </>
            ) : (
              "Create Event"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventModal;