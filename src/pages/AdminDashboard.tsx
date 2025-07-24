import { useState, useEffect, useCallback, useRef } from "react";
  // --- Admin feature state ---
// const [studentSearch, setStudentSearch] = useState("");
// const [teacherSearch, setTeacherSearch] = useState("");
// const [parentSearch, setParentSearch] = useState("");
// const [newParentId, setNewParentId] = useState("");
// const [newStudentId, setNewStudentId] = useState("");
// const [newTeacherId, setNewTeacherId] = useState("");
// const [newClassName, setNewClassName] = useState("");
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useNavigate } from "react-router-dom";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { dbHelpers, UserProfile, CustomPlan } from "@/lib/supabase";
import { Settings, Users, CreditCard, Plus, Edit, Trash2, Shield, UserCheck, Building, Crown } from "lucide-react";

type Role = 'student' | 'teacher' | 'parent' | 'admin';
              )}

// --- HOOKS: Load impersonation preview data when impersonateUser changes ---
useEffect(() => {
  if (!impersonateUser) {
    setImpersonateAssignments([]);
    setImpersonateClasses([]);
    setImpersonateChildren([]);
    return;
  }
  if ((impersonateUser.role as string) === 'student') {
    dbHelpers.getAssignmentsForStudent?.(impersonateUser.id).then(setImpersonateAssignments);
  } else if ((impersonateUser.role as string) === 'teacher') {
    dbHelpers.getClassesForTeacher?.(impersonateUser.id).then(setImpersonateClasses);
  } else if ((impersonateUser.role as string) === 'parent') {
    const children = parentChild
      .filter((rel: any) => rel.parent_id === impersonateUser.id)
      .map((rel: any) => students.find(s => s.id === rel.student_id))
      .filter(Boolean) as UserProfile[];
    setImpersonateChildren(children);
  }
}, [impersonateUser, parentChild, students]);
  const [editingUser, setEditingUser] = useState<(UserProfile & { questions_limit?: number }) | null>(null);
  const [activeTab, setActiveTab] = useState<'overview'|'students'|'teachers'|'parents'|'impersonate'|'relationships'|'analytics'>('overview');
  const [impersonateUser, setImpersonateUser] = useState<UserProfile|null>(null);
  const [impersonateAssignments, setImpersonateAssignments] = useState<any[]>([]);
  const [impersonateClasses, setImpersonateClasses] = useState<any[]>([]);
  const [impersonateChildren, setImpersonateChildren] = useState<UserProfile[]>([]);
  const [analytics, setAnalytics] = useState<{assignments: number, classes: number, materials: number, parentalControls: number}>({assignments: 0, classes: 0, materials: 0, parentalControls: 0});
  // Upload state and handler for admin video/material upload
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  // Dummy upload handler (replace with real upload logic)
  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadMessage(null);
    try {
      // TODO: Replace with actual upload logic (e.g., Supabase Storage, API call)
      await new Promise(res => setTimeout(res, 1200));
      setUploadMessage('Upload successful!');
      setUploadFile(null);
    } catch (err) {
      setUploadMessage('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [customPlans, setCustomPlans] = useState<CustomPlan[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatePlanOpen, setIsCreatePlanOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<CustomPlan | null>(null);
  const [newPlan, setNewPlan] = useState<{
    name: string;
    price: number;
    questions_limit: number;
    period: string;
    description: string;
    features: string;
    is_active: boolean;
  }>({
    name: '',
    price: 0,
    questions_limit: 0,
    period: 'per month',
    description: '',
    features: '',
    is_active: true
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersData, plansData, parentChildData, teacherClassData, analyticsData] = await Promise.all([
        dbHelpers.getAllUsers(),
        dbHelpers.getAllCustomPlans(),
        dbHelpers.getAllParentStudents?.() ?? [],
        dbHelpers.getAllTeacherClasses?.() ?? [],
        dbHelpers.getAdminAnalytics?.() ?? {assignments: 0, classes: 0, materials: 0, parentalControls: 0}
      ]);
      setUsers(usersData);
      setCustomPlans(plansData);
      setStudents(usersData.filter(u => (u.role as string) === 'student'));
      setTeachers(usersData.filter(u => (u.role as string) === 'teacher'));
      setParents(usersData.filter(u => (u.role as string) === 'parent'));
      setParentChild(parentChildData);
      setTeacherClass(teacherClassData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    
    if (user.role !== 'admin') {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      navigate('/');
      return;
    }
    
    loadData();
  }, [user, navigate, toast, loadData]);

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const planData = {
        ...newPlan,
        features: newPlan.features.split('\n').filter((f: string) => f.trim()),
        created_by: user!.id
      };

      const created = await dbHelpers.createCustomPlan(planData);
      if (created) {
        toast({
          title: "Plan Created",
          description: "Custom plan has been created successfully.",
          variant: "success",
        });
        setIsCreatePlanOpen(false);
        setNewPlan({
          name: '',
          price: 0,
          questions_limit: 0,
          period: 'per month',
          description: '',
          features: '',
          is_active: true
        });
        loadData();
      }
    } catch (error) {
      console.error('Error creating plan:', error);
      toast({
        title: "Error",
        description: "Failed to create custom plan.",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const updates = {
        ...editingPlan,
        features: typeof editingPlan.features === 'string'
          ? (editingPlan.features as string).split('\n').filter((f: string) => f.trim())
          : editingPlan.features
      };

      const updated = await dbHelpers.updateCustomPlan(editingPlan.id, updates);
      if (updated) {
        toast({
          title: "Plan Updated",
          description: "Custom plan has been updated successfully.",
          variant: "success",
        });
        setEditingPlan(null);
        loadData();
      }
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update custom plan.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      const deleted = await dbHelpers.deleteCustomPlan(planId);
      if (deleted) {
        toast({
          title: "Plan Deleted",
          description: "Custom plan has been deleted successfully.",
          variant: "success",
        });
        loadData();
      }
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast({
        title: "Error",
        description: "Failed to delete custom plan.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserPlan = async (userId: string, plan: string, questionsLimit?: number) => {
    try {
      const updated = await dbHelpers.updateUserPlan(userId, plan, questionsLimit);
      if (updated) {
        toast({
          title: "User Updated",
          description: "User plan has been updated successfully.",
          variant: "success",
        });
        loadData();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user plan.",
        variant: "destructive",
      });
    }
  };

  const handleMakeAdmin = async (userId: string) => {
    try {
      const updated = await dbHelpers.makeUserAdmin(userId);
      if (updated) {
        toast({
          title: "Admin Created",
          description: "User has been granted admin privileges.",
          variant: "success",
        });
        loadData();
      }
    } catch (error) {
      console.error('Error making user admin:', error);
      toast({
        title: "Error",
        description: "Failed to grant admin privileges.",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  // Tab navigation
  const tabList = [
    { key: 'overview', label: 'Overview' },
    { key: 'students', label: 'Students' },
    { key: 'teachers', label: 'Teachers' },
    { key: 'parents', label: 'Parents' },
    { key: 'impersonate', label: 'Impersonate' },
    { key: 'relationships', label: 'Relationships' },
    { key: 'analytics', label: 'Analytics' },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage users, plans, relationships, analytics, and system settings</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-4">
          {tabList.map(tab => (
            <Button
              key={tab.key}
              variant={activeTab === tab.key ? 'default' : 'outline'}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
            {/* ...existing code for stats overview and custom plans... */}
            {/* ...existing code... */}
          </>
        )}

        {/* Students Tab */}
        {activeTab === 'students' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Students
              </CardTitle>
              <CardDescription>Manage all student users</CardDescription>
            </CardHeader>
            <CardContent>
              <Input className="mb-2 w-64" placeholder="Search students..." value={studentSearch} onChange={e => setStudentSearch(e.target.value)} />
              <div className="space-y-4">
                {students.filter(s => s.name.toLowerCase().includes(studentSearch.toLowerCase())).map((student) => (
                  <div key={student.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{student.name}</h4>
                        <Badge variant="secondary">Student</Badge>
                        <Badge variant="outline">{student.plan.charAt(0).toUpperCase() + student.plan.slice(1)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Questions: {student.questions_remaining}</span>
                        <span>Joined: {new Date(student.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setImpersonateUser(student)}>Preview Dashboard</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Student</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this student? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                              await dbHelpers.deleteUserProfile(student.id);
                              toast({ title: "User Deleted", description: "Student has been deleted.", variant: "success" });
                              loadData();
                            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Teachers
              </CardTitle>
              <CardDescription>Manage all teacher users</CardDescription>
            </CardHeader>
            <CardContent>
              <Input className="mb-2 w-64" placeholder="Search teachers..." value={teacherSearch} onChange={e => setTeacherSearch(e.target.value)} />
              <div className="space-y-4">
                {teachers.filter(t => t.name.toLowerCase().includes(teacherSearch.toLowerCase())).map((teacher) => (
                  <div key={teacher.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{teacher.name}</h4>
                        <Badge variant="secondary">Teacher</Badge>
                        <Badge variant="outline">{teacher.plan.charAt(0).toUpperCase() + teacher.plan.slice(1)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{teacher.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Questions: {teacher.questions_remaining}</span>
                        <span>Joined: {new Date(teacher.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setImpersonateUser(teacher)}>Preview Dashboard</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Teacher</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this teacher? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                              await dbHelpers.deleteUserProfile(teacher.id);
                              toast({ title: "User Deleted", description: "Teacher has been deleted.", variant: "success" });
                              loadData();
                            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Parents Tab */}
        {activeTab === 'parents' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Parents
              </CardTitle>
              <CardDescription>Manage all parent users</CardDescription>
            </CardHeader>
            <CardContent>
              <Input className="mb-2 w-64" placeholder="Search parents..." value={parentSearch} onChange={e => setParentSearch(e.target.value)} />
              <div className="space-y-4">
                {parents.filter(p => p.name.toLowerCase().includes(parentSearch.toLowerCase())).map((parent) => (
                  <div key={parent.id} className="border rounded-lg p-4 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{parent.name}</h4>
                        <Badge variant="secondary">Parent</Badge>
                        <Badge variant="outline">{parent.plan.charAt(0).toUpperCase() + parent.plan.slice(1)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{parent.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Questions: {parent.questions_remaining}</span>
                        <span>Joined: {new Date(parent.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => setImpersonateUser(parent)}>Preview Dashboard</Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline"><Trash2 className="h-4 w-4" /></Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Parent</AlertDialogTitle>
                            <AlertDialogDescription>Are you sure you want to delete this parent? This action cannot be undone.</AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={async () => {
                              await dbHelpers.deleteUserProfile(parent.id);
                              toast({ title: "User Deleted", description: "Parent has been deleted.", variant: "success" });
                              loadData();
                            }} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impersonate Tab */}
        {activeTab === 'impersonate' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Impersonate User
              </CardTitle>
              <CardDescription>Preview dashboards as any user for troubleshooting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {[...students, ...teachers, ...parents, user].map(u => (
                <Button key={u.id} size="sm" variant="outline" onClick={() => {
                  // Only allow impersonateUser to be set if it has all UserProfile fields
                  if ('questions_remaining' in u && 'created_at' in u && 'updated_at' in u && 'last_free_reset' in u) {
                    setImpersonateUser(u as UserProfile);
                  }
                }}>
                    {u.name} <span className="ml-1 text-xs text-muted-foreground">({u.role})</span>
                  </Button>
                ))}
              </div>
              {impersonateUser && (
                <div className="border rounded-lg p-4 mt-4">
                  <h4 className="font-semibold mb-2">Previewing as: {impersonateUser.name} <Badge variant="secondary">{impersonateUser.role}</Badge></h4>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button size="sm" variant="outline" onClick={async () => {
                      await dbHelpers.resetUserPassword(impersonateUser.id);
                      toast({ title: "Password Reset", description: "Password reset email sent.", variant: "success" });
                    }}>Reset Password</Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingUser(impersonateUser)}>Change Plan</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      await dbHelpers.suspendUser(impersonateUser.id);
                      toast({ title: "User Suspended", description: "User has been suspended.", variant: "destructive" });
                      loadData();
                    }}>Suspend</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      await dbHelpers.reactivateUser(impersonateUser.id);
                      toast({ title: "User Reactivated", description: "User has been reactivated.", variant: "success" });
                      loadData();
                    }}>Reactivate</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      navigator.clipboard.writeText(impersonateUser.id);
                      toast({ title: "Copied", description: "User ID copied to clipboard.", variant: "success" });
                    }}>Copy User ID</Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      navigator.clipboard.writeText(impersonateUser.email);
                      toast({ title: "Copied", description: "Email copied to clipboard.", variant: "success" });
                    }}>Copy Email</Button>
                    <Button size="sm" variant="outline" onClick={async () => {
                      await dbHelpers.sendUserEmail(impersonateUser.id, "Admin Message", "This is a message from the admin.");
                      toast({ title: "Email Sent", description: "Email sent to user.", variant: "success" });
                    }}>Send Email</Button>
                  </div>
                  {(() => {
                    switch (impersonateUser.role) {
                      case 'student':
                        return <div>
                          <div className="font-semibold mb-1">Student Dashboard</div>
                          <div>Plan: <Badge variant="outline">{impersonateUser.plan}</Badge></div>
                          <div>Questions Remaining: {impersonateUser.questions_remaining}</div>
                          <div>Email: {impersonateUser.email}</div>
                          {/* No last_active property in UserProfile, so skip or use created_at */}
                          <div className="mt-2 text-sm text-muted-foreground">Joined: {new Date(impersonateUser.created_at).toLocaleString()}</div>
                          <div className="mt-2 text-sm">Assignments:</div>
                          <ul className="list-disc ml-6 text-sm">
                            {impersonateAssignments.length > 0 ? impersonateAssignments.map(a => <li key={a.id}>{a.title}</li>) : <li>No assignments</li>}
                          </ul>
                        </div>;
                      case 'teacher':
                        return <div>
                          <div className="font-semibold mb-1">Teacher Dashboard</div>
                          <div>Plan: <Badge variant="outline">{impersonateUser.plan}</Badge></div>
                          <div>Email: {impersonateUser.email}</div>
                          <div className="mt-2 text-sm text-muted-foreground">Joined: {new Date(impersonateUser.created_at).toLocaleString()}</div>
                          <div className="mt-2 text-sm">Classes:</div>
                          <ul className="list-disc ml-6 text-sm">
                            {impersonateClasses.length > 0 ? impersonateClasses.map(c => <li key={c.id}>{c.name}</li>) : <li>No classes</li>}
                          </ul>
                        </div>;
                      case 'parent':
                        return <div>
                          <div className="font-semibold mb-1">Parent Dashboard</div>
                          <div>Plan: <Badge variant="outline">{impersonateUser.plan}</Badge></div>
                          <div>Email: {impersonateUser.email}</div>
                          <div className="mt-2 text-sm text-muted-foreground">Joined: {new Date(impersonateUser.created_at).toLocaleString()}</div>
                          <div className="mt-2 text-sm">Children:</div>
                          <ul className="list-disc ml-6 text-sm">
                            {impersonateChildren.length > 0 ? impersonateChildren.map(child => <li key={child.id}>{child.name}</li>) : <li>No children</li>}
                          </ul>
                        </div>;
                      case 'admin':
                        return <div>
                          <div className="font-semibold mb-1">Admin Dashboard</div>
                          <div>Email: {impersonateUser.email}</div>
                          <div className="mt-2 text-sm text-muted-foreground">Joined: {new Date(impersonateUser.created_at).toLocaleString()}</div>
                        </div>;
                      default:
                        return <div>Unknown role.</div>;
                    }
                  })()}
                  {/* Change Plan Dialog */}
                  {editingUser && editingUser.id === impersonateUser.id && (
                    <Dialog open={!!editingUser} onOpenChange={() => setEditingUser(null)}>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle>Change User Plan</DialogTitle>
                          <DialogDescription>Update the plan for this user.</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="user-plan">Plan</Label>
                            <Select value={editingUser.plan} onValueChange={v => setEditingUser({ ...editingUser, plan: v })}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {customPlans.map(plan => <SelectItem key={plan.name} value={plan.name}>{plan.name}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="user-questions">Questions Limit</Label>
                            <Input id="user-questions" type="number" value={editingUser.questions_limit ?? ''} onChange={e => setEditingUser({ ...editingUser, questions_limit: parseInt(e.target.value) || 0 })} />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditingUser(null)}>Cancel</Button>
                          <Button onClick={async () => {
                            await handleUpdateUserPlan(editingUser.id, editingUser.plan, editingUser.questions_limit);
                            setEditingUser(null);
                          }}>Update</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              )}

  // Load impersonation preview data when impersonateUser changes
  useEffect(() => {
    if (!impersonateUser) {
      setImpersonateAssignments([]);
      setImpersonateClasses([]);
      setImpersonateChildren([]);
      return;
    }
    if (impersonateUser.role === 'student') {
      dbHelpers.getAssignmentsForStudent?.(impersonateUser.id).then(setImpersonateAssignments);
    } else if (impersonateUser.role === 'teacher') {
      dbHelpers.getClassesForTeacher?.(impersonateUser.id).then(setImpersonateClasses);
    } else if (impersonateUser.role === 'parent') {
      const children = parentChild.filter(rel => rel.parent_id === impersonateUser.id).map(rel => students.find(s => s.id === rel.student_id)).filter(Boolean) as UserProfile[];
      setImpersonateChildren(children);
    }
  }, [impersonateUser, parentChild, students]);
            </CardContent>
          </Card>
        )}

        {/* Relationships Tab */}
        {activeTab === 'relationships' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Relationships
              </CardTitle>
              <CardDescription>Manage parent-child and teacher-class relationships</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <h4 className="font-semibold mb-2">Parent-Child Relationships</h4>
                <ul className="list-disc ml-6">
                  {parentChild.map(rel => (
                    <li key={rel.id} className="flex items-center gap-2">
                      {rel.parent_name} <span className="text-xs">(parent)</span> → {rel.student_name} <span className="text-xs">(student)</span>
                      <Button size="sm" variant="outline" onClick={async () => {
                        await dbHelpers.removeParentStudent?.(rel.parent_id, rel.student_id); loadData();
                      }}>Remove</Button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-2">
                  <Select onValueChange={v => setNewParentId(v)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Select Parent" /></SelectTrigger>
                    <SelectContent>
                      {parents.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select onValueChange={v => setNewStudentId(v)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Select Student" /></SelectTrigger>
                    <SelectContent>
                      {students.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" onClick={async () => {
                    if (newParentId && newStudentId) {
                      await dbHelpers.addParentStudent?.(newParentId, newStudentId); loadData();
                    }
                  }}>Add</Button>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-2">Teacher-Class Relationships</h4>
                <ul className="list-disc ml-6">
                  {teacherClass.map(rel => (
                    <li key={rel.id} className="flex items-center gap-2">
                      {rel.teacher_name} <span className="text-xs">(teacher)</span> → {rel.class_name} <span className="text-xs">(class)</span>
                      <Button size="sm" variant="outline" onClick={async () => {
                        await dbHelpers.removeTeacherClass?.(rel.teacher_id, rel.class_id); loadData();
                      }}>Remove</Button>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mt-2">
                  <Select onValueChange={v => setNewTeacherId(v)}>
                    <SelectTrigger className="w-40"><SelectValue placeholder="Select Teacher" /></SelectTrigger>
                    <SelectContent>
                      {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input className="w-40" placeholder="Class Name" value={newClassName} onChange={e => setNewClassName(e.target.value)} />
                  <Button size="sm" onClick={async () => {
                    if (newTeacherId && newClassName) {
                      await dbHelpers.addTeacherClass?.(newTeacherId, newClassName); loadData();
                    }
                  }}>Add</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Platform Analytics
              </CardTitle>
              <CardDescription>Platform-wide stats for assignments, classes, materials, and parental controls</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="mb-4" variant="outline" onClick={() => {
                const csv = [
                  ['Assignments', 'Classes', 'Materials', 'Parental Controls'],
                  [analytics.assignments, analytics.classes, analytics.materials, analytics.parentalControls]
                ].map(row => row.join(',')).join('\n');
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'platform-analytics.csv';
                a.click();
                URL.revokeObjectURL(url);
              }}>Download CSV</Button>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="font-semibold">Assignments</div>
                  <div className="text-2xl">{analytics.assignments}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="font-semibold">Classes</div>
                  <div className="text-2xl">{analytics.classes}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="font-semibold">Materials</div>
                  <div className="text-2xl">{analytics.materials}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="font-semibold">Parental Controls</div>
                  <div className="text-2xl">{analytics.parentalControls}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Edit Plan Dialog */}
        {editingPlan && (
          <Dialog open={!!editingPlan} onOpenChange={() => setEditingPlan(null)}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Custom Plan</DialogTitle>
                <DialogDescription>
                  Update the custom plan details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-plan-name">Plan Name</Label>
                  <Input
                    id="edit-plan-name"
                    value={editingPlan.name}
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-plan-price">Price (KES)</Label>
                  <Input
                    id="edit-plan-price"
                    type="number"
                    value={editingPlan.price}
                    onChange={(e) => setEditingPlan({ ...editingPlan, price: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-questions-limit">Questions Limit</Label>
                  <Input
                    id="edit-questions-limit"
                    type="number"
                    value={editingPlan.questions_limit}
                    onChange={(e) => setEditingPlan({ ...editingPlan, questions_limit: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-plan-period">Billing Period</Label>
                  <Select 
                    value={editingPlan.period} 
                    onValueChange={(value) => setEditingPlan({ ...editingPlan, period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per month">Per Month</SelectItem>
                      <SelectItem value="per year">Per Year</SelectItem>
                      <SelectItem value="one-time">One-time</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-plan-description">Description</Label>
                  <Input
                    id="edit-plan-description"
                    value={editingPlan.description}
                    onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-plan-features">Features (one per line)</Label>
                  <Textarea
                    id="edit-plan-features"
                    value={Array.isArray(editingPlan.features) ? editingPlan.features.join('\n') : editingPlan.features}
                    onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split('\n').filter(f => f.trim()) })}
                    rows={4}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="edit-plan-active"
                    checked={editingPlan.is_active}
                    onCheckedChange={(checked) => setEditingPlan({ ...editingPlan, is_active: checked })}
                  />
                  <Label htmlFor="edit-plan-active">Active Plan</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setEditingPlan(null)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdatePlan}>Update Plan</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}
