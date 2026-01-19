import { useState } from "react";
import { format, isPast, isFuture, isToday } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBookings, useCancelBooking, Booking } from "@/hooks/useCalendarBooking";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Calendar, Clock, User, Building2, Mail, X, Loader2 } from "lucide-react";

interface BookingsListTabProps {
  userId: string;
}

const BookingsListTab = ({ userId }: BookingsListTabProps) => {
  const { data: bookings = [], isLoading } = useBookings(userId);
  const cancelBooking = useCancelBooking();
  const [cancelingId, setCancelingId] = useState<string | null>(null);

  const upcomingBookings = bookings.filter(
    (b) => b.status !== "cancelled" && (isFuture(new Date(b.start_time)) || isToday(new Date(b.start_time)))
  );
  const pastBookings = bookings.filter(
    (b) => b.status !== "cancelled" && isPast(new Date(b.end_time)) && !isToday(new Date(b.start_time))
  );
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  const handleCancel = async () => {
    if (!cancelingId) return;
    await cancelBooking.mutateAsync({ id: cancelingId });
    setCancelingId(null);
  };

  const BookingCard = ({ booking }: { booking: Booking }) => {
    const eventType = booking.booking_event_types;
    const startDate = new Date(booking.start_time);
    const endDate = new Date(booking.end_time);
    const isCancelled = booking.status === "cancelled";
    const isPastBooking = isPast(endDate);

    return (
      <Card className={`p-4 ${isCancelled ? "opacity-60" : ""}`}>
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                style={{
                  borderColor: eventType?.color || "#3B82F6",
                  color: eventType?.color || "#3B82F6",
                }}
              >
                {eventType?.name || "Meeting"}
              </Badge>
              {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
              {isToday(startDate) && !isCancelled && (
                <Badge variant="default" className="bg-green-500">
                  Today
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{format(startDate, "EEEE, MMMM d, yyyy")}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {format(startDate, "h:mm a")} - {format(endDate, "h:mm a")}
              </span>
              <span className="text-muted-foreground">
                ({eventType?.duration_minutes || 30} min)
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{booking.booker_name}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${booking.booker_email}`} className="text-primary hover:underline">
                {booking.booker_email}
              </a>
            </div>

            {booking.booker_company && (
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>{booking.booker_company}</span>
              </div>
            )}

            {booking.notes && (
              <p className="text-sm text-muted-foreground mt-2 italic">
                "{booking.notes}"
              </p>
            )}

            {booking.cancellation_reason && (
              <p className="text-sm text-destructive mt-2">
                Cancellation reason: {booking.cancellation_reason}
              </p>
            )}
          </div>

          {!isCancelled && !isPastBooking && (
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={() => setCancelingId(booking.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </Card>
    );
  };

  const EmptyState = ({ message }: { message: string }) => (
    <div className="text-center py-12 text-muted-foreground">
      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
      <p>{message}</p>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4">
      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming ({upcomingBookings.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({pastBookings.length})
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled ({cancelledBookings.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4 space-y-4">
          {upcomingBookings.length === 0 ? (
            <EmptyState message="No upcoming bookings" />
          ) : (
            upcomingBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="mt-4 space-y-4">
          {pastBookings.length === 0 ? (
            <EmptyState message="No past bookings" />
          ) : (
            pastBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4 space-y-4">
          {cancelledBookings.length === 0 ? (
            <EmptyState message="No cancelled bookings" />
          ) : (
            cancelledBookings.map((booking) => (
              <BookingCard key={booking.id} booking={booking} />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={!!cancelingId} onOpenChange={() => setCancelingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              This will cancel the meeting and notify the attendee. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {cancelBooking.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Cancel Booking"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BookingsListTab;
