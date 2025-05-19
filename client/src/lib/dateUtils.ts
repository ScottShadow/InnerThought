import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

// Format a date into a readable string (e.g., "Today", "Yesterday", or "May 15, 2023")
export function formatDate(date: Date): string {
  if (isToday(date)) {
    return "Today";
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return format(date, "MMM d, yyyy");
  }
}

// Format a time (e.g., "08:32 AM")
export function formatTime(date: Date): string {
  return format(date, "hh:mm a");
}

// Format a relative time (e.g., "2h ago", "Yesterday", "3 days ago")
export function formatRelativeTime(date: Date): string {
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  } else if (isYesterday(date)) {
    return "Yesterday";
  } else {
    return formatDistanceToNow(date, { addSuffix: true });
  }
}

// Format a date and time for display (e.g., "May 15, 2023 • 08:32 AM")
export function formatDateAndTime(date: Date): string {
  return `${format(date, "MMM d, yyyy")} • ${format(date, "hh:mm a")}`;
}
