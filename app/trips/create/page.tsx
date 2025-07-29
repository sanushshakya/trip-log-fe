"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { TripForm } from "@/components/trips/TripForm";
import { tripService } from "@/lib/api";
import { CreateTripData } from "@/lib/types";
import { toast } from "sonner";

export default function CreateTrip() {
  const router = useRouter();

  const handleSubmit = async (data: CreateTripData) => {
    try {
      await tripService.createTrip(data);
      toast.success("Trip created successfully");
      router.push("/dashboard");
    } catch (error) {
      throw error;
    }
  };

  return (
    <ProtectedRoute>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Trip</h1>
          <p className="text-gray-600">Plan your next trucking route</p>
        </div>

        <TripForm onSubmit={handleSubmit} />
      </div>
    </ProtectedRoute>
  );
}
