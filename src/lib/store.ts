import type { Student } from '@/types/student';

// In-memory store (for demonstration purposes)
// Replace this with a proper database (like Firestore) in a real application
let students: Student[] = [
    // Sample Data (Optional)
    // { id: 'S001', name: 'Alice Johnson', totalClasses: 20, attendedClasses: 18 },
    // { id: 'S002', name: 'Bob Smith', totalClasses: 20, attendedClasses: 15 },
    // { id: 'S003', name: 'Charlie Brown', totalClasses: 20, attendedClasses: 10 },
];
let nextId = students.length + 1;

export const addStudent = (name: string): Student => {
    const newStudent: Student = {
        id: `S${String(nextId).padStart(3, '0')}`,
        name,
        totalClasses: 0, // Initialize with 0
        attendedClasses: 0, // Initialize with 0
    };
    students.push(newStudent);
    nextId++;
    return newStudent;
};

export const getStudents = (): Student[] => {
    return [...students]; // Return a copy to prevent direct modification
};

export const updateAttendance = (studentId: string, attended: boolean): Student | undefined => {
    const studentIndex = students.findIndex(s => s.id === studentId);
    if (studentIndex !== -1) {
        students[studentIndex].totalClasses += 1;
        if (attended) {
            students[studentIndex].attendedClasses += 1;
        }
        return { ...students[studentIndex] }; // Return a copy
    }
    return undefined;
};

export const getStudentById = (studentId: string): Student | undefined => {
    return students.find(s => s.id === studentId);
}

// Optional: Function to reset data (useful for testing)
export const resetStudents = () => {
    students = [];
    nextId = 1;
}
