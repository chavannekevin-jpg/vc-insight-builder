import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, Settings, ListChecks, Calendar } from "lucide-react";
import BookingsListTab from "./BookingsListTab";
import AvailabilityTab from "./AvailabilityTab";
import EventTypesTab from "./EventTypesTab";
import CalendarSettingsTab from "./CalendarSettingsTab";
import WeeklyCalendarView from "./WeeklyCalendarView";
import { useSearchParams } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface CalendarViewProps {
  userId: string;
}

const CalendarView = ({ userId }: CalendarViewProps) => {
  const [activeTab, setActiveTab] = useState("calendar");
  const [searchParams, setSearchParams] = useSearchParams();

  // Handle Google Calendar connection callbacks
  useEffect(() => {
    const calendarConnected = searchParams.get("calendar_connected");
    const calendarError = searchParams.get("calendar_error");

    if (calendarConnected === "true") {
      toast({ title: "Google Calendar connected successfully!" });
      setActiveTab("settings");
      // Clean up URL params
      searchParams.delete("calendar_connected");
      setSearchParams(searchParams, { replace: true });
    }

    if (calendarError) {
      const errorMessages: Record<string, string> = {
        oauth_denied: "You denied access to Google Calendar",
        missing_params: "Missing OAuth parameters",
        invalid_state: "Invalid OAuth state",
        token_exchange_failed: "Failed to exchange OAuth tokens",
        storage_failed: "Failed to store calendar tokens",
        unknown: "An unknown error occurred",
      };
      toast({
        title: "Calendar connection failed",
        description: errorMessages[calendarError] || calendarError,
        variant: "destructive",
      });
      searchParams.delete("calendar_error");
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b border-border/50 px-4">
          <TabsList className="bg-transparent h-auto p-0 space-x-6">
            <TabsTrigger
              value="calendar"
              className="pb-3 pt-2 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Calendar
            </TabsTrigger>
            <TabsTrigger
              value="bookings"
              className="pb-3 pt-2 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <ListChecks className="h-4 w-4 mr-2" />
              Bookings
            </TabsTrigger>
            <TabsTrigger
              value="availability"
              className="pb-3 pt-2 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Clock className="h-4 w-4 mr-2" />
              Availability
            </TabsTrigger>
            <TabsTrigger
              value="events"
              className="pb-3 pt-2 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <CalendarDays className="h-4 w-4 mr-2" />
              Event Types
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="pb-3 pt-2 px-0 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
            >
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-auto">
          <TabsContent value="calendar" className="m-0 h-full">
            <WeeklyCalendarView userId={userId} />
          </TabsContent>
          <TabsContent value="bookings" className="m-0 h-full">
            <BookingsListTab userId={userId} />
          </TabsContent>
          <TabsContent value="availability" className="m-0 h-full">
            <AvailabilityTab userId={userId} />
          </TabsContent>
          <TabsContent value="events" className="m-0 h-full">
            <EventTypesTab userId={userId} />
          </TabsContent>
          <TabsContent value="settings" className="m-0 h-full">
            <CalendarSettingsTab userId={userId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CalendarView;
