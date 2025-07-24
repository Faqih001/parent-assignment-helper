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
          {/* TODO: Add class management, assignment creation, and student analytics */}
        </CardContent>
      </Card>
    </div>
  );
}
