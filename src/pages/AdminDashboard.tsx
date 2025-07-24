import { useState, useEffect } from "react";
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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { dbHelpers, UserProfile, CustomPlan } from "@/lib/supabase";
import { Settings, Users, CreditCard, Plus, Edit, Trash2, Shield, UserCheck, Building, Crown } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
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
  }, [user, navigate, toast]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, plansData] = await Promise.all([
        dbHelpers.getAllUsers(),
        dbHelpers.getAllCustomPlans()
      ]);
      setUsers(usersData);
      setCustomPlans(plansData);
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
  };

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

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-8 w-8" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage users, plans, and system settings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
        <CardContent>
          <p className="mb-4 text-muted-foreground">Manage users, plans, and upload learning materials for the platform.</p>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Upload Videos & Materials</h3>
            <input type="file" accept="video/*,application/pdf" className="mb-2" />
            <Button variant="outline" className="mb-4">Upload</Button>
            <p className="text-xs text-muted-foreground">(Coming soon: Video/material upload will be saved to the platform for teachers and students.)</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Update Plan Prices</h3>
            <Button variant="outline">Edit Prices</Button>
            <p className="text-xs text-muted-foreground">(Coming soon: Admins will be able to update plan prices and features.)</p>
          </div>
        </CardContent>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Users</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.plan === 'free').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Users</CardTitle>
              <Crown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {users.filter(u => u.plan !== 'free').length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Custom Plans</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customPlans.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Custom Plans Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Custom Plans
                </CardTitle>
                <CardDescription>Create and manage custom pricing plans</CardDescription>
              </div>
              <Dialog open={isCreatePlanOpen} onOpenChange={setIsCreatePlanOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Plan
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Create Custom Plan</DialogTitle>
                    <DialogDescription>
                      Create a new custom pricing plan for enterprise customers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="plan-name">Plan Name</Label>
                      <Input
                        id="plan-name"
                        value={newPlan.name}
                        onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                        placeholder="e.g., School Enterprise"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-price">Price (KES)</Label>
                      <Input
                        id="plan-price"
                        type="number"
                        value={newPlan.price}
                        onChange={(e) => setNewPlan({ ...newPlan, price: parseInt(e.target.value) || 0 })}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label htmlFor="questions-limit">Questions Limit</Label>
                      <Input
                        id="questions-limit"
                        type="number"
                        value={newPlan.questions_limit}
                        onChange={(e) => setNewPlan({ ...newPlan, questions_limit: parseInt(e.target.value) || 0 })}
                        placeholder="100"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-period">Billing Period</Label>
                      <Select 
                        value={newPlan.period} 
                        onValueChange={(value) => setNewPlan({ ...newPlan, period: value })}
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
                      <Label htmlFor="plan-description">Description</Label>
                      <Input
                        id="plan-description"
                        value={newPlan.description}
                        onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                        placeholder="Brief description of the plan"
                      />
                    </div>
                    <div>
                      <Label htmlFor="plan-features">Features (one per line)</Label>
                      <Textarea
                        id="plan-features"
                        value={newPlan.features}
                        onChange={(e) => setNewPlan({ ...newPlan, features: e.target.value })}
                        placeholder="Unlimited questions&#10;Priority support&#10;Custom integrations"
                        rows={4}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="plan-active"
                        checked={newPlan.is_active}
                        onCheckedChange={(checked) => setNewPlan({ ...newPlan, is_active: checked })}
                      />
                      <Label htmlFor="plan-active">Active Plan</Label>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreatePlanOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreatePlan}>Create Plan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {customPlans.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No custom plans created yet. Create your first plan above.
                </p>
              ) : (
                customPlans.map((plan) => (
                  <div key={plan.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{plan.name}</h4>
                          <Badge variant={plan.is_active ? "default" : "secondary"}>
                            {plan.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{plan.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span>KES {plan.price} {plan.period}</span>
                          <span>{plan.questions_limit} questions</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingPlan(plan)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this plan? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDeletePlan(plan.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users Management
            </CardTitle>
            <CardDescription>View and manage all registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((userProfile) => (
                <div key={userProfile.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{userProfile.name}</h4>
                        <Badge variant={userProfile.role === 'admin' ? "destructive" : "secondary"}>
                          {userProfile.role === 'admin' ? 'Admin' : 'User'}
                        </Badge>
                        <Badge variant="outline">
                          {userProfile.plan.charAt(0).toUpperCase() + userProfile.plan.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{userProfile.email}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Questions: {userProfile.questions_remaining}</span>
                        <span>Joined: {new Date(userProfile.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={userProfile.plan}
                        onValueChange={(value) => handleUpdateUserPlan(userProfile.id, value)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="free">Free</SelectItem>
                          <SelectItem value="family">Family</SelectItem>
                          <SelectItem value="premium">Premium</SelectItem>
                          <SelectItem value="enterprise">Enterprise</SelectItem>
                        </SelectContent>
                      </Select>
                      {userProfile.role !== 'admin' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMakeAdmin(userProfile.id)}
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

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
                    onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value as any })}
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
