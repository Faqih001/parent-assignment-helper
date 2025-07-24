
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { studentHelpers, LearningMaterial, Assignment, UsageAnalytics, ClassInfo, supabase } from "@/lib/supabase";

// Teacher-specific helpers (to be added to supabase.ts in a real app)
async function uploadMaterial(teacherId: string, file: File, title: string, description: string, classId?: string): Promise<boolean> {
  // Upload file to Supabase Storage (bucket: 'learning-materials')
  const ext = file.name.split('.').pop();
  const fileName = `${teacherId}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('learning-materials')
    .upload(fileName, file, { upsert: true });
  if (error) return false;
  // Get public URL
  const { data: urlData } = supabase.storage
    .from('learning-materials')
    .getPublicUrl(fileName);
  const fileUrl = urlData?.publicUrl || '';
  // Insert metadata into learning_materials table
  const { error: dbErr } = await supabase
    .from('learning_materials')
    .insert({
      title,
      description,
      file_url: fileUrl,
      uploaded_by: teacherId,
      class_id: classId || null,
      is_public: !classId,
    });
  return !dbErr;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [progress, setProgress] = useState<UsageAnalytics[]>([]);
  const [analyticsByClass, setAnalyticsByClass] = useState<Record<string, UsageAnalytics[]>>({});
  const [showAnalytics, setShowAnalytics] = useState<string | null>(null);
  // Assignment creation state
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    due_date: "",
    class_id: ""
  });
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    Promise.all([
      studentHelpers.getLearningMaterials(user.id),
      studentHelpers.getClasses(user.id),
      studentHelpers.getProgress(user.id)
    ]).then(([m, c, p]) => {
      setMaterials(m);
      setClasses(c);
      setProgress(p);
      // Deeper analytics: group by class
      const byClass: Record<string, UsageAnalytics[]> = {};
      c.forEach(cls => {
        byClass[cls.id] = p.filter(a => a.metadata && a.metadata.class_id === cls.id);
      });
      setAnalyticsByClass(byClass);
      setLoading(false);
    });
    // Fetch assignments created by this teacher
    // (Assume assignments table has created_by field)
    supabase
      .from('assignments')
      .select('*')
      .eq('created_by', user.id)
      .then(({ data, error }) => {
        if (!error && data) setAssignments(data);
      });
  }, [user?.id]);

  // Assignment creation handler
  async function handleCreateAssignment() {
    if (!user?.id || !newAssignment.title || !newAssignment.class_id) return;
    setCreating(true);
    const { error } = await supabase
      .from('assignments')
      .insert({
        title: newAssignment.title,
        description: newAssignment.description,
        due_date: newAssignment.due_date,
        class_id: newAssignment.class_id,
        created_by: user.id
      });
    if (!error) {
      setNewAssignment({ title: "", description: "", due_date: "", class_id: "" });
      // Refresh assignments
      const { data, error: fetchErr } = await supabase
        .from('assignments')
        .select('*')
        .eq('created_by', user.id);
      if (!fetchErr && data) setAssignments(data);
    }
    setCreating(false);
  }

  const handleUpload = async () => {
    if (!user?.id || !file || !title) return;
    setUploading(true);
    const ok = await uploadMaterial(user.id, file, title, description, selectedClass || undefined);
    if (ok) {
      setTitle("");
      setDescription("");
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // Refresh materials
      const m = await studentHelpers.getLearningMaterials(user.id);
      setMaterials(m);
    }
    setUploading(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle>Welcome, {user?.name || "Teacher"}!</CardTitle>
          <Badge variant="outline" className="mt-2">Teacher Dashboard</Badge>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-muted-foreground">Manage your classes, assignments, and view student progress.</p>

          {/* Upload Materials */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Upload Videos & Materials</h3>
            <label htmlFor="teacher-upload" className="block text-sm font-medium mb-1">Select file to upload</label>
            <input
              id="teacher-upload"
              type="file"
              accept="video/*,application/pdf"
              className="mb-2"
              ref={fileInputRef}
              onChange={e => setFile(e.target.files?.[0] || null)}
            />
            <input
              type="text"
              placeholder="Title"
              className="mb-2 block w-full border rounded px-2 py-1"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
            <input
              type="text"
              placeholder="Description (optional)"
              className="mb-2 block w-full border rounded px-2 py-1"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
            <select
              className="mb-2 block w-full border rounded px-2 py-1"
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              title="Select class for material (optional)"
            >
              <option value="">Public (all students)</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <Button variant="outline" className="mb-4" onClick={handleUpload} disabled={uploading || !file || !title}>
              {uploading ? "Uploading..." : "Upload"}
            </Button>
            <p className="text-xs text-muted-foreground">Upload learning materials for your students. Select a class to restrict access, or leave public for all students.</p>
          </div>

          {/* Materials List */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Your Uploaded Materials</h3>
            {loading ? (
              <p>Loading materials...</p>
            ) : materials.length === 0 ? (
              <p className="text-xs text-muted-foreground">No materials uploaded yet.</p>
            ) : (
              <ul className="space-y-2">
                {materials.filter(m => m.uploaded_by === user?.id).map(mat => (
                  <li key={mat.id} className="flex items-center gap-2">
                    <a href={mat.file_url} target="_blank" rel="noopener noreferrer" className="underline text-blue-700 font-medium">{mat.title}</a>
                    {mat.class_id && <Badge variant="secondary">Class</Badge>}
                    {mat.is_public && <Badge variant="outline">Public</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Assignment Creation & Management */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Create Assignment</h3>
            <div className="flex flex-col md:flex-row md:items-end gap-2 mb-4">
              <input
                type="text"
                placeholder="Title"
                title="Assignment Title"
                className="border rounded px-2 py-1 w-full md:w-1/4"
                value={newAssignment.title}
                onChange={e => setNewAssignment(a => ({ ...a, title: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Description"
                title="Assignment Description"
                className="border rounded px-2 py-1 w-full md:w-1/4"
                value={newAssignment.description}
                onChange={e => setNewAssignment(a => ({ ...a, description: e.target.value }))}
              />
              <input
                type="date"
                className="border rounded px-2 py-1 w-full md:w-1/4"
                value={newAssignment.due_date}
                onChange={e => setNewAssignment(a => ({ ...a, due_date: e.target.value }))}
                title="Due Date"
              />
              <select
                className="border rounded px-2 py-1 w-full md:w-1/4"
                value={newAssignment.class_id}
                onChange={e => setNewAssignment(a => ({ ...a, class_id: e.target.value }))}
                title="Select class for assignment"
              >
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <Button onClick={handleCreateAssignment} disabled={creating || !newAssignment.title || !newAssignment.class_id}>
                {creating ? "Creating..." : "Create"}
              </Button>
            </div>
            <h3 className="font-semibold mb-2">Your Assignments</h3>
            {assignments.length === 0 ? (
              <p className="text-xs text-muted-foreground">No assignments created yet.</p>
            ) : (
              <ul className="space-y-2">
                {assignments.map(a => (
                  <li key={a.id} className="flex flex-col md:flex-row md:items-center md:gap-4 border-b pb-2">
                    <div className="flex-1">
                      <span className="font-medium">{a.title}</span>
                      <span className="ml-2 text-xs text-muted-foreground">Due: {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'N/A'}</span>
                      <div className="text-xs text-muted-foreground">{a.description}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Class List & Analytics */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">Your Classes</h3>
            {classes.length === 0 ? (
              <p className="text-xs text-muted-foreground">No classes found.</p>
            ) : (
              <ul className="space-y-1 text-xs">
                {classes.map(c => (
                  <li key={c.id}>
                    <span className="font-medium">{c.name}</span>
                    <Button size="sm" variant="outline" className="ml-2 px-2 py-0.5 text-xs" onClick={() => setShowAnalytics(showAnalytics === c.id ? null : c.id)}>
                      {showAnalytics === c.id ? "Hide Analytics" : "Show Analytics"}
                    </Button>
                    {showAnalytics === c.id && (
                      <div className="mt-2 ml-4 p-2 border rounded bg-muted">
                        <h4 className="font-semibold text-xs mb-1">Recent Activity</h4>
                        {analyticsByClass[c.id]?.length ? (
                          <ul className="space-y-1 text-xs">
                            {analyticsByClass[c.id].slice(0, 5).map((a, i) => (
                              <li key={a.id || i}>
                                <span className="font-medium">{a.action_type.replace(/_/g, ' ')}</span> - {a.created_at ? new Date(a.created_at).toLocaleString() : ''}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-muted-foreground">No activity for this class.</span>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Student Analytics (recent activity) */}
          <div className="mb-2">
            <h3 className="font-semibold mb-2">Recent Student Activity</h3>
            {progress.length === 0 ? (
              <p className="text-xs text-muted-foreground">No student activity yet.</p>
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

        </CardContent>
      </Card>
    </div>
  );
}
