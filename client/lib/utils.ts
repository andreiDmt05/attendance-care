export const cn = (...classes: Array<string | false | null | undefined>): string => {
  return classes.filter(Boolean).join(" ");
};

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const formatTime = (dateStr: string | null | undefined): string => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatHours = (hours: number): string => {
  return `${hours.toFixed(2)}h`;
};
