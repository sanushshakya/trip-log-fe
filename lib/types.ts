export interface User {
  id: number;
  email: string;
  name: string;
  token: string;
}

export interface PlanEvent {
  status: "ON_DUTY" | "DRIVING" | "OFF_DUTY";
  duration_hours: number;
  reason?: string;
}

export interface TripPlanResponse {
  events: PlanEvent[];
  routes: {
    distance_miles: number;
    duration_hours: number;
    geometry: string;
    start_coords: [number, number];
    end_coords: [number, number];
  };
}

export interface Trip {
  id: number;
  user: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_hours_used: number;
  available_cycle_hours: number;
  created_on: string;
  updated_on: string;
}
export interface DailyLog {
  id: number;
  trip: Trip;
  date: string;
  log_image: string;
  off_duty_hours: number;
  sleeper_berth_hours: number;
  driving_hours: number;
  on_duty_not_driving_hours: number;
  created_on: string;
  updated_on: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface CreateTripData {
  user: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_hours_used?: number;
}

export interface CreateLogData {
  trip: number;
  date: string;
  off_duty_hours: number;
  sleeper_berth_hours: number;
  driving_hours: number;
  on_duty_not_driving_hours: number;
}