"use client";

import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  Popup,
  Tooltip,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import polyline from "@mapbox/polyline";
import { TripPlanResponse } from "@/lib/types";

import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";

const AutoFitBounds: React.FC<{ bounds: L.LatLngBounds }> = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, bounds]);
  return null;
};

// Define the text labels for different event types
const MARKER_LABELS = {
  start: "Start",
  pickup: "Pickup",
  dropoff: "Destination",
  fuel: "Fuel",
  rest: "Rest",
  sleep: "Sleep",
};

interface MapProps {
  plan: TripPlanResponse;
}

export const Map: React.FC<MapProps> = ({ plan }) => {
  const [decodedGeometry, setDecodedGeometry] = useState<L.LatLngExpression[]>(
    []
  );
  const [eventMarkers, setEventMarkers] = useState<React.ReactNode[]>([]);
  const [bounds, setBounds] = useState<L.LatLngBounds>(L.latLngBounds([]));

  useEffect(() => {
    if (!plan?.routes?.geometry) return;

    const decoded = polyline
      .decode(plan.routes.geometry)
      .map((p) => [p[0], p[1]] as L.LatLngExpression);
    setDecodedGeometry(decoded);

    const routeBounds = L.latLngBounds(decoded);
    setBounds(routeBounds);

    const markers: React.ReactNode[] = [];
    let cumulativeHours = 0;
    let cumulativeDistance = 0;

    const totalDrivingHours = plan.events
      .filter((e) => e.status === "DRIVING")
      .reduce((acc, e) => acc + e.duration_hours, 0);

    if (totalDrivingHours === 0) return;

    const totalDistance = plan.routes.distance_miles;
    let nextFuelStopDistance = 1000;

    // Add Start Marker
    markers.push(
      <Marker key="start" position={plan.routes.start_coords}>
        <Tooltip permanent direction="top" className="custom-map-tooltip">
          {MARKER_LABELS.start}
        </Tooltip>
      </Marker>
    );

    // Process each event to place markers along the route
    plan.events.forEach((event, index) => {
      if (event.status === "DRIVING") {
        const segmentDuration = event.duration_hours;
        const segmentDistance =
          (segmentDuration / totalDrivingHours) * totalDistance;

        // Place fuel stop markers
        while (nextFuelStopDistance < cumulativeDistance + segmentDistance) {
          const fuelStopRatio =
            (nextFuelStopDistance - cumulativeDistance) / segmentDistance;
          const pointIndexRatio =
            (cumulativeHours + segmentDuration * fuelStopRatio) /
            totalDrivingHours;
          const pointIndex = Math.floor(pointIndexRatio * (decoded.length - 1));

          if (decoded[pointIndex]) {
            markers.push(
              <Marker
                key={`fuel-${nextFuelStopDistance}`}
                position={decoded[pointIndex]}
              >
                <Tooltip
                  permanent
                  direction="top"
                  className="custom-map-tooltip"
                >
                  {MARKER_LABELS.fuel}
                </Tooltip>
                <Popup>{`Fuel Stop (~${nextFuelStopDistance.toFixed(
                  0
                )} miles)`}</Popup>
              </Marker>
            );
          }
          nextFuelStopDistance += 1000;
        }

        cumulativeHours += segmentDuration;
        cumulativeDistance += segmentDistance;
      } else {
        // Handle ON_DUTY and OFF_DUTY events
        const pointIndexRatio = cumulativeHours / totalDrivingHours;
        const pointIndex = Math.min(
          Math.floor(pointIndexRatio * decoded.length),
          decoded.length - 1
        );
        const eventCoords = decoded[pointIndex];

        if (eventCoords) {
          let labelText: string | null = null;

          if (event.reason === "Pickup") {
            labelText = MARKER_LABELS.pickup;
          } else if (event.reason?.includes("30-min")) {
            labelText = MARKER_LABELS.rest;
          } else if (event.reason?.includes("10-hour")) {
            labelText = MARKER_LABELS.sleep;
          }

          if (labelText) {
            markers.push(
              <Marker key={`event-${index}`} position={eventCoords}>
                <Tooltip
                  permanent
                  direction="top"
                  className="custom-map-tooltip"
                >
                  {labelText}
                </Tooltip>
                <Popup>{event.reason}</Popup>
              </Marker>
            );
          }
        }
      }
    });

    // Ensure the final dropoff marker is at the very end
    markers.push(
      <Marker key="end" position={plan.routes.end_coords}>
        <Tooltip permanent direction="top" className="custom-map-tooltip">
          {MARKER_LABELS.dropoff}
        </Tooltip>
        <Popup>Final Destination</Popup>
      </Marker>
    );

    setEventMarkers(markers);
  }, [plan]);

  if (decodedGeometry.length === 0) {
    return (
      <div className="flex h-[500px] w-full items-center justify-center rounded-lg bg-gray-50">
        <p>Preparing Map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={plan.routes.start_coords}
      zoom={7}
      style={{ height: "500px", width: "100%" }}
      className="rounded-lg shadow-md"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polyline positions={decodedGeometry} color="#0052D4" weight={5} />

      {eventMarkers}

      {bounds.isValid() && <AutoFitBounds bounds={bounds} />}
    </MapContainer>
  );
};

export default Map;
