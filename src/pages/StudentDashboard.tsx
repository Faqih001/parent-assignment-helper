
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentHelpers, LearningMaterial, Assignment, UsageAnalytics, AchievementBadge, ClassInfo } from "@/lib/supabase";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [assignments, setAssignments] = useState<(Assignment & { status: string; completed_at?: string })[]>([]);
  const [progress, setProgress] = useState<UsageAnalytics[]>([]);
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      studentHelpers.getLearningMaterials(user.id),
      studentHelpers.getAssignments(user.id),
      studentHelpers.getProgress(user.id),
      studentHelpers.getBadges(user.id),
      studentHelpers.getClasses(user.id)
    ]).then(([m, a, p, b, c]) => {
      setMaterials(m);
      setAssignments(a);
      setProgress(p);
      setBadges(b);
      setClasses(c);
      setLoading(false);
    });
  }, [user?.id]);

  const handleMarkComplete = async (assignmentId: string) => {
    if (!user?.id) return;
    setMarking(assignmentId);
    await studentHelpers.completeAssignment(user.id, assignmentId);
    // Refresh assignments
    const updated = await studentHelpers.getAssignments(user.id);
    setAssignments(updated);
    setMarking(null);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Student"}!</CardTitle>
          <Badge variant="outline" className="mt-2">Student Dashboard</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">View your assignments, progress, and achievements.</p>

          {/* Learning Materials */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Learning Materials</h3>
            {loading ? (
              <p>Loading materials...</p>
            ) : materials.length === 0 ? (
              <p className="text-xs text-muted-foreground">No materials available yet.</p>
            ) : (
              <ul className="space-y-2">
                {materials.map(mat => (
                  <li key={mat.id} className="flex items-center gap-2">
                    <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-medium">{mat.title}</a>
                    {mat.class_id && <Badge variant="secondary">Class</Badge>}
                    {mat.is_public && <Badge variant="outline">Public</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assignments */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Assignments</h3>
            {loading ? (
              <p>Loading assignments...</p>
            ) : assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No assignments yet.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map(a => (
                  <li key={a.id} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b pb-2">
                    <div className="flex-1">
                      <span className="font-medium">{a.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</span>
                      <div className="text-xs text-muted-foreground">{a.description}</div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 md:mt-0">
                      <Badge variant={a.status === 'completed' ? 'default' : a.status === 'overdue' ? 'destructive' : 'outline'}>
                        {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                      </Badge>
                      {a.status !== 'completed' && (
                        <Button size="sm" disabled={marking === a.id} onClick={() => handleMarkComplete(a.id)}>
                          {marking === a.id ? 'Marking...' : 'Mark Complete'}
                        </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Progress Analytics */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Progress</h3>
            {loading ? (
              <p>Loading progress...</p>
            ) : progress.length === 0 ? (
              <p className="text-xs text-muted-foreground">No activity yet.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {progress.slice(0, 5).map((p, i) => (
                  <li key={p.id || i}>
                    <span className="font-medium">{p.action_type.replace(/_/g, ' ')}</span> - {p.created_at ? new Date(p.created_at).toLocaleString() : ''}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Achievements/Badges */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Achievements & Badges</h3>
            {loading ? (
              <p>Loading badges...</p>
            ) : badges.length === 0 ? (
              <p className="text-xs text-muted-foreground">No badges earned yet.</p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {badges.map(b => (
                  <li key={b.id}>
                    <Badge variant="default">{b.badge_type}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Class Info */}
          <div className="mb-2">
            <h3 className="font-semibold mb-2">Your Classes</h3>
            {loading ? (
              <p>Loading classes...</p>
            ) : classes.length === 0 ? (
              <p className="text-xs text-muted-foreground">Not enrolled in any class.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {classes.map(c => (
                  <li key={c.id}>
                    <span className="font-medium">{c.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
