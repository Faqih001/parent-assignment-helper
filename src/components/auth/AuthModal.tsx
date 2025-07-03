import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2 } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
  onForgotPassword: (email: string) => Promise<void>;
  isLoginLoading?: boolean;
  isRegisterLoading?: boolean;
  defaultTab?: 'login' | 'register';
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister, 
  onForgotPassword, 
  isLoginLoading = false, 
  isRegisterLoading = false, 
  defaultTab = 'login' 
}: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [loginForm, setLoginForm] = useState({ email: "", password: "", rememberMe: false });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  // Load remembered email on component mount and reset forms when modal opens
  useEffect(() => {
    if (isOpen) {
      const rememberMe = localStorage.getItem('rememberMe') === 'true';
      const rememberedEmail = localStorage.getItem('rememberedEmail') || '';
      
      if (rememberMe && rememberedEmail) {
        setLoginForm(prev => ({
          ...prev,
          email: rememberedEmail,
          rememberMe: true
        }));
      } else {
        // Reset forms when modal opens
        setLoginForm({ email: "", password: "", rememberMe: false });
      }
      setRegisterForm({ name: "", email: "", password: "" });
      setShowForgotPassword(false);
      setForgotPasswordEmail("");
      setShowPassword(false);
      setValidationErrors({});
    }
  }, [isOpen]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const validateName = (name: string) => {
    return name.trim().length >= 2;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Client-side validation
    const errors: {[key: string]: string} = {};
    if (!validateEmail(loginForm.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!validatePassword(loginForm.password)) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    if (!isLoginLoading && loginForm.email && loginForm.password) {
      try {
        await onLogin(loginForm.email, loginForm.password, loginForm.rememberMe);
        // Clear form on successful login
        setLoginForm({ email: "", password: "", rememberMe: false });
      } catch (error) {
        console.error('Login form error:', error);
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    // Client-side validation
    const errors: {[key: string]: string} = {};
    if (!validateName(registerForm.name)) {
      errors.name = "Name must be at least 2 characters";
    }
    if (!validateEmail(registerForm.email)) {
      errors.email = "Please enter a valid email address";
    }
    if (!validatePassword(registerForm.password)) {
      errors.password = "Password must be at least 6 characters";
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    if (!isRegisterLoading && registerForm.name && registerForm.email && registerForm.password) {
      try {
        await onRegister(registerForm.name, registerForm.email, registerForm.password);
        // Clear form on successful registration
        setRegisterForm({ name: "", email: "", password: "" });
      } catch (error) {
        console.error('Register form error:', error);
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});
    
    if (!validateEmail(forgotPasswordEmail)) {
      setValidationErrors({ forgotEmail: "Please enter a valid email address" });
      return;
    }
    
    if (!isLoginLoading && forgotPasswordEmail) {
      try {
        await onForgotPassword(forgotPasswordEmail);
        setShowForgotPassword(false);
        setForgotPasswordEmail("");
      } catch (error) {
        console.error('Forgot password error:', error);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-w-[95vw] w-full mx-auto max-h-[90vh] overflow-y-auto animate-scale-in">
        <DialogHeader className="px-2">
          <DialogTitle className="bg-gradient-primary bg-clip-text text-transparent text-lg sm:text-xl">
            Welcome to HomeworkHelper
          </DialogTitle>
          <DialogDescription className="text-sm">
            Start your journey to stress-free homework assistance
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login" className="text-xs sm:text-sm">Login</TabsTrigger>
            <TabsTrigger value="register" className="text-xs sm:text-sm">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <Card className="border-0 shadow-soft">
              <CardHeader className="space-y-1 px-4 py-3">
                <CardTitle className="text-lg sm:text-xl">Sign in</CardTitle>
                <CardDescription className="text-sm">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="your@email.com"
                        className={`pl-10 text-sm ${validationErrors.email ? 'border-destructive' : ''}`}
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        disabled={isLoginLoading}
                        required
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-destructive">{validationErrors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className={`pl-10 pr-10 text-sm ${validationErrors.password ? 'border-destructive' : ''}`}
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        disabled={isLoginLoading}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoginLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-destructive">{validationErrors.password}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="remember-me"
                        checked={loginForm.rememberMe}
                        onCheckedChange={(checked) => 
                          setLoginForm({ ...loginForm, rememberMe: checked === true })
                        }
                        disabled={isLoginLoading}
                      />
                      <Label htmlFor="remember-me" className="text-sm text-muted-foreground cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    <Button
                      type="button"
                      variant="link"
                      className="text-sm p-0 h-auto font-normal text-primary hover:text-primary/80"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotPasswordEmail(loginForm.email);
                      }}
                      disabled={isLoginLoading}
                    >
                      Forgot password?
                    </Button>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full text-sm" 
                    variant="hero"
                    disabled={isLoginLoading || !loginForm.email || !loginForm.password}
                  >
                    {isLoginLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        Sign In
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <Card className="border-0 shadow-soft">
              <CardHeader className="space-y-1 px-4 py-3">
                <CardTitle className="text-lg sm:text-xl">Create account</CardTitle>
                <CardDescription className="text-sm">
                  Join thousands of families improving homework time
                </CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="register-name" className="text-sm">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-name"
                        type="text"
                        placeholder="Your full name"
                        className={`pl-10 text-sm ${validationErrors.name ? 'border-destructive' : ''}`}
                        value={registerForm.name}
                        onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                        disabled={isRegisterLoading}
                        required
                      />
                    </div>
                    {validationErrors.name && (
                      <p className="text-sm text-destructive">{validationErrors.name}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="your@email.com"
                        className="pl-10 text-sm"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        disabled={isRegisterLoading}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="register-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10 pr-10 text-sm"
                        value={registerForm.password}
                        onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                        disabled={isRegisterLoading}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-3"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isRegisterLoading}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full text-sm" 
                    variant="hero"
                    disabled={isRegisterLoading || !registerForm.name || !registerForm.email || !registerForm.password}
                  >
                    {isRegisterLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create Account
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Forgot Password Modal */}
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogContent className="sm:max-w-md max-w-[95vw] w-full mx-auto">
            <DialogHeader>
              <DialogTitle className="bg-gradient-primary bg-clip-text text-transparent">
                Reset Password
              </DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="forgot-email" className="text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="forgot-email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-10 text-sm"
                    value={forgotPasswordEmail}
                    onChange={(e) => setForgotPasswordEmail(e.target.value)}
                    disabled={isLoginLoading}
                    required
                  />
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-sm"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setForgotPasswordEmail("");
                  }}
                  disabled={isLoginLoading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 text-sm" 
                  variant="hero"
                  disabled={isLoginLoading || !forgotPasswordEmail}
                >
                  {isLoginLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
}