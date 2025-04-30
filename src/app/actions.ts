"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
    addStudent as addStudentToStore,
    updateAttendance as updateAttendanceInStore,
    getStudents as getStudentsFromStore,
    getStudentById as getStudentByIdFromStore,
    getTotalPeriodsHeld as getTotalPeriodsHeldFromStore
} from "@/lib/store";
import type { Student } from "@/types/student";
import { format } from "date-fns"; // Import format for date handling

const addStudentSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
});

export async function addStudentAction(formData: FormData): Promise<{ success: boolean; message: string; student?: Student } | { success: boolean; errors: z.ZodIssue[] }> {
  const validatedFields = addStudentSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      errors: validatedFields.error.flatten().fieldErrors.name?.map(msg => ({ code: 'custom', message: msg, path: ['name'] })) || [],
    };
  }

  try {
    const newStudent = addStudentToStore(validatedFields.data.name);
    revalidatePath("/"); // Revalidate the page to show the new student
    return { success: true, message: "Student added successfully!", student: newStudent };
  } catch (error) {
    console.error("Failed to add student:", error);
    return { success: false, message: "Failed to add student. Please try again." };
  }
}


const updateAttendanceSchema = z.object({
    studentId: z.string().min(1),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Invalid date format. Use YYYY-MM-DD." }), // Validate date format
    period: z.coerce.number().int().min(1, { message: "Period must be a positive integer." }), // Ensure period is a positive number
    present: z.boolean(),
});

export async function updateAttendanceAction(
    studentId: string,
    date: Date, // Accept Date object
    period: number,
    present: boolean
): Promise<{ success: boolean; message: string; student?: Student }> {
    const dateString = format(date, 'yyyy-MM-dd'); // Format Date to YYYY-MM-DD string
    const validatedFields = updateAttendanceSchema.safeParse({ studentId, date: dateString, period, present });

    if (!validatedFields.success) {
        // This should ideally not happen if called correctly from the client
         const errors = validatedFields.error.flatten().fieldErrors;
         const errorMessage = Object.values(errors).flat().join(', ') || "Invalid data provided.";
        return { success: false, message: errorMessage };
    }

    try {
        const updatedStudent = updateAttendanceInStore(
            validatedFields.data.studentId,
            validatedFields.data.date,
            validatedFields.data.period,
            validatedFields.data.present
        );
        if (!updatedStudent) {
            return { success: false, message: "Student not found." };
        }
        revalidatePath("/"); // Revalidate the page to update attendance display
        return {
            success: true,
            message: `Attendance for ${updatedStudent.name} on ${validatedFields.data.date}, Period ${validatedFields.data.period} marked as ${validatedFields.data.present ? 'Present' : 'Absent'}.`,
            student: updatedStudent
        };
    } catch (error) {
        console.error("Failed to update attendance:", error);
        return { success: false, message: "Failed to update attendance. Please try again." };
    }
}

export async function getStudentsAction(): Promise<Student[]> {
    // In a real app, you might add error handling or authorization here
    return getStudentsFromStore();
}


export async function getStudentByIdAction(studentId: string): Promise<Student | undefined> {
    return getStudentByIdFromStore(studentId);
}

// Action to get total periods held (useful for eligibility calculation)
export async function getTotalPeriodsHeldAction(uptoDate: Date, uptoPeriod: number): Promise<number> {
    const students = getStudentsFromStore();
    const dateString = format(uptoDate, 'yyyy-MM-dd');
    return getTotalPeriodsHeldFromStore(students, dateString, uptoPeriod);
}

