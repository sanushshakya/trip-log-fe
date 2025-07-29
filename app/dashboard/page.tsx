"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TripCard } from "@/components/trips/TripCard";
import { LogCard } from "@/components/logs/LogCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { tripService, logSheet } from "@/lib/api";
import { DailyLog, TripPlanResponse, Trip } from "@/lib/types";
import { Plus, Search, Loader2 } from "lucide-react";

const MapLoader = () => (
  <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-gray-50">
    <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
    <p className="ml-4 text-gray-600">Loading Map...</p>
  </div>
);

const MapDisplay = dynamic(() => import("@/components/maps"), {
  ssr: false,
  loading: () => <MapLoader />,
});

export default function Dashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");

  const [tripSearchTerm, setTripSearchTerm] = useState("");
  const [logSearchTerm, setLogSearchTerm] = useState("");

  const [tripPlan, setTripPlan] = useState<TripPlanResponse | null>(null);
  const [isPlanLoading, setIsPlanLoading] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLogsLoading(true);
        const logsData = await logSheet.getLogs();
        setLogs(logsData);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load dashboard data";
        setLogsError(errorMessage);
      } finally {
        setLogsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Effect to handle auth redirection
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, authLoading, router]);

  // --- Derived Data using useMemo for Performance ---
  // Create a unique list of trips from the logs data.
  // useMemo ensures this only recalculates when the logs array changes.
  const uniqueTrips: Trip[] = useMemo(() => {
    return Array.from(
      new Map(logs.map((log) => [log.trip.id, log.trip])).values()
    );
  }, [logs]);

  // Filter trips based on search term
  const filteredTrips = useMemo(() => {
    return uniqueTrips.filter(
      (trip) =>
        trip.pickup_location
          ?.toLowerCase()
          .includes(tripSearchTerm.toLowerCase()) ||
        trip.dropoff_location
          ?.toLowerCase()
          .includes(tripSearchTerm.toLowerCase())
    );
  }, [uniqueTrips, tripSearchTerm]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => log.trip.id.toString().includes(logSearchTerm));
  }, [logs, logSearchTerm]);

  const handleGeneratePlan = async (tripId: number) => {
    setTripPlan(null);
    setIsPlanLoading(true);
    try {
      const planData = await tripService.generateTripPlan(tripId);
      setTripPlan(planData);
    } catch (err) {
      alert("Failed to generate the trip plan.");
      console.error(err);
    } finally {
      setIsPlanLoading(false);
    }
  };

  if (authLoading || logsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Trip Dashboard</h1>
            <Button asChild>
              <Link href="/trips/create">
                <Plus className="h-4 w-4 mr-2" /> New Trip
              </Link>
            </Button>
          </div>
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by pickup or dropoff location..."
                value={tripSearchTerm}
                onChange={(e) => setTripSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {filteredTrips.map((trip) => (
              <TripCard
                key={trip.id}
                trip={trip}
                onGeneratePlan={handleGeneratePlan}
              />
            ))}
          </div>
        </div>

        {tripPlan && (
          <div className="mt-8">
            <MapDisplay plan={tripPlan} />
          </div>
        )}

        <div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Driver Logs</h1>
            <Button asChild>
              <Link href="/logs/create">
                <Plus className="h-4 w-4 mr-2" /> New Log
              </Link>
            </Button>
          </div>
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Trip ID..."
                value={logSearchTerm}
                onChange={(e) => setLogSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {logsError && (
            <Alert className="mt-6" variant="destructive">
              <AlertDescription>{logsError}</AlertDescription>
            </Alert>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {filteredLogs.map((log) => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
