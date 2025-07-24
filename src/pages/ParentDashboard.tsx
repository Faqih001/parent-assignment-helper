
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parentHelpers, parentalControlHelpers } from "@/lib/supabase";
import type { UserProfile, LearningMaterial, Assignment, UsageAnalytics, ClassInfo } from "@/lib/supabase";

export default function ParentDashboard() {
  const { user } = useAuth();
  const [children, setChildren] = useState<UserProfile[]>([]);
  const [childData, setChildData] = useState<Record<string, {
    materials: LearningMaterial[];
    assignments: (Assignment & { status: string; completed_at?: string })[];
    progress: UsageAnalytics[];
    classes: ClassInfo[];
  }>>({});
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  // Parental controls state: per-child
  const [controls, setControls] = useState<Record<string, { showAssignments: boolean; allowDownloads: boolean; loading?: boolean }>>({});

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    parentHelpers.getChildren(user.id).then(async kids => {
      setChildren(kids);
      const data: Record<string, {
        materials: LearningMaterial[];
        assignments: (Assignment & { status: string; completed_at?: string })[];
        progress: UsageAnalytics[];
        classes: ClassInfo[];
      }> = {};
      // Load controls from backend
      const backendControls = await parentalControlHelpers.getControls(user.id);
      const newControls: Record<string, { showAssignments: boolean; allowDownloads: boolean }> = {};
      for (const child of kids) {
        const [materials, assignments, progress, classes] = await Promise.all([
          parentHelpers.getChildMaterials(child.id),
          parentHelpers.getChildAssignments(child.id),
          parentHelpers.getChildProgress(child.id),
          parentHelpers.getChildClasses(child.id)
        ]);
        data[child.id] = { materials, assignments, progress, classes };
        const ctrl = backendControls[child.id];
        newControls[child.id] = {
          showAssignments: ctrl?.show_assignments ?? true,
          allowDownloads: ctrl?.allow_downloads ?? true
        };
      }
      setChildData(data);
      setControls(newControls);
      setLoading(false);
    });
  }, [user?.id]);

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Parent"}!</CardTitle>
          <Badge variant="outline" className="mt-2">Parent Dashboard</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">Monitor your child's progress, view assignments, and manage account settings.</p>
          {loading ? (
            <p>Loading children and their data...</p>
          ) : children.length === 0 ? (
            <p className="text-xs text-muted-foreground">No linked children found. Please contact support to link your account to your child.</p>
          ) : (
            <div>
              {children.map(child => (
                <div key={child.id} className="mb-8 border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{child.name}</span>
                    <Badge variant="secondary">Student</Badge>
                    <button
                      className="ml-auto text-xs underline text-blue-700"
                      onClick={() => setExpanded(expanded === child.id ? null : child.id)}
                    >
                      {expanded === child.id ? "Hide Details" : "Show Details"}
                    </button>
                  </div>
                  {expanded === child.id && (
                    <div className="ml-2">
                      {/* Parental Controls */}
                      <div className="mb-4 flex gap-4 items-center">
                        <h4 className="font-semibold text-sm mb-1">Parental Controls</h4>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={controls[child.id]?.showAssignments ?? true}
                            disabled={controls[child.id]?.loading}
                            onChange={async e => {
                              setControls(c => ({ ...c, [child.id]: { ...c[child.id], showAssignments: e.target.checked, loading: true } }));
                              await parentalControlHelpers.setControl(user.id, child.id, {
                                show_assignments: e.target.checked,
                                allow_downloads: controls[child.id]?.allowDownloads ?? true
                              });
                              setControls(c => ({ ...c, [child.id]: { ...c[child.id], showAssignments: e.target.checked, loading: false } }));
                            }}
                          />
                          Show Assignments
                        </label>
                        <label className="flex items-center gap-1 text-xs">
                          <input
                            type="checkbox"
                            checked={controls[child.id]?.allowDownloads ?? true}
                            disabled={controls[child.id]?.loading}
                            onChange={async e => {
                              setControls(c => ({ ...c, [child.id]: { ...c[child.id], allowDownloads: e.target.checked, loading: true } }));
                              await parentalControlHelpers.setControl(user.id, child.id, {
                                show_assignments: controls[child.id]?.showAssignments ?? true,
                                allow_downloads: e.target.checked
                              });
                              setControls(c => ({ ...c, [child.id]: { ...c[child.id], allowDownloads: e.target.checked, loading: false } }));
                            }}
                          />
                          Allow Material Downloads
                        </label>
                      </div>
                      {/* Learning Materials */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-1">Learning Materials</h4>
                        {childData[child.id]?.materials?.length ? (
                          <ul className="space-y-1 text-xs">
                            {childData[child.id].materials.map((mat) => (
                              <li key={mat.id}>
                                {controls[child.id]?.allowDownloads ? (
                                  <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-medium">{mat.title}</a>
                                ) : (
                                  <span className="text-muted-foreground">{mat.title} (Download blocked)</span>
                                )}
                                {mat.class_id && <Badge variant="secondary" className="ml-1">Class</Badge>}
                                {mat.is_public && <Badge variant="outline" className="ml-1">Public</Badge>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground">No materials found.</span>
                        )}
                      </div>
                      {/* Assignments */}
                      {controls[child.id]?.showAssignments && (
                        <div className="mb-4">
                          <h4 className="font-semibold text-sm mb-1">Assignments</h4>
                          {childData[child.id]?.assignments?.length ? (
                            <ul className="space-y-1 text-xs">
                              {childData[child.id].assignments.map((a) => (
                                <li key={a.id} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b pb-1">
                                  <div className="flex-1">
                                    <span className="font-medium">{a.title}</span>
                                    <span className="ml-2 text-xs text-muted-foreground">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</span>
                                    <div className="text-xs text-muted-foreground">{a.description}</div>
                                    <span className="text-xs">Status: <Badge variant={a.status === 'completed' ? 'secondary' : a.status === 'overdue' ? 'destructive' : 'outline'}>{a.status}</Badge></span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <span className="text-xs text-muted-foreground">No assignments found.</span>
                          )}
                        </div>
                      )}
                      {/* Progress Analytics */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-1">Recent Activity</h4>
                        {childData[child.id]?.progress?.length ? (
                          <ul className="space-y-1 text-xs">
                            {childData[child.id].progress.slice(0, 5).map((p, i) => (
                              <li key={p.id || i}>
                                <span className="font-medium">{p.action_type.replace(/_/g, ' ')}</span> - {p.created_at ? new Date(p.created_at).toLocaleString() : ''}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground">No recent activity.</span>
                        )}
                      </div>
                      {/* Classes */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-sm mb-1">Classes</h4>
                        {childData[child.id]?.classes?.length ? (
                          <ul className="space-y-1 text-xs">
                            {childData[child.id].classes.map((c) => (
                              <li key={c.id}>
                                <span className="font-medium">{c.name}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground">No classes found.</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
