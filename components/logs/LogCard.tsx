"use client";

import React from "react";
import { DailyLog, Trip } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { LogModal } from "./LogModal";

interface LogCardProps {
  log: DailyLog;
}

export const LogCard: React.FC<LogCardProps> = ({ log }) => {
  const trip = log.trip;
  return (
    <Card className="hover:shadow-md transition-shadow flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            Trip to {trip.dropoff_location}
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{format(new Date(log.date), "PPP")}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Off Duty: {log.off_duty_hours.toFixed(2)} hrs</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Sleeper: {log.sleeper_berth_hours.toFixed(2)} hrs</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>Driving: {log.driving_hours.toFixed(2)} hrs</span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>
                On Duty: {log.on_duty_not_driving_hours.toFixed(2)} hrs
              </span>
            </div>
          </div>
        </div>
      </CardContent>

      <div className="p-6 pt-0">
        <LogModal trip={trip} dailyLog={log}>
          <Button variant="outline" className="w-full">
            View Full Log
          </Button>
        </LogModal>
      </div>
    </Card>
  );
};
