import { Trip, CreateTripData, CreateLogData, TripPlanResponse, DailyLog } from './types';
import { authService } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'; 

const authHeader = () => {
  const token = authService.getToken(); 
  return {
    'Content-Type': 'application/json',
    Authorization: `Token ${token}`,
  };
};

export const tripService = {
  
  getTrip: async (id: number): Promise<Trip> => {
    const res = await fetch(`${API_BASE_URL}/trips/get_trip/?id=${id}`, {
        headers: authHeader(),
    });

    if (!res.ok) throw new Error(`Failed to fetch trip with id: ${id}`);
    return res.json();
  },
  getTrips: async (): Promise<Trip[]> => {
    const res = await fetch(`${API_BASE_URL}/trips/get_trips`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return await res.json();
  },

  createTrip: async (data: CreateTripData): Promise<Trip> => {
    const res = await fetch(`${API_BASE_URL}/trips/create_trip/`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return await res.json();
  },

  generateTripPlan: async (id: number): Promise<TripPlanResponse> => {
    const res = await fetch(`${API_BASE_URL}/trips/${id}/generate_plan/`, {
      method: 'POST',
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to generate trip plan');
    return await res.json();
  },
};

export const logSheet = {
  getLog: async (id:number): Promise<DailyLog[]> => {
    const res = await fetch(`${API_BASE_URL}/logs/get_log/?id=${id}`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return await res.json();
  },
  getLogs: async (): Promise<DailyLog[]> => {
    const res = await fetch(`${API_BASE_URL}/logs/get_logs`, {
      headers: authHeader(),
    });
    if (!res.ok) throw new Error('Failed to fetch trips');
    return await res.json();
  },

  createLog: async (data: CreateLogData): Promise<DailyLog> => {
    const res = await fetch(`${API_BASE_URL}/logs/create_log/`, {
      method: 'POST',
      headers: authHeader(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create trip');
    return await res.json();
  },
};