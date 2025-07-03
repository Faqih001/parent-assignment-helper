import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { User, Mail, Camera, Save, Shield, Crown, Users, Trash2 } from "lucide-react";
import { supabase, dbHelpers } from "@/lib/supabase";

export default function Profile() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Please log in to view your profile.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getPlanInfo = (plan: string) => {
    switch (plan) {
      case "free":
        return {
          name: "Free Plan",
          icon: <Shield className="h-4 w-4" />,
          color: "secondary",
          description: "5 questions per day",
          features: ["5 homework questions daily", "Basic AI assistance", "Community support"]
        };
      case "family":
        return {
          name: "Family Plan",
          icon: <Users className="h-4 w-4" />,
          color: "default",
          description: "Unlimited questions for family",
          features: ["Unlimited homework questions", "Priority AI assistance", "Multiple child profiles", "Email support"]
        };
      case "premium":
        return {
          name: "Premium Plan",
          icon: <Crown className="h-4 w-4" />,
          color: "outline",
          description: "Unlimited questions + premium features",
          features: ["Unlimited homework questions", "Advanced AI tutoring", "Study plans", "Progress tracking", "Priority support"]
        };
      default:
        return {
          name: "Unknown Plan",
          icon: <Shield className="h-4 w-4" />,
          color: "secondary",
          description: "",
          features: []
        };
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      // Update user profile in database
      const updatedProfile = await dbHelpers.updateUserProfile(user.id, {
        name: formData.name,
        email: formData.email,
      });

      if (updatedProfile) {
        // Update email in Supabase Auth if changed
        if (formData.email !== user.email) {
          const { error } = await supabase.auth.updateUser({
            email: formData.email
          });
          
          if (error) {
            throw new Error("Failed to update email in authentication system");
          }
        }

        await refreshUser();
        toast({
          title: "Profile Updated!",
          description: "Your profile information has been successfully updated.",
          variant: "success",
        });
      }
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Delete user profile from database
      await dbHelpers.deleteUserProfile(user.id);
      
      // Delete user from Supabase Auth
      const { error } = await supabase.auth.admin.deleteUser(user.id);
      
      if (error) {
        throw new Error("Failed to delete account");
      }

      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
        variant: "success",
      });
      
      // User will be logged out automatically by auth state change
    } catch (error: any) {
      console.error("Account deletion error:", error);
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const planInfo = getPlanInfo(user.plan);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your account information and preferences</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-2 border-primary/20">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="bg-gradient-primary text-white font-semibold text-lg">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <Button variant="outline" size="sm" disabled>
                    <Camera className="h-4 w-4 mr-2" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your full name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      placeholder="Enter your email"
                      className="pl-10"
                    />
                  </div>
                </div>

                <Button 
                  onClick={handleSaveProfile} 
                  disabled={isLoading}
                  className="w-full"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Plan Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {planInfo.icon}
                Current Plan
              </CardTitle>
              <CardDescription>Your subscription details and usage</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">{planInfo.name}</h3>
                  <p className="text-sm text-muted-foreground">{planInfo.description}</p>
                </div>
                <Badge variant={planInfo.color as any} className="flex items-center gap-1">
                  {planInfo.icon}
                  {user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}
                </Badge>
              </div>

              {user.plan === "free" && user.questionsRemaining !== undefined && (
                <div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Questions remaining today:</span>
                    <span className="font-medium text-primary">{user.questionsRemaining}/5</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 mt-2">
                    <div 
                      className="bg-gradient-primary h-2 rounded-full transition-all duration-300" 
                      style={{ width: `${(user.questionsRemaining / 5) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Plan Features</h4>
                <ul className="space-y-1">
                  {planInfo.features.map((feature, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {user.plan === "free" && (
                <Button variant="outline" className="w-full">
                  Upgrade Plan
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Danger Zone */}
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions for your account</CardDescription>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your account
                    and remove all your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDeleteAccount}
                    disabled={isLoading}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isLoading ? "Deleting..." : "Delete Account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
