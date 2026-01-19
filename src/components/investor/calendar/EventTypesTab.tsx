import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useEventTypes,
  useCreateEventType,
  useUpdateEventType,
  useDeleteEventType,
  EventType,
} from "@/hooks/useCalendarBooking";
import { Plus, Edit2, Trash2, Copy, Loader2, Clock, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface EventTypesTabProps {
  userId: string;
}

const COLORS = [
  { value: "#3B82F6", label: "Blue" },
  { value: "#10B981", label: "Green" },
  { value: "#F59E0B", label: "Amber" },
  { value: "#EF4444", label: "Red" },
  { value: "#8B5CF6", label: "Purple" },
  { value: "#EC4899", label: "Pink" },
  { value: "#06B6D4", label: "Cyan" },
  { value: "#84CC16", label: "Lime" },
];

const DURATIONS = [15, 30, 45, 60, 90, 120];

const EventTypesTab = ({ userId }: EventTypesTabProps) => {
  const { data: eventTypes = [], isLoading } = useEventTypes(userId);
  const createEventType = useCreateEventType();
  const updateEventType = useUpdateEventType();
  const deleteEventType = useDeleteEventType();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventType | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration_minutes: 30,
    color: "#3B82F6",
    buffer_before_minutes: 0,
    buffer_after_minutes: 0,
    is_active: true,
  });

  const handleOpenCreate = () => {
    setEditingEvent(null);
    setFormData({
      name: "",
      description: "",
      duration_minutes: 30,
      color: "#3B82F6",
      buffer_before_minutes: 0,
      buffer_after_minutes: 0,
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (event: EventType) => {
    setEditingEvent(event);
    setFormData({
      name: event.name,
      description: event.description || "",
      duration_minutes: event.duration_minutes,
      color: event.color,
      buffer_before_minutes: event.buffer_before_minutes,
      buffer_after_minutes: event.buffer_after_minutes,
      is_active: event.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }

    if (editingEvent) {
      await updateEventType.mutateAsync({
        id: editingEvent.id,
        ...formData,
      });
    } else {
      await createEventType.mutateAsync({
        investor_id: userId,
        ...formData,
        max_bookings_per_day: null,
      });
    }
    setIsDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this event type?")) {
      await deleteEventType.mutateAsync(id);
    }
  };

  const handleCopyLink = (eventId: string) => {
    const link = `${window.location.origin}/book/${userId}/${eventId}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Booking link copied!" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-base font-medium">Event Types</h3>
          <p className="text-sm text-muted-foreground">
            Create different meeting types for startups to book
          </p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="h-4 w-4 mr-2" />
          New Event Type
        </Button>
      </div>

      {eventTypes.length === 0 ? (
        <Card className="p-8 text-center">
          <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h4 className="font-medium mb-2">No event types yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Create your first event type to let startups book meetings with you
          </p>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Event Type
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {eventTypes.map((event) => (
            <Card key={event.id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div
                    className="w-2 h-full rounded-full min-h-[60px]"
                    style={{ backgroundColor: event.color }}
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{event.name}</h4>
                      {!event.is_active && (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {event.duration_minutes} minutes
                    </p>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                    {(event.buffer_before_minutes > 0 || event.buffer_after_minutes > 0) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Buffer: {event.buffer_before_minutes}min before, {event.buffer_after_minutes}min after
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleCopyLink(event.id)}
                    title="Copy booking link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => window.open(`/book/${userId}/${event.id}`, "_blank")}
                    title="Preview booking page"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleOpenEdit(event)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingEvent ? "Edit Event Type" : "Create Event Type"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Intro Call"
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what this meeting is about..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Duration</Label>
                <Select
                  value={formData.duration_minutes.toString()}
                  onValueChange={(v) =>
                    setFormData({ ...formData, duration_minutes: parseInt(v) })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATIONS.map((d) => (
                      <SelectItem key={d} value={d.toString()}>
                        {d} minutes
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(v) => setFormData({ ...formData, color: v })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: formData.color }}
                        />
                        {COLORS.find((c) => c.value === formData.color)?.label}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: color.value }}
                          />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Buffer Before (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.buffer_before_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, buffer_before_minutes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Buffer After (min)</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.buffer_after_minutes}
                  onChange={(e) =>
                    setFormData({ ...formData, buffer_after_minutes: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_active: checked })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={createEventType.isPending || updateEventType.isPending}
            >
              {(createEventType.isPending || updateEventType.isPending) && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              {editingEvent ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventTypesTab;
