"use client";

import React, { useState } from "react";
import { CreateTripData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";

interface TripFormProps {
  initialData?: Partial<CreateTripData>;
  onSubmit: (data: CreateTripData) => Promise<void>;
  submitLabel?: string;
  title?: string;
}

export const TripForm: React.FC<TripFormProps> = ({
  initialData = {},
  onSubmit,
  submitLabel = "Create Trip",
  title = "Create New Trip",
}) => {
  const [formData, setFormData] = useState<CreateTripData>({
    user: initialData.user || 1, // You can make this dynamic if needed
    current_location: initialData.current_location || "",
    pickup_location: initialData.pickup_location || "",
    dropoff_location: initialData.dropoff_location || "",
    current_cycle_hours_used: initialData.current_cycle_hours_used || 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    field: keyof CreateTripData,
    value: string | number
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
            <Label htmlFor="current_location">Current Location</Label>
            <Input
              id="current_location"
              type="text"
              value={formData.current_location}
              onChange={(e) => handleChange("current_location", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup_location">Pickup Location</Label>
            <Input
              id="pickup_location"
              type="text"
              value={formData.pickup_location}
              onChange={(e) => handleChange("pickup_location", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dropoff_location">Dropoff Location</Label>
            <Input
              id="dropoff_location"
              type="text"
              value={formData.dropoff_location}
              onChange={(e) => handleChange("dropoff_location", e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current_cycle_used">Current Cycle Used (Hrs)</Label>
            <Input
              id="current_cycle_used"
              type="number"
              step="0.1"
              value={formData.current_cycle_hours_used}
              onChange={(e) =>
                handleChange(
                  "current_cycle_hours_used",
                  parseFloat(e.target.value)
                )
              }
              required
              disabled={loading}
            />
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
