"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/auth/LoginForm";
import { Truck, MapPin, FileText, Shield } from "lucide-react";

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="flex flex-col justify-center px-12">
          <div className="mb-8">
            <Truck className="h-16 w-16 mb-4" />
            <h1 className="text-4xl font-bold mb-4">TruckPlan</h1>
            <p className="text-xl text-blue-100">
              Professional trip planning and electronic logbook management for
              truckers
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <MapPin className="h-6 w-6 mt-1 text-blue-200" />
              <div>
                <h3 className="font-semibold mb-1">Route Planning</h3>
                <p className="text-blue-100">
                  Generate optimized routes with detailed maps and waypoints
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <FileText className="h-6 w-6 mt-1 text-blue-200" />
              <div>
                <h3 className="font-semibold mb-1">Electronic Logbook</h3>
                <p className="text-blue-100">
                  Automated ELD log generation with daily driving reports
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <Shield className="h-6 w-6 mt-1 text-blue-200" />
              <div>
                <h3 className="font-semibold mb-1">Compliance Ready</h3>
                <p className="text-blue-100">
                  DOT-compliant logging and reporting features
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {isLogin ? (
            <LoginForm onToggleMode={() => setIsLogin(false)} />
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
}
