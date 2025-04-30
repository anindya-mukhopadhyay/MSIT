"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { addStudent as addStudentToStore, updateAttendance as updateAttendanceInStore, getStudents as getStudentsFromStore, getStudentById as getStudentByIdFromStore } from "@/lib/store";
import type { Student } from "@/types/student";

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
    attended: z.boolean(),
});

export async function updateAttendanceAction(studentId: string, attended: boolean): Promise<{ success: boolean; message: string; student?: Student }> {
    const validatedFields = updateAttendanceSchema.safeParse({ studentId, attended });

    if (!validatedFields.success) {
        // This should ideally not happen if called correctly from the client
        return { success: false, message: "Invalid data provided." };
    }

    try {
        const updatedStudent = updateAttendanceInStore(validatedFields.data.studentId, validatedFields.data.attended);
        if (!updatedStudent) {
            return { success: false, message: "Student not found." };
        }
        revalidatePath("/"); // Revalidate the page to update attendance display
        return { success: true, message: `Attendance marked for ${updatedStudent.name}.`, student: updatedStudent };
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
