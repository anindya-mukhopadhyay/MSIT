"use client";

import * as React from "react";
import { format, isValid } from "date-fns";
import { getStudentsAction, updateAttendanceAction } from "@/app/actions";
import type { Student, AttendanceRecord } from "@/types/student";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, XCircle, Loader2, CalendarIcon, Hourglass, Check, X, HelpCircle } from "lucide-react"; // Import X icon
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const TOTAL_PERIODS = 4; // Define the number of periods per day

export default function AttendanceTracker() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [updatingId, setUpdatingId] = React.useState<string | null>(null); // Track which student's attendance is being updated
  const [updatingPeriod, setUpdatingPeriod] = React.useState<number | null>(null); // Track which period is being updated
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date());
  const [selectedPeriod, setSelectedPeriod] = React.useState<number>(1);
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
    if (!selectedDate || !isValid(selectedDate)) {
        toast({ title: "Error", description: "Please select a valid date.", variant: "destructive" });
        return;
    }
    setUpdatingId(studentId);
    setUpdatingPeriod(selectedPeriod); // Set the period being updated

    const result = await updateAttendanceAction(studentId, selectedDate, selectedPeriod, attended);

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
    setUpdatingPeriod(null); // Reset the period being updated
  };

  const getAttendanceStatus = (student: Student): AttendanceRecord | undefined => {
     if (!selectedDate) return undefined;
     const dateString = format(selectedDate, 'yyyy-MM-dd');
     return student.attendance.find(record => record.date === dateString && record.period === selectedPeriod);
  }

  if (loading) {
    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl text-foreground">Mark Attendance</CardTitle>
                <CardDescription>Record attendance for each student for the selected date and period.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading students...</span>
            </CardContent>
        </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Mark Attendance</CardTitle>
        <CardDescription>Record attendance for each student for the selected date and period.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6 items-center">
           {/* Date Picker */}
           <Popover>
                <PopoverTrigger asChild>
                    <Button
                        variant={"outline"}
                        className={cn(
                            "w-full sm:w-[280px] justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>

          {/* Period Selector */}
          <Select value={String(selectedPeriod)} onValueChange={(value) => setSelectedPeriod(Number(value))}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Period" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: TOTAL_PERIODS }, (_, i) => i + 1).map((period) => (
                <SelectItem key={period} value={String(period)}>
                  Period {period}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {students.length === 0 ? (
             <div className="text-center py-10">
                 <p className="text-muted-foreground">No students found. Please add students via the Admission Portal.</p>
             </div>
        ) : (
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="text-center w-48">Status (Period {selectedPeriod})</TableHead>
                <TableHead className="text-center">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {students.map((student) => {
                    const attendanceRecord = getAttendanceStatus(student);
                    const isUpdatingThisStudentPeriod = updatingId === student.id && updatingPeriod === selectedPeriod;

                    return (
                        <TableRow key={student.id}>
                            <TableCell className="font-medium">{student.id}</TableCell>
                            <TableCell>{student.name}</TableCell>
                            <TableCell className="text-center">
                                {attendanceRecord === undefined ? (
                                     <span className="text-muted-foreground italic flex items-center justify-center"><Hourglass className="mr-1 h-4 w-4" /> Not Marked</span>
                                ) : attendanceRecord.present ? (
                                    <span className="text-green-600 font-medium flex items-center justify-center"><Check className="mr-1 h-4 w-4" /> Present</span>
                                ) : (
                                    <span className="text-red-600 font-medium flex items-center justify-center"><X className="mr-1 h-4 w-4" /> Absent</span>
                                )}
                            </TableCell>
                            <TableCell className="text-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAttendance(student.id, true)}
                                disabled={isUpdatingThisStudentPeriod || !selectedDate}
                                className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
                            >
                                {isUpdatingThisStudentPeriod ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="mr-1 h-4 w-4" />}
                                Present
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAttendance(student.id, false)}
                                disabled={isUpdatingThisStudentPeriod || !selectedDate}
                                className="border-red-500 text-red-600 hover:bg-red-50 hover:text-red-700"
                            >
                                {isUpdatingThisStudentPeriod ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="mr-1 h-4 w-4" />}
                                Absent
                            </Button>
                            </TableCell>
                        </TableRow>
                    );
                })}
            </TableBody>
            </Table>
        )}
      </CardContent>
    </Card>
  );
}
