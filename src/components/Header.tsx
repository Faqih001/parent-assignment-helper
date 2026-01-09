import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { user, login, register, logout, forgotPassword, isLoginLoading, isRegisterLoading } = useAuth();
  const { isAuthModalOpen, defaultTab, openAuthModal, closeAuthModal } = useAuthModal();

  // Auto-close modal when user successfully logs in and redirect to home
  useEffect(() => {
    if (user && isAuthModalOpen) {
      console.log('Header: User authenticated, closing modal and redirecting');
      closeAuthModal();
      // Redirect to home page after successful login if not already there
      if (location.pathname !== '/') {
        navigate('/');
      }
    }
  }, [user, isAuthModalOpen, closeAuthModal, navigate, location.pathname]);

  const handleLogin = async (email: string, password: string, rememberMe?: boolean) => {
    console.log('Header: Starting login process');
    try {
      const success = await login(email, password, rememberMe);
      console.log('Header: Login result received:', success);
      if (success) {
        console.log('Header: Login successful, closing modal and redirecting');
        closeAuthModal();
        // Navigate to chat page after successful login
        navigate('/chat');
      } else {
        console.log('Header: Login failed, keeping modal open');
      }
    } catch (error) {
      console.error('Header: Login error:', error);
    }
  };

  const handleRegister = async (name: string, email: string, password: string) => {
    try {
      const success = await register(name, email, password);
      if (success) {
        console.log('Header: Registration successful, closing modal and redirecting');
        closeAuthModal();
        // Navigate to chat page after successful registration
        navigate('/chat');
      }
    } catch (error) {
      console.error('Header: Registration error:', error);
    }
  };

  const handleForgotPassword = async (email: string) => {
    const success = await forgotPassword(email);
    if (success) {
      // Keep the modal open but close the forgot password sub-modal
      // The success toast will provide feedback
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
      <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-1.5 sm:space-x-2 flex-shrink-0">
            <img src={logo} alt="HomeworkHelper" className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className="font-bold text-base sm:text-lg lg:text-xl bg-gradient-primary bg-clip-text text-transparent whitespace-nowrap">
              HomeworkHelper
            </span>
          </Link>

          {/* Tablet/Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`px-2 xl:px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.path)
                    ? "bg-primary text-primary-foreground"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop/Tablet User Actions */}
          <div className="hidden lg:flex items-center space-x-2 xl:space-x-3 flex-shrink-0">
            {user ? (
              <>
                <Link to="/chat">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <MessageCircle className="mr-1.5 h-4 w-4" />
                    <span className="hidden xl:inline">Chat</span>
                  </Button>
                </Link>
                <Link to="/video">
                  <Button variant="outline" size="sm" className="whitespace-nowrap">
                    <BookOpen className="mr-1.5 h-4 w-4" />
                    <span className="hidden xl:inline">Video</span>
                  </Button>
                </Link>
                <UserMenu user={user} onLogout={logout} />
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" onClick={openAuthModal} className="whitespace-nowrap">
                  Login
                </Button>
                <Button variant="hero" size="sm" onClick={openAuthModal} className="whitespace-nowrap">
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile/Tablet Menu Button and Quick Actions */}
          <div className="flex lg:hidden items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {user && (
              <>
                <Link to="/chat" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <MessageCircle className="h-4 w-4" />
                    <span className="sr-only">Chat</span>
                  </Button>
                </Link>
                <Link to="/video" className="hidden sm:block">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                    <BookOpen className="h-4 w-4" />
                    <span className="sr-only">Video Library</span>
                  </Button>
                </Link>
                <div className="hidden sm:block">
                  <UserMenu user={user} onLogout={logout} />
                </div>
              </>
            )}
            <button
              className="p-1.5 sm:p-2 hover:bg-accent hover:text-accent-foreground rounded-md transition-colors flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile/Tablet Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-background/95 backdrop-blur animate-in slide-in-from-top-2 duration-200">
            <div className="px-2 sm:px-3 pt-2 pb-3 space-y-1 max-h-[calc(100vh-4rem)] overflow-y-auto">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block px-3 py-2.5 rounded-md text-sm sm:text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? "bg-primary text-primary-foreground"
                      : "text-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {user && (
                <div className="pt-2 space-y-2 border-t mt-2">
                  <Link to="/chat" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Chat
                    </Button>
                  </Link>
                  <Link to="/video" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full justify-start">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Video Library
                    </Button>
                  </Link>
                  <div className="sm:hidden pt-2">
                    <UserMenu user={user} onLogout={logout} />
                  </div>
                </div>
              )}
              
              {!user && (
                <div className="pt-4 space-y-2 border-t mt-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => { openAuthModal(); setIsMenuOpen(false); }}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="hero" 
                    size="sm" 
                    className="w-full" 
                    onClick={() => { openAuthModal(); setIsMenuOpen(false); }}
                  >
                    Get Started
                  </Button>
                </div>
              )}
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