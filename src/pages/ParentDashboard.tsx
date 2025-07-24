import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function ParentDashboard() {
  const { user } = useAuth();
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Parent"}!</CardTitle>
          <Badge variant="outline" className="mt-2">Parent Dashboard</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">Monitor your child's progress, view assignments, and manage account settings.</p>
          {/* TODO: Add child progress, assignments, and parental controls */}
        </CardContent>
      </Card>
    </div>
  );
}
