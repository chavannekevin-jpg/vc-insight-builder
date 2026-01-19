import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAvailability, useSaveAvailability, Availability } from "@/hooks/useCalendarBooking";
import { Loader2, Save, Clock } from "lucide-react";

interface AvailabilityTabProps {
  userId: string;
}

const DAYS = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
];

const TIMEZONES = [
  { value: "UTC", label: "UTC" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

interface DaySchedule {
  enabled: boolean;
  startTime: string;
  endTime: string;
}

const AvailabilityTab = ({ userId }: AvailabilityTabProps) => {
  const { data: existingAvailability = [], isLoading } = useAvailability(userId);
  const saveAvailability = useSaveAvailability();
  
  const [timezone, setTimezone] = useState("UTC");
  const [schedule, setSchedule] = useState<Record<number, DaySchedule>>({
    0: { enabled: false, startTime: "09:00", endTime: "17:00" },
    1: { enabled: true, startTime: "09:00", endTime: "17:00" },
    2: { enabled: true, startTime: "09:00", endTime: "17:00" },
    3: { enabled: true, startTime: "09:00", endTime: "17:00" },
    4: { enabled: true, startTime: "09:00", endTime: "17:00" },
    5: { enabled: true, startTime: "09:00", endTime: "17:00" },
    6: { enabled: false, startTime: "09:00", endTime: "17:00" },
  });

  // Load existing availability
  useEffect(() => {
    if (existingAvailability.length > 0) {
      const newSchedule = { ...schedule };
      // Reset all days
      Object.keys(newSchedule).forEach((key) => {
        newSchedule[parseInt(key)].enabled = false;
      });
      
      existingAvailability.forEach((avail) => {
        newSchedule[avail.day_of_week] = {
          enabled: avail.is_active,
          startTime: avail.start_time.slice(0, 5),
          endTime: avail.end_time.slice(0, 5),
        };
        if (avail.timezone) {
          setTimezone(avail.timezone);
        }
      });
      setSchedule(newSchedule);
    }
  }, [existingAvailability]);

  const handleDayToggle = (day: number, enabled: boolean) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled },
    }));
  };

  const handleTimeChange = (day: number, field: "startTime" | "endTime", value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  const handleSave = async () => {
    const availabilityData: Omit<Availability, "id" | "investor_id">[] = [];
    
    Object.entries(schedule).forEach(([day, { enabled, startTime, endTime }]) => {
      if (enabled) {
        availabilityData.push({
          day_of_week: parseInt(day),
          start_time: startTime + ":00",
          end_time: endTime + ":00",
          timezone,
          is_active: true,
        });
      }
    });

    await saveAvailability.mutateAsync({
      investorId: userId,
      availability: availabilityData,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-2xl">
      <div className="space-y-6">
        {/* Timezone Selection */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <Label className="text-base font-medium">Timezone</Label>
          </div>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Card>

        {/* Weekly Schedule */}
        <Card className="p-4">
          <h3 className="text-base font-medium mb-4">Weekly Availability</h3>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div
                key={day.value}
                className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${
                  schedule[day.value].enabled ? "bg-muted/50" : ""
                }`}
              >
                <Switch
                  checked={schedule[day.value].enabled}
                  onCheckedChange={(checked) => handleDayToggle(day.value, checked)}
                />
                <span className="w-24 font-medium">{day.label}</span>
                
                {schedule[day.value].enabled ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={schedule[day.value].startTime}
                      onChange={(e) => handleTimeChange(day.value, "startTime", e.target.value)}
                      className="w-32"
                    />
                    <span className="text-muted-foreground">to</span>
                    <Input
                      type="time"
                      value={schedule[day.value].endTime}
                      onChange={(e) => handleTimeChange(day.value, "endTime", e.target.value)}
                      className="w-32"
                    />
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unavailable</span>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <Button onClick={handleSave} disabled={saveAvailability.isPending}>
          {saveAvailability.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Save Availability
        </Button>
      </div>
    </div>
  );
};

export default AvailabilityTab;
