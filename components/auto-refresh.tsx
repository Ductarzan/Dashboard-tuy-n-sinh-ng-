"use client";

import { useEffect } from "react";

function getTimeParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  }).formatToParts(date);

  const map = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    hour: Number(map.hour),
    minute: Number(map.minute),
    second: Number(map.second)
  };
}

function zonedDateToUtcMs(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  second: number,
  timeZone: string
) {
  const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second);
  const zoneParts = getTimeParts(new Date(utcGuess), timeZone);
  const zoneAsUtc = Date.UTC(
    zoneParts.year,
    zoneParts.month - 1,
    zoneParts.day,
    zoneParts.hour,
    zoneParts.minute,
    zoneParts.second
  );
  return utcGuess - (zoneAsUtc - utcGuess);
}

function getNextRefreshDelayMs(scheduleHours: number[], timeZone: string) {
  const now = new Date();
  const nowMs = now.getTime();
  const nowParts = getTimeParts(now, timeZone);
  const sortedHours = [...scheduleHours].sort((a, b) => a - b);

  for (const hour of sortedHours) {
    const targetMs = zonedDateToUtcMs(
      nowParts.year,
      nowParts.month,
      nowParts.day,
      hour,
      0,
      0,
      timeZone
    );
    if (targetMs > nowMs + 1000) {
      return targetMs - nowMs;
    }
  }

  const tomorrowParts = getTimeParts(new Date(nowMs + 24 * 60 * 60 * 1000), timeZone);
  const firstHour = sortedHours[0] ?? 8;
  const tomorrowTargetMs = zonedDateToUtcMs(
    tomorrowParts.year,
    tomorrowParts.month,
    tomorrowParts.day,
    firstHour,
    0,
    0,
    timeZone
  );

  return Math.max(1000, tomorrowTargetMs - nowMs);
}

export function AutoRefresh({
  scheduleHours,
  timeZone
}: {
  scheduleHours: number[];
  timeZone: string;
}) {
  useEffect(() => {
    const timer = window.setTimeout(() => {
      window.location.reload();
    }, getNextRefreshDelayMs(scheduleHours, timeZone));

    return () => window.clearTimeout(timer);
  }, [scheduleHours, timeZone]);

  return null;
}
