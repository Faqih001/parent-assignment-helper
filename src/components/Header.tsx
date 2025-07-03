import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, BookOpen, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useAuthModal } from "@/hooks/useAuthModal";
import AuthModal from "@/components/auth/AuthModal";
import UserMenu from "@/components/auth/UserMenu";
import logo from "@/assets/logo.png";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, login, register, logout, forgotPassword, isLoginLoading, isRegisterLoading } = useAuth();
  const { isAuthModalOpen, defaultTab, openAuthModal, closeAuthModal } = useAuthModal();

  const handleLogin = async (email: string, password: string, rememberMe?: boolean) => {
    console.log('Header handleLogin called');
    const success = await login(email, password, rememberMe);
    console.log('Login result:', success);
    if (success) {
      console.log('Closing auth modal after successful login');
      closeAuthModal(); // Close modal on successful login
    } else {
      console.log('Login failed, modal remains open');
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    const success = await register(name, email, password);
    if (success) {
      closeAuthModal(); // Close modal on successful registration
    }
  };

  const handleForgotPassword = async (email: string) => {
    const success = await forgotPassword(email);
    if (success) {
      // Modal will close automatically after success toast or show success state
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { name: "Home", path: "/" },
    { name: "How It Works", path: "/how-it-works" },
    { name: "Pricing", path: "/pricing" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img src={logo} alt="HomeworkHelper" className="h-8 w-8" />
            <span className="font-bold text-xl bg-gradient-primary bg-clip-text text-transparent">
              HomeworkHelper
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link to="/chat">
                  <Button variant="outline" size="sm">
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Chat
                  </Button>
                </Link>
                <UserMenu user={user} onLogout={logout} />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={openAuthModal}>
                  Login
                </Button>
                <Button variant="hero" size="sm" onClick={openAuthModal}>
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button and User Avatar */}
          <div className="md:hidden flex items-center space-x-3">
            {user && <UserMenu user={user} onLogout={logout} />}
            <button
              className="p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                {user ? (
                  <>
                    <div className="px-3 py-2 text-sm text-muted-foreground border-b">
                      Signed in as {user.name}
                    </div>
                    <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                      <Button variant="outline" size="sm" className="w-full">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Chat
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => { openAuthModal(); setIsMenuOpen(false); }}>
                      Login
                    </Button>
                    <Button variant="hero" size="sm" className="w-full" onClick={() => { openAuthModal(); setIsMenuOpen(false); }}>
                      Get Started
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onForgotPassword={handleForgotPassword}
        isLoginLoading={isLoginLoading}
        isRegisterLoading={isRegisterLoading}
        defaultTab={defaultTab}
      />
    </header>
  );
}