"use client";

import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Trip, DailyLog } from "@/lib/types";
import { Button } from "@/components/ui/button";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const year = date.getUTCFullYear();
  return { month, day, year };
};

const DutyStatusGrid: React.FC<{ log: DailyLog }> = ({ log }) => {
  const statuses = {
    off_duty_hours: "1. Off Duty",
    sleeper_berth_hours: "2. Sleeper Berth",
    driving_hours: "3. Driving",
    on_duty_not_driving_hours: "4. On Duty (not driving)",
  };

  const renderGridLines = () =>
    Array.from({ length: 24 }).map((_, i) => (
      <div
        key={i}
        className="flex-1 h-full border-r border-gray-300 last:border-r-0"
      />
    ));

  const renderTimeline = (startHour: number, duration: number) => {
    if (!duration || duration <= 0) return null;
    return (
      <div
        className="absolute top-1/2 -translate-y-1/2 h-0.5 bg-black"
        style={{
          left: `calc(${(startHour / 24) * 100}%)`,
          width: `calc(${(duration / 24) * 100}%)`,
        }}
      />
    );
  };

  const timelineSegments: {
    [key: string]: { start: number; duration: number };
  } = {};
  let cumulativeHours = 0;
  const dutyOrder: (keyof DailyLog)[] = [
    "off_duty_hours",
    "sleeper_berth_hours",
    "driving_hours",
    "on_duty_not_driving_hours",
  ];

  dutyOrder.forEach((key) => {
    const duration = log[key] as number;
    if (duration > 0) {
      timelineSegments[key] = { start: cumulativeHours, duration };
      cumulativeHours += duration;
    }
  });

  return (
    <div className="border-t-2 border-l-2 border-r-2 border-black">
      {/* Grid Header with hours */}
      <div className="flex bg-black text-white text-center text-xs">
        <div className="w-48 border-r border-gray-500 py-1" />
        {[
          "Mid",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
          "Noon",
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10",
          "11",
        ].map((h, i) => (
          <div
            key={i}
            className="flex-1 py-1 border-r border-gray-600 last:border-r-0"
          >
            {h}
          </div>
        ))}
        <div className="w-24 border-l border-gray-500 py-1">Total Hours</div>
      </div>

      {/* Grid Rows for each duty status */}
      {Object.entries(statuses).map(([key, label]) => {
        const segment = timelineSegments[key];
        const hours = (log[key as keyof DailyLog] as number) || 0;
        return (
          <div key={key} className="flex border-b-2 border-black h-10">
            <div className="w-48 border-r-2 border-black p-1 text-xs flex items-center">
              {label}
            </div>
            <div className="flex-grow flex relative">
              {renderGridLines()}
              {segment && renderTimeline(segment.start, segment.duration)}
            </div>
            <div className="w-24 border-l-2 border-black flex items-center justify-center font-bold">
              {hours.toFixed(2)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface DailyLogSheetProps {
  trip: Trip;
  dailyLog: DailyLog;
}

export const DailyLogSheet: React.FC<DailyLogSheetProps> = ({
  trip,
  dailyLog,
}) => {
  const logSheetRef = useRef<HTMLDivElement>(null);
  const { month, day, year } = formatDate(dailyLog.date);
  const onDutyTotal =
    dailyLog.driving_hours + dailyLog.on_duty_not_driving_hours;

  const handleExportPDF = () => {
    const input = logSheetRef.current;
    if (!input) return;
    const exportButton = input.querySelector(
      "#export-pdf-button"
    ) as HTMLElement;
    if (exportButton) exportButton.style.display = "none";

    html2canvas(input, { scale: 2.5, useCORS: true }).then((canvas) => {
      if (exportButton) exportButton.style.display = "block";

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "landscape",
        unit: "pt",
        format: "letter",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 30;
      const imgProps = pdf.getImageProperties(imgData);
      const imgRatio = imgProps.width / imgProps.height;
      let newWidth = pdfWidth - margin * 2;
      let newHeight = newWidth / imgRatio;

      if (newHeight > pdfHeight - margin * 2) {
        newHeight = pdfHeight - margin * 2;
        newWidth = newHeight * imgRatio;
      }
      const xOffset = (pdfWidth - newWidth) / 2;
      const yOffset = (pdfHeight - newHeight) / 2;

      pdf.addImage(imgData, "PNG", xOffset, yOffset, newWidth, newHeight);
      pdf.save(`daily-log-${trip.id}-${dailyLog.date}.pdf`);
    });
  };

  return (
    <div className="bg-white">
      <div
        ref={logSheetRef}
        className="p-4 border-2 border-black font-sans text-xs bg-white"
      >
        <div className="flex justify-between items-start mb-2">
          <h1 className="text-xl font-bold">Driver's Daily Log</h1>
          <div className="text-right text-[10px]">
            <p>Original - File at home terminal.</p>
            <p>Duplicate - Driver retains in his/her possession for 8 days.</p>
          </div>
        </div>

        <div className="flex justify-between items-center mb-2">
          <div className="flex space-x-2 items-center">
            <p>
              Date:{" "}
              <b>
                {month}/{day}/{year}
              </b>
            </p>
            <p>
              From:{" "}
              <span className="font-bold border-b border-gray-500 px-2">
                {trip.pickup_location}
              </span>
            </p>
            <p>
              To:{" "}
              <span className="font-bold border-b border-gray-500 px-2">
                {trip.dropoff_location}
              </span>
            </p>
          </div>
          <Button id="export-pdf-button" size="sm" onClick={handleExportPDF}>
            Export as PDF
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-x-4 border-y border-gray-400 py-1 mb-4">
          <div className="border-r border-gray-400 pr-2 space-y-1">
            <p>
              Truck/Tractor Numbers: <b>[Vehicle ID]</b>
            </p>
          </div>
          <div className="border-r border-gray-400 pr-2 space-y-1">
            <p>
              Name of Carrier: <b>[Carrier Name]</b>
            </p>
            <p>
              Main Office Address: <b>[Main Office Address]</b>
            </p>
          </div>
          <div className="space-y-1">
            <p>
              Shipper & Commodity: <b>[Shipper/Commodity]</b>
            </p>
            <p>
              Home Terminal Address: <b>[Home Terminal Address]</b>
            </p>
          </div>
        </div>

        <DutyStatusGrid log={dailyLog} />

        <div className="grid grid-cols-3 gap-x-8 mt-2">
          <div className="col-span-2">
            <p className="font-bold">Remarks:</p>
            <div className="h-12 border-b border-black" />
          </div>
          <div>
            <p className="font-bold">Recap:</p>
            <p>
              On duty hours today (lines 3&4): <b>{onDutyTotal.toFixed(2)}</b>
            </p>
            <p>
              Total hours on duty last 7 days:{" "}
              <b>{trip.current_cycle_hours_used.toFixed(2)}</b>
            </p>
            <p>
              Hours available tomorrow:{" "}
              <b>{trip.available_cycle_hours.toFixed(2)}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
