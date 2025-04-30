export type AttendanceRecord = {
  date: string; // Store date as YYYY-MM-DD string for simplicity
  period: number; // e.g., 1, 2, 3, 4
  present: boolean;
};

export type Student = {
  id: string;
  name: string;
  attendance: AttendanceRecord[]; // Array to store attendance records for each period
};
