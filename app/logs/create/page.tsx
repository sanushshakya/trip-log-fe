// in /app/logs/create/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogForm } from "@/components/logs/LogForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { tripService, logSheet } from "@/lib/api";
import { Trip, CreateLogData } from "@/lib/types";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function CreateLogPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTrips = async () => {
      try {
        setLoading(true);
        const tripsData = await tripService.getTrips();
        setTrips(tripsData);
        setError(null);
      } catch (err) {
        setError(
          "Failed to load trips. You cannot create a log without a trip."
        );
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTrips();
  }, []);

  const handleCreateLog = async (data: CreateLogData) => {
    try {
      await logSheet.createLog(data);
      toast.success("Log created successfully!");
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to create log:", err);
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading available trips...</p>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error ? (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <LogForm
            trips={trips}
            onSubmit={handleCreateLog}
            title="Create New Driver Log"
            submitLabel="Create Log"
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
