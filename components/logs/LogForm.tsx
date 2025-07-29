// in /components/logs/LogForm.tsx

"use client";

import React, { useState } from "react";
import { CreateLogData, Trip } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LogFormProps {
  // Add a default value to prevent crash if trips is undefined
  trips?: Trip[];
  onSubmit: (data: CreateLogData) => Promise<void>;
  initialData?: Partial<CreateLogData>;
  submitLabel?: string;
  title?: string;
}

export const LogForm: React.FC<LogFormProps> = ({
  // Destructure with a default empty array
  trips = [],
  onSubmit,
  initialData = {},
  submitLabel = "Create Log",
  title = "Create New Log",
}) => {
  const [formData, setFormData] = useState({
    trip: initialData.trip?.toString() || "",
    date: initialData.date || new Date().toISOString().split("T")[0],
    off_duty_hours: initialData.off_duty_hours || 0,
    sleeper_berth_hours: initialData.sleeper_berth_hours || 0,
    driving_hours: initialData.driving_hours || 0,
    on_duty_not_driving_hours: initialData.on_duty_not_driving_hours || 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState<{ trip?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setFormErrors({});

    if (!formData.trip) {
      setFormErrors({ trip: "You must select a trip." });
      setLoading(false);
      return;
    }

    const totalHours =
      formData.off_duty_hours +
      formData.sleeper_berth_hours +
      formData.driving_hours +
      formData.on_duty_not_driving_hours;

    if (Math.abs(totalHours - 24) > 0.01) {
      setError("The sum of all hours must be exactly 24.");
      setLoading(false);
      return;
    }

    const payload: CreateLogData = {
      ...formData,
      trip: parseInt(formData.trip, 10),
    };

    try {
      await onSubmit(payload);
    } catch (err) {
      if (err instanceof Error) {
        try {
          const errorJson = JSON.parse(err.message);
          const messages = Object.entries(errorJson)
            .map(([key, value]) => `${key}: ${(value as string[]).join(", ")}`)
            .join(" | ");
          setError(messages || "An unexpected error occurred.");
        } catch {
          setError(err.message);
        }
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleTripChange = (tripId: string) => {
    setFormData((prev) => ({
      ...prev,
      trip: tripId,
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="trip">Trip</Label>
            <Select
              value={formData.trip}
              onValueChange={handleTripChange}
              disabled={loading || trips.length === 0}
            >
              <SelectTrigger id="trip">
                <SelectValue placeholder="Select a trip..." />
              </SelectTrigger>
              <SelectContent>
                {/* This map will now safely work on an empty array */}
                {trips.map((trip) => (
                  <SelectItem key={trip.id} value={trip.id.toString()}>
                    {`Trip to ${trip.dropoff_location} (ID: ${trip.id})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {formErrors.trip && (
              <p className="text-sm text-red-600 mt-1">{formErrors.trip}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="off_duty_hours">Off Duty Hours</Label>
              <Input
                id="off_duty_hours"
                name="off_duty_hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={formData.off_duty_hours}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sleeper_berth_hours">Sleeper Berth Hours</Label>
              <Input
                id="sleeper_berth_hours"
                name="sleeper_berth_hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={formData.sleeper_berth_hours}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="driving_hours">Driving Hours</Label>
              <Input
                id="driving_hours"
                name="driving_hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={formData.driving_hours}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="on_duty_not_driving_hours">
                On Duty (Not Driving) Hours
              </Label>
              <Input
                id="on_duty_not_driving_hours"
                name="on_duty_not_driving_hours"
                type="number"
                step="0.1"
                min="0"
                max="24"
                value={formData.on_duty_not_driving_hours}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {submitLabel}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
