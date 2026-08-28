interface CsvRow {
  employee: string;
  date: string;
  clockIn: string;
  clockOut: string;
  totalHours: string;
  status: string;
}

const escapeCsvValue = (value: string): string => {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
};

export const buildAttendanceCsv = (rows: CsvRow[]): string => {
  const headers = ["Employee", "Date", "Clock In", "Clock Out", "Total Hours", "Status"];
  const lines = [headers.join(",")];

  for (const row of rows) {
    const line = [row.employee, row.date, row.clockIn, row.clockOut, row.totalHours, row.status]
      .map(escapeCsvValue)
      .join(",");
    lines.push(line);
  }

  return lines.join("\n");
};
