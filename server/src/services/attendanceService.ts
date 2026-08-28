export const getTodayDateString = (): string => {
  return new Date().toISOString().split("T")[0];
};

export const calculateTotalHours = (clockIn: Date, clockOut: Date): number => {
  const diffMs = clockOut.getTime() - clockIn.getTime();
  const hours = diffMs / (1000 * 60 * 60);
  return Math.round(hours * 100) / 100;
};
