import type { Student, AttendanceRecord } from '@/types/student';
import { format } from 'date-fns';

// In-memory store (for demonstration purposes)
// Replace this with a proper database (like Firestore) in a real application
let students: Student[] = [
    // Sample Data (Optional)
    // { id: 'S001', name: 'Alice Johnson', attendance: [{ date: '2024-07-29', period: 1, present: true }, { date: '2024-07-29', period: 2, present: false }] },
    // { id: 'S002', name: 'Bob Smith', attendance: [] },
];
let nextId = students.length + 1;

export const addStudent = (name: string): Student => {
    const newStudent: Student = {
        id: `S${String(nextId).padStart(3, '0')}`,
        name,
        attendance: [], // Initialize with empty attendance records
    };
    students.push(newStudent);
    nextId++;
    return newStudent;
};

export const getStudents = (): Student[] => {
    return [...students]; // Return a copy to prevent direct modification
};

export const updateAttendance = (
    studentId: string,
    date: string, // Expecting YYYY-MM-DD format
    period: number,
    present: boolean
): Student | undefined => {
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        const student = students[studentIndex];
        const existingRecordIndex = student.attendance.findIndex(
            record => record.date === date && record.period === period
        );

        const newRecord: AttendanceRecord = { date, period, present };

        if (existingRecordIndex !== -1) {
            // Update existing record
            student.attendance[existingRecordIndex] = newRecord;
        } else {
            // Add new record
            student.attendance.push(newRecord);
            // Sort attendance records for consistency (optional)
            student.attendance.sort((a, b) => {
                if (a.date !== b.date) return a.date.localeCompare(b.date);
                return a.period - b.period;
            });
        }

        students[studentIndex] = student; // Update the student in the main array
        return { ...student }; // Return a copy
    }
    return undefined;
};

export const getStudentById = (studentId: string): Student | undefined => {
    const student = students.find(s => s.id === studentId);
    return student ? { ...student } : undefined; // Return a copy if found
}

// Function to get total periods held up to a certain date/period (useful for eligibility)
export const getTotalPeriodsHeld = (studentsData: Student[], uptoDate: string, uptoPeriod: number): number => {
    const uniqueDatePeriods = new Set<string>();
    studentsData.forEach(student => {
        student.attendance.forEach(record => {
            if (record.date < uptoDate || (record.date === uptoDate && record.period <= uptoPeriod)) {
                 uniqueDatePeriods.add(`${record.date}-${record.period}`);
            }
        });
    });
    return uniqueDatePeriods.size;
};


// Optional: Function to reset data (useful for testing)
export const resetStudents = () => {
    students = [];
    nextId = 1;
}
