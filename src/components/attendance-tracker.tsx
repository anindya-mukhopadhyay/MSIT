"use client";

import * as React from "react";
import { getStudentsAction, updateAttendanceAction } from "@/app/actions";
import type { Student } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AttendanceTracker() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const fetchedStudents = await getStudentsAction();
      setStudents(fetchedStudents);
      setLoading(false);
    }
    fetchStudents();
  }, []); // Fetch students on component mount

   const handleAttendance = async (studentId: string, attended: boolean) => {
    setUpdatingId(studentId);
    const result = await updateAttendanceAction(studentId, attended);

    if (result.success && result.student) {
      // Update the student list locally for immediate feedback
      setStudents(prevStudents =>
        prevStudents.map(s => s.id === studentId ? result.student! : s)
      );
      toast({
        title: "Attendance Updated",
        description: result.message,
      });
    } else {
      toast({
        title: "Error",
        description: result.message || "Failed to update attendance.",
        variant: "destructive",
      });
    }
     setUpdatingId(null);
  };


  if (loading) {
    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl text-foreground">Mark Attendance</CardTitle>
                <CardDescription>Record today's attendance for each student.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading students...</span>
            </CardContent>
        </Card>
    );
  }

  if (students.length === 0) {
      return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl text-foreground">Mark Attendance</CardTitle>
                <CardDescription>Record today's attendance for each student.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
                <p className="text-muted-foreground">No students found. Please add students via the Admission Portal.</p>
            </CardContent>
        </Card>
      )
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Mark Attendance</CardTitle>
        <CardDescription>Record today's attendance for each student.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-medium">{student.id}</TableCell>
                <TableCell>{student.name}</TableCell>
                <TableCell className="text-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAttendance(student.id, true)}
                    disabled={updatingId === student.id}
                    className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    {updatingId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                     Present
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAttendance(student.id, false)}
                    disabled={updatingId === student.id}
                    className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                     {updatingId === student.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                     Absent
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
