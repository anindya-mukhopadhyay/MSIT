"use client";

import * as React from "react";
import { getStudentsAction, getTotalPeriodsHeldAction } from "@/app/actions";
import type { Student } from "@/types/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format } from 'date-fns'; // Import format

const ELIGIBILITY_THRESHOLD = 75;

export default function EligibilityList() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [totalPeriodsHeld, setTotalPeriodsHeld] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const [fetchedStudents, fetchedTotalPeriods] = await Promise.all([
        getStudentsAction(),
        // Calculate total periods up to today, last period (adjust if needed)
        // Assuming 4 periods per day, change if necessary
        getTotalPeriodsHeldAction(new Date(), 4)
      ]);
      setStudents(fetchedStudents);
      setTotalPeriodsHeld(fetchedTotalPeriods);
      setLoading(false);
    }
    fetchData();
  }, []); // Fetch on mount

  const calculateEligibility = (student: Student): { percentage: number; eligible: boolean; attended: number } => {
    if (totalPeriodsHeld === 0) {
      return { percentage: 0, eligible: false, attended: 0 }; // Or handle as per requirements
    }
    // Count attended classes from the student's attendance records
    const attendedClasses = student.attendance.filter(record => record.present).length;
    const percentage = (attendedClasses / totalPeriodsHeld) * 100;
    return {
        percentage: Math.round(percentage),
        eligible: percentage >= ELIGIBILITY_THRESHOLD,
        attended: attendedClasses
    };
  };

   if (loading) {
    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl text-foreground">Exam Eligibility Status</CardTitle>
                 <CardDescription>Checking eligibility based on {ELIGIBILITY_THRESHOLD}% attendance requirement.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center items-center h-40">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2">Loading eligibility data...</span>
            </CardContent>
        </Card>
    );
  }

  if (students.length === 0) {
      return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl text-foreground">Exam Eligibility Status</CardTitle>
                <CardDescription>Students meeting the {ELIGIBILITY_THRESHOLD}% attendance requirement.</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-10">
                 <p className="text-muted-foreground">No student data available to check eligibility.</p>
            </CardContent>
        </Card>
      )
  }


  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="text-2xl text-foreground">Exam Eligibility Status</CardTitle>
        <CardDescription>
            Eligibility based on {ELIGIBILITY_THRESHOLD}% attendance out of {totalPeriodsHeld} periods held so far.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
         <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Attendance (%)</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => {
              const { percentage, eligible, attended } = calculateEligibility(student);
              return (
                <TableRow key={student.id}>
                  <TableCell className="font-medium">{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell className="text-center">
                     <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex items-center justify-center gap-2">
                         <Progress value={percentage} className="w-24 h-2" aria-label={`${percentage}% attendance`}/>
                         <span>{percentage}%</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{attended} / {totalPeriodsHeld} periods attended</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell className="text-center">
                    {eligible ? (
                      <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white">
                        <Check className="mr-1 h-4 w-4" /> Eligible
                      </Badge>
                    ) : (
                       <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
                        <X className="mr-1 h-4 w-4" /> Not Eligible
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
