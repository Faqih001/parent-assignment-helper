import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function StudentDashboard() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Student"}!</CardTitle>
          <Badge variant="outline" className="mt-2">Student Dashboard</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">View your assignments, progress, and achievements.</p>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Learning Materials</h3>
            <p className="text-xs text-muted-foreground">(Coming soon: Students will be able to access uploaded videos and materials from teachers and admins.)</p>
          </div>
          {/* TODO: Add assignment list, progress tracking, and gamification features */}
        </CardContent>
      </Card>
    </div>
  );
}
