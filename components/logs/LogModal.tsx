"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { DailyLogSheet } from "@/components/logs/DailyLogSheet";
import { Trip, DailyLog } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

interface TripLogModalProps {
  trip: Trip;
  dailyLog: DailyLog | null;
  children: React.ReactNode;
}

export const LogModal: React.FC<TripLogModalProps> = ({
  trip,
  dailyLog,
  children,
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-7xl">
        <DialogHeader>
          <DialogTitle>
            Driver's Daily Log for Trip to {trip.dropoff_location}
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[80vh] overflow-y-auto p-2">
          {dailyLog ? (
            <DailyLogSheet trip={trip} dailyLog={dailyLog} />
          ) : (
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>No Daily Log Available</AlertTitle>
              <AlertDescription>
                There is no daily log recorded for this trip to display.
              </AlertDescription>
            </Alert>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
