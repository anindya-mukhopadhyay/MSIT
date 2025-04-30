"use client";

import * as React from "react";
import { getStudentsAction } from "@/app/actions";
import type { Student } from "@/types/student";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Check, X, Loader2, TrendingUp, AlertTriangle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ELIGIBILITY_THRESHOLD = 75;

export default function EligibilityList() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStudents() {
      setLoading(true);
      const fetchedStudents = await getStudentsAction();
      setStudents(fetchedStudents);
      setLoading(false);
    }
    fetchStudents();
  }, []); // Fetch on mount

  const calculateEligibility = (student: Student): { percentage: number; eligible: boolean } => {
    if (student.totalClasses === 0) {
      return { percentage: 0, eligible: false }; // Or handle as per requirements (e.g., N/A, or eligible by default)
    }
    const percentage = (student.attendedClasses / student.totalClasses) * 100;
    return { percentage: Math.round(percentage), eligible: percentage >= ELIGIBILITY_THRESHOLD };
  };

   if (loading) {
    return (
        <Card className="w-full shadow-md">
            <CardHeader>
                <CardTitle className="text-2xl text-foreground">Exam Eligibility Status</CardTitle>
                 <CardDescription>Students meeting the {ELIGIBILITY_THRESHOLD}% attendance requirement.</CardDescription>
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
        <CardDescription>Students meeting the {ELIGIBILITY_THRESHOLD}% attendance requirement.</CardDescription>
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
              const { percentage, eligible } = calculateEligibility(student);
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
                        <p>{student.attendedClasses} / {student.totalClasses} classes attended</p>
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
