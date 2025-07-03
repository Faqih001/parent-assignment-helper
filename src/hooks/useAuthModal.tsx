import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './useAuth';

interface AuthModalContextType {
  isAuthModalOpen: boolean;
  defaultTab: 'login' | 'register';
  openAuthModal: () => void;
  closeAuthModal: () => void;
  openRegisterModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextType | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [defaultTab, setDefaultTab] = useState<'login' | 'register'>('login');
  const { user } = useAuth();

  // Auto-close modal when user logs in successfully
  useEffect(() => {
    if (user && isAuthModalOpen) {
      console.log('AuthModal: User authenticated, closing modal');
      setIsAuthModalOpen(false);
    }
  }, [user, isAuthModalOpen]);

  const openAuthModal = () => {
    setDefaultTab('login');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    console.log('AuthModal: Closing modal');
    setIsAuthModalOpen(false);
  };

  const openRegisterModal = () => {
    setDefaultTab('register');
    setIsAuthModalOpen(true);
  };

  return (
    <AuthModalContext.Provider value={{ 
      isAuthModalOpen, 
      defaultTab,
      openAuthModal, 
      closeAuthModal, 
      openRegisterModal 
    }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);
  if (context === undefined) {
    throw new Error('useAuthModal must be used within an AuthModalProvider');
  }
  return context;
}

// Export the default tab for the modal to use
export { AuthModalProvider as default };
