import { useState, useEffect } from "react";
import { format, parseISO, differenceInMinutes, addMinutes, setHours, setMinutes } from "date-fns";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Clock, MapPin, FileText, Loader2, Trash2, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

interface EditEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventUpdated: () => void;
  onEventDeleted: () => void;
  userId: string;
  event: CalendarEvent | null;
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

const EditEventModal = ({
  isOpen,
  onClose,
  onEventUpdated,
  onEventDeleted,
  userId,
  event,
}: EditEventModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [startHour, setStartHour] = useState(9);
  const [startMinute, setStartMinute] = useState(0);
  const [duration, setDuration] = useState(60);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Populate form when event changes
  useEffect(() => {
    if (event && isOpen) {
      setTitle(event.title);
      setDescription(event.description || "");
      setLocation(event.location || "");
      
      const startDate = parseISO(event.start);
      const endDate = parseISO(event.end);
      
      setDate(format(startDate, "yyyy-MM-dd"));
      setStartHour(startDate.getHours());
      setStartMinute(startDate.getMinutes());
      
      const durationMins = differenceInMinutes(endDate, startDate);
      const closestDuration = DURATIONS.reduce((prev, curr) =>
        Math.abs(curr.value - durationMins) < Math.abs(prev.value - durationMins) ? curr : prev
      );
      setDuration(closestDuration.value);
    }
  }, [event, isOpen]);

  const handleUpdate = async () => {
    if (!event || !title.trim()) {
      toast({ title: "Please enter an event title", variant: "destructive" });
      return;
    }

    setIsUpdating(true);

    try {
      const startDate = parseISO(date);
      const start = setMinutes(setHours(startDate, startHour), startMinute);
      const end = addMinutes(start, duration);

      const { error } = await supabase.functions.invoke("update-calendar-event", {
        body: {
          investorId: userId,
          calendarId: event.calendarId,
          eventId: event.id,
          title: title.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          startDateTime: start.toISOString(),
          endDateTime: end.toISOString(),
        },
      });

      if (error) throw error;

      toast({ title: "Event updated!" });
      onEventUpdated();
      onClose();
    } catch (err: any) {
      console.error("Error updating event:", err);
      toast({
        title: "Failed to update event",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!event) return;

    setIsDeleting(true);

    try {
      const { error } = await supabase.functions.invoke("delete-calendar-event", {
        body: {
          investorId: userId,
          calendarId: event.calendarId,
          eventId: event.id,
        },
      });

      if (error) throw error;

      toast({ title: "Event deleted" });
      onEventDeleted();
      onClose();
    } catch (err: any) {
      console.error("Error deleting event:", err);
      toast({
        title: "Failed to delete event",
        description: err.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: event.color }}
            />
            Edit Event
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Title */}
          <div>
            <Input
              placeholder="Event title"
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

          {/* Calendar info */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" style={{ borderColor: event.color }}>
              <span
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: event.color }}
              />
              {event.calendarName}
            </Badge>
            {event.htmlLink && (
              <a
                href={event.htmlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <ExternalLink className="h-3 w-3" />
                Open in Google Calendar
              </a>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-3 pt-4 border-t mt-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm" disabled={isDeleting || isUpdating}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this event?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete "{event.title}" from your calendar. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Event"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="flex gap-3">
            <Button variant="outline" onClick={onClose} disabled={isUpdating}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating || !title.trim()}>
              {isUpdating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditEventModal;
