import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeacherDashboard() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Teacher"}!</CardTitle>
          <Badge variant="outline" className="mt-2">Teacher Dashboard</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">Manage your classes, assignments, and view student progress.</p>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Upload Videos & Materials</h3>
            <input type="file" accept="video/*,application/pdf" className="mb-2" />
            <Button variant="outline" className="mb-4">Upload</Button>
            <p className="text-xs text-muted-foreground">(Coming soon: Teachers will be able to upload learning materials for their students.)</p>
          </div>
          {/* TODO: Add class management, assignment creation, and student analytics */}
        </CardContent>
      </Card>
    </div>
  );
}
