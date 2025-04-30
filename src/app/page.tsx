import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdmissionForm from "@/components/admission-form";
import AttendanceTracker from "@/components/attendance-tracker";
import EligibilityList from "@/components/eligibility-list";

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8 text-foreground text-center">Exam Eligibility Tracker</h1>
      <Tabs defaultValue="admission" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="admission">Admission Portal</TabsTrigger>
          <TabsTrigger value="attendance">Attendance System</TabsTrigger>
          <TabsTrigger value="eligibility">Eligibility Check</TabsTrigger>
        </TabsList>
        <TabsContent value="admission">
          <AdmissionForm />
        </TabsContent>
        <TabsContent value="attendance">
          <AttendanceTracker />
        </TabsContent>
        <TabsContent value="eligibility">
          <EligibilityList />
        </TabsContent>
      </Tabs>
    </main>
  );
}
