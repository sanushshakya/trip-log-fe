"use client";

import React from "react";
import { Trip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";

interface TripCardProps {
  trip: Trip;
  onGeneratePlan: (id: number) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onGeneratePlan }) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {`Trip to ${trip.dropoff_location}`}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2" />
            <span>
              {trip.pickup_location} → {trip.dropoff_location}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 pt-2">
          <Button size="sm" onClick={() => onGeneratePlan(trip.id)}>
            Generate Map
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
